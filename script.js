/**
 * WorkTrack — script.js
 * Quản lý giờ làm & tính tăng ca
 *
 * Hướng dẫn kết nối Supabase:
 * 1. Vào https://supabase.com và tạo project mới
 * 2. Vào Settings → API → lấy Project URL và anon key
 * 3. Thay 2 giá trị bên dưới vào SUPABASE_URL và SUPABASE_KEY
 * 4. Vào SQL Editor trong Supabase và chạy lệnh SQL tạo bảng (xem README)
 */

// =============================================
// ⚠️  CẤU HÌNH SUPABASE — THAY GIÁ TRỊ TẠI ĐÂY
// =============================================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';
// =============================================

// Khởi tạo Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Lưu user hiện tại
let currentUser = null;

// =============================================
// KHỞI TẠO ỨNG DỤNG
// =============================================
async function init() {
  // Lấy session hiện tại
  const { data: { session } } = await db.auth.getSession();

  if (session) {
    currentUser = session.user;
    showApp();
  } else {
    showAuth();
  }

  // Lắng nghe thay đổi auth state
  db.auth.onAuthStateChange((_event, session) => {
    if (session) {
      currentUser = session.user;
      showApp();
    } else {
      currentUser = null;
      showAuth();
    }
  });

  // Điền giá trị mặc định filter tháng/năm hiện tại
  initFilters();

  // Cập nhật preview tăng ca khi thay đổi input
  ['f-start', 'f-scheduled', 'f-real'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateOvertimePreview);
  });
}

// =============================================
// HIỂN THỊ AUTH / APP
// =============================================
function showAuth() {
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('app-screen').classList.remove('active');
}

function showApp() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  document.getElementById('user-email-display').textContent = currentUser?.email || '';
  loadLogs();
}

// =============================================
// AUTH: ĐĂNG KÝ / ĐĂNG NHẬP / ĐĂNG XUẤT
// =============================================

/** Chuyển tab login/register */
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  setAuthMsg('');
}

/** Đăng ký tài khoản mới */
async function register() {
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!email || !password) return setAuthMsg('Vui lòng điền đầy đủ thông tin.');
  if (password.length < 6) return setAuthMsg('Mật khẩu tối thiểu 6 ký tự.');

  const { error } = await db.auth.signUp({ email, password });
  if (error) return setAuthMsg(error.message);
  setAuthMsg('Đăng ký thành công! Kiểm tra email để xác nhận.', true);
}

/** Đăng nhập */
async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) return setAuthMsg('Vui lòng điền đầy đủ thông tin.');

  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return setAuthMsg('Email hoặc mật khẩu không đúng.');
}

/** Đăng xuất */
async function logout() {
  await db.auth.signOut();
}

/** Hiển thị thông báo auth */
function setAuthMsg(msg, success = false) {
  const el = document.getElementById('auth-msg');
  el.textContent = msg;
  el.className = 'auth-msg' + (success ? ' success' : '');
}

// =============================================
// BỘ LỌC THÁNG / NĂM
// =============================================

/** Điền năm vào dropdown và set tháng/năm hiện tại */
function initFilters() {
  const now = new Date();
  const yearSel = document.getElementById('filter-year');
  const currentYear = now.getFullYear();

  // Tạo dropdown năm (5 năm trước đến 1 năm sau)
  for (let y = currentYear - 4; y <= currentYear + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    yearSel.appendChild(opt);
  }

  // Set tháng hiện tại
  document.getElementById('filter-month').value = now.getMonth() + 1;

  yearSel.addEventListener('change', loadLogs);
}

/** Lấy tháng và năm đang chọn */
function getSelectedPeriod() {
  return {
    month: parseInt(document.getElementById('filter-month').value),
    year:  parseInt(document.getElementById('filter-year').value),
  };
}

// =============================================
// CRUD: TẢI DỮ LIỆU
// =============================================

