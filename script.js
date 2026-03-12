/**
 * WorkTrack — script.js
 * Lưu dữ liệu bằng localStorage, không cần đăng nhập, không cần server.
 * Mở file index.html trên bất kỳ trình duyệt nào là dùng được.
 */

// Key lưu trong localStorage
const STORAGE_KEY = 'worktrack_logs';

// =============================================
// KHỞI TẠO
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  initFilters();
  renderAll();

  // Cập nhật preview tăng ca realtime khi đổi giờ
  ['f-scheduled', 'f-real'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateOvertimePreview);
  });
});

// =============================================
// BỘ LỌC THÁNG / NĂM
// =============================================
function initFilters() {
  const now = new Date();
  const monthSel = document.getElementById('filter-month');
  const yearSel  = document.getElementById('filter-year');

  // Tạo dropdown tháng
  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                      'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  monthNames.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = name;
    if (i + 1 === now.getMonth() + 1) opt.selected = true;
    monthSel.appendChild(opt);
  });

  // Tạo dropdown năm (5 năm trước → 1 năm sau)
  for (let y = now.getFullYear() - 4; y <= now.getFullYear() + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === now.getFullYear()) opt.selected = true;
    yearSel.appendChild(opt);
  }

  monthSel.addEventListener('change', renderAll);
  yearSel.addEventListener('change',  renderAll);
}

function getSelectedPeriod() {
  return {
    month: parseInt(document.getElementById('filter-month').value),
    year:  parseInt(document.getElementById('filter-year').value),
  };
}

// =============================================
// LOCALSTORAGE HELPERS
// =============================================

/** Lấy toàn bộ logs */
function getAllLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/** Lưu toàn bộ logs */
function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