/** Tải danh sách work_logs theo tháng/năm */
async function loadLogs() {
  if (!currentUser) return;

  const { month, year } = getSelectedPeriod();

  // Tính khoảng ngày đầu và cuối tháng
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to   = new Date(year, month, 0).toISOString().slice(0, 10); // ngày cuối tháng

  const { data, error } = await db
    .from('work_logs')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });

  if (error) {
    showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    return;
  }

  renderTable(data || []);
  renderStats(data || []);
}

// =============================================
// RENDER BẢNG DỮ LIỆU
// =============================================

/** Render rows vào bảng */
function renderTable(logs) {
  const tbody = document.getElementById('log-tbody');
  tbody.innerHTML = '';

  if (logs.length === 0) {
    tbody.innerHTML = '<tr id="empty-row"><td colspan="6" class="empty-cell">Chưa có dữ liệu cho tháng này.</td></tr>';
    return;
  }

  logs.forEach(log => {
    const tr = document.createElement('tr');
    const ot = parseFloat(log.overtime_hours) || 0;

    tr.innerHTML = `
      <td>${formatDate(log.date)}</td>
      <td>${log.start_time}</td>
      <td>${log.scheduled_end_time}</td>
      <td>${log.real_end_time}</td>
      <td>
        <span class="ot-badge ${ot === 0 ? 'zero' : ''}">
          ${ot > 0 ? '+' : ''}${ot.toFixed(1)}h
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openModal('${log.id}')">Sửa</button>
          <button class="btn-del"  onclick="deleteLog('${log.id}')">Xóa</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/** Format ngày YYYY-MM-DD → DD/MM/YYYY */
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// =============================================
// RENDER THỐNG KÊ
// =============================================
function renderStats(logs) {
  const totalOT  = logs.reduce((sum, l) => sum + (parseFloat(l.overtime_hours) || 0), 0);
  const days     = logs.length;
  const avgOT    = days > 0 ? totalOT / days : 0;

  document.getElementById('stat-days').textContent    = days;
  document.getElementById('stat-overtime').textContent = `${totalOT.toFixed(1)}h`;
  document.getElementById('stat-avg').textContent     = `${avgOT.toFixed(1)}h`;
}

// =============================================
// MODAL: THÊM / SỬA
// =============================================

/** Mở modal. Nếu có id → mode sửa, không có → mode thêm */
async function openModal(id = null) {
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('edit-id').value = '';

  if (id) {
    // Mode sửa: tải dữ liệu bản ghi
    document.getElementById('modal-title').textContent = 'Sửa ca làm việc';
    const { data, error } = await db.from('work_logs').select('*').eq('id', id).single();
    if (error || !data) { showToast('Không tìm thấy bản ghi.', 'error'); return; }

    document.getElementById('edit-id').value      = data.id;
    document.getElementById('f-date').value       = data.date;
    document.getElementById('f-start').value      = data.start_time;
    document.getElementById('f-scheduled').value  = data.scheduled_end_time;
    document.getElementById('f-real').value       = data.real_end_time;
  } else {
    // Mode thêm: điền ngày hôm nay
    document.getElementById('modal-title').textContent = 'Thêm ca làm việc';
    document.getElementById('f-date').value       = new Date().toISOString().slice(0, 10);
    document.getElementById('f-start').value      = '09:00';
    document.getElementById('f-scheduled').value  = '18:00';
    document.getElementById('f-real').value       = '18:00';
  }

  updateOvertimePreview();
}

/** Đóng modal */
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

/** Đóng modal khi click ra ngoài */
function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// =============================================
// TÍNH TĂNG CA
// =============================================

/**
 * Tính số giờ tăng ca
 * Overtime = giờ ra thực tế - giờ tan ca lịch
 * Nếu thực tế <= lịch thì = 0
 */
function calcOvertime(scheduled, real) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const diff = toMinutes(real) - toMinutes(scheduled);
  return diff > 0 ? +(diff / 60).toFixed(2) : 0;
}

/** Cập nhật preview tăng ca trong modal */
function updateOvertimePreview() {
  const scheduled = document.getElementById('f-scheduled').value;
  const real      = document.getElementById('f-real').value;
  if (!scheduled || !real) return;
  const ot = calcOvertime(scheduled, real);
  document.getElementById('preview-val').textContent = `${ot.toFixed(1)} giờ`;
}

// =============================================
// LƯU DỮ LIỆU (thêm hoặc sửa)
// =============================================
async function saveLog() {
  const id        = document.getElementById('edit-id').value;
  const date      = document.getElementById('f-date').value;
  const start     = document.getElementById('f-start').value;
  const scheduled = document.getElementById('f-scheduled').value;
  const real      = document.getElementById('f-real').value;

  // Validate
  if (!date || !start || !scheduled || !real) {
    showToast('Vui lòng điền đầy đủ thông tin.', 'error');
    return;
  }

  const overtime_hours = calcOvertime(scheduled, real);

  const payload = {
    user_id:             currentUser.id,
    date,
    start_time:          start,
    scheduled_end_time:  scheduled,
    real_end_time:       real,
    overtime_hours,
  };

  let error;

  if (id) {
    // Cập nhật bản ghi hiện có
    ({ error } = await db.from('work_logs').update(payload).eq('id', id));
  } else {
    // Thêm bản ghi mới
    ({ error } = await db.from('work_logs').insert(payload));
  }

  if (error) {
    showToast('Lỗi lưu dữ liệu: ' + error.message, 'error');
    return;
  }

  showToast(id ? 'Cập nhật thành công!' : 'Thêm ca thành công!', 'success');
  closeModal();
  loadLogs();
}

// =============================================
// XÓA BẢN GHI
// =============================================

/** Xóa một bản ghi */
async function deleteLog(id) {
  if (!confirm('Bạn có chắc muốn xóa ca này?')) return;

  const { error } = await db.from('work_logs').delete().eq('id', id);
  if (error) { showToast('Lỗi xóa: ' + error.message, 'error'); return; }

  showToast('Đã xóa ca làm việc.', 'success');
  loadLogs();
}

/** Xóa toàn bộ dữ liệu của tháng đang xem */
async function deleteMonth() {
  const { month, year } = getSelectedPeriod();
  if (!confirm(`Xóa toàn bộ dữ liệu tháng ${month}/${year}? Hành động này không thể hoàn tác.`)) return;

  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to   = new Date(year, month, 0).toISOString().slice(0, 10);

  const { error } = await db
    .from('work_logs')
    .delete()
    .eq('user_id', currentUser.id)
    .gte('date', from)
    .lte('date', to);

  if (error) { showToast('Lỗi xóa: ' + error.message, 'error'); return; }

  showToast(`Đã xóa tất cả ca tháng ${month}/${year}.`, 'success');
  loadLogs();
}

// =============================================
// XUẤT CSV
// =============================================
async function exportCSV() {
  const { month, year } = getSelectedPeriod();
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to   = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data, error } = await db
    .from('work_logs')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });

  if (error || !data?.length) {
    showToast('Không có dữ liệu để xuất.', 'error');
    return;
  }

  // Tạo nội dung CSV
  const headers = ['Ngày', 'Giờ vào', 'Giờ ra lịch', 'Giờ ra thực tế', 'Tăng ca (giờ)'];
  const rows = data.map(l => [
    formatDate(l.date),
    l.start_time,
    l.scheduled_end_time,
    l.real_end_time,
    l.overtime_hours,
  ]);

  // Tổng cộng
  const totalOT = data.reduce((s, l) => s + (parseFloat(l.overtime_hours) || 0), 0);
  rows.push(['', '', '', 'TỔNG TĂNG CA', totalOT.toFixed(1)]);

  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${v}"`).join(','))
    .join('\n');

  // Tải file
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `worktrack_${year}_${String(month).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Xuất CSV thành công!', 'success');
}

// =============================================
// TOAST NOTIFICATION
// =============================================
let toastTimer = null;

function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 3000);
}

// =============================================
// KHỞI ĐỘNG
// =============================================
window.addEventListener('DOMContentLoaded', init);