/** Lấy logs của tháng đang chọn */
function getLogsForPeriod(month, year) {
  return getAllLogs()
    .filter(l => {
      const d = new Date(l.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

// =============================================
// TÍNH TĂNG CA
// =============================================

/**
 * Overtime = giờ ra thực - giờ ra lịch (tính bằng giờ)
 * Nếu thực tế <= lịch thì = 0
 */
function calcOvertime(scheduled, real) {
  const toMin = t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const diff = toMin(real) - toMin(scheduled);
  return diff > 0 ? +(diff / 60).toFixed(2) : 0;
}

function updateOvertimePreview() {
  const scheduled = document.getElementById('f-scheduled').value;
  const real      = document.getElementById('f-real').value;
  if (!scheduled || !real) return;
  const ot = calcOvertime(scheduled, real);
  document.getElementById('preview-val').textContent = `${ot.toFixed(1)} giờ`;
}

// =============================================
// RENDER
// =============================================
function renderAll() {
  const { month, year } = getSelectedPeriod();
  const logs = getLogsForPeriod(month, year);
  renderTable(logs);
  renderStats(logs);
}

function renderTable(logs) {
  const tbody = document.getElementById('log-tbody');
  tbody.innerHTML = '';

  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">Chưa có dữ liệu cho tháng này.</td></tr>';
    return;
  }

  logs.forEach(log => {
    const ot = parseFloat(log.overtime_hours) || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(log.date)}</td>
      <td>${log.start_time}</td>
      <td>${log.scheduled_end_time}</td>
      <td>${log.real_end_time}</td>
      <td><span class="ot-badge ${ot === 0 ? 'zero' : ''}">${ot > 0 ? '+' : ''}${ot.toFixed(1)}h</span></td>
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

function renderStats(logs) {
  const totalOT = logs.reduce((s, l) => s + (parseFloat(l.overtime_hours) || 0), 0);
  const days    = logs.length;
  const avg     = days > 0 ? totalOT / days : 0;

  document.getElementById('stat-days').textContent    = days;
  document.getElementById('stat-overtime').textContent = `${totalOT.toFixed(1)}h`;
  document.getElementById('stat-avg').textContent     = `${avg.toFixed(1)}h`;
}

// Format YYYY-MM-DD → DD/MM/YYYY
function formatDate(d) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// =============================================
// MODAL
// =============================================
function openModal(id = null) {
  document.getElementById('edit-id').value = '';

  if (id) {
    // Mode sửa
    const log = getAllLogs().find(l => l.id === id);
    if (!log) return;
    document.getElementById('modal-title').textContent  = 'Sửa ca làm việc';
    document.getElementById('edit-id').value            = log.id;
    document.getElementById('f-date').value             = log.date;
    document.getElementById('f-start').value            = log.start_time;
    document.getElementById('f-scheduled').value        = log.scheduled_end_time;
    document.getElementById('f-real').value             = log.real_end_time;
  } else {
    // Mode thêm
    document.getElementById('modal-title').textContent = 'Thêm ca làm việc';
    document.getElementById('f-date').value            = new Date().toISOString().slice(0, 10);
    document.getElementById('f-start').value           = '09:00';
    document.getElementById('f-scheduled').value       = '18:00';
    document.getElementById('f-real').value            = '18:00';
  }

  updateOvertimePreview();
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// =============================================
// LƯU (thêm / sửa)
// =============================================
function saveLog() {
  const id        = document.getElementById('edit-id').value;
  const date      = document.getElementById('f-date').value;
  const start     = document.getElementById('f-start').value;
  const scheduled = document.getElementById('f-scheduled').value;
  const real      = document.getElementById('f-real').value;

  if (!date || !start || !scheduled || !real) {
    showToast('Vui lòng điền đầy đủ thông tin.', 'error');
    return;
  }

  const overtime_hours = calcOvertime(scheduled, real);
  let logs = getAllLogs();

  if (id) {
    // Cập nhật
    logs = logs.map(l => l.id === id
      ? { ...l, date, start_time: start, scheduled_end_time: scheduled, real_end_time: real, overtime_hours }
      : l
    );
    showToast('Đã cập nhật ca làm việc!', 'success');
  } else {
    // Thêm mới với id ngẫu nhiên
    logs.push({
      id: crypto.randomUUID(),
      date,
      start_time:          start,
      scheduled_end_time:  scheduled,
      real_end_time:       real,
      overtime_hours,
      created_at:          new Date().toISOString(),
    });
    showToast('Đã thêm ca làm việc!', 'success');
  }

  saveLogs(logs);
  closeModal();
  renderAll();
}

// =============================================
// XÓA
// =============================================
function deleteLog(id) {
  if (!confirm('Xóa ca này?')) return;
  saveLogs(getAllLogs().filter(l => l.id !== id));
  showToast('Đã xóa.', 'success');
  renderAll();
}

function deleteMonth() {
  const { month, year } = getSelectedPeriod();
  if (!confirm(`Xóa toàn bộ dữ liệu tháng ${month}/${year}?`)) return;

  saveLogs(getAllLogs().filter(l => {
    const d = new Date(l.date);
    return !(d.getMonth() + 1 === month && d.getFullYear() === year);
  }));

  showToast(`Đã xóa tháng ${month}/${year}.`, 'success');
  renderAll();
}

// =============================================
// XUẤT CSV
// =============================================
function exportCSV() {
  const { month, year } = getSelectedPeriod();
  const logs = getLogsForPeriod(month, year);

  if (!logs.length) {
    showToast('Không có dữ liệu để xuất.', 'error');
    return;
  }

  const headers = ['Ngày', 'Giờ vào', 'Giờ ra lịch', 'Giờ ra thực tế', 'Tăng ca (giờ)'];
  const rows    = logs.map(l => [
    formatDate(l.date), l.start_time, l.scheduled_end_time, l.real_end_time, l.overtime_hours
  ]);

  const totalOT = logs.reduce((s, l) => s + (parseFloat(l.overtime_hours) || 0), 0);
  rows.push(['', '', '', 'TỔNG TĂNG CA', totalOT.toFixed(1)]);

  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `worktrack_${year}_${String(month).padStart(2,'0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Xuất CSV thành công!', 'success');
}

// =============================================
// TOAST
// =============================================
let toastTimer;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}
