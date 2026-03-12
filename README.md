# WorkTrack — Hướng Dẫn Cài Đặt

## 📁 Cấu trúc project
```
work-tracker/
├── index.html    ← Giao diện chính
├── style.css     ← Toàn bộ CSS
├── script.js     ← Logic + Supabase API
└── README.md     ← Hướng dẫn này
```

---

## 🗄️ Bước 1: Tạo Supabase Project

1. Truy cập **https://supabase.com** → Đăng ký tài khoản miễn phí
2. Click **"New Project"** → Điền tên project và mật khẩu database → **Create Project**
3. Đợi khoảng 1–2 phút để project khởi tạo

---

## 🔑 Bước 2: Lấy API Keys

1. Vào **Settings** (icon bánh răng bên trái) → **API**
2. Copy hai giá trị:
   - **Project URL** (dạng `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (chuỗi dài bắt đầu bằng `eyJ...`)
3. Mở file `script.js` và thay vào:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // ← dán URL vào đây
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';                    // ← dán anon key vào đây
```

---

## 🧱 Bước 3: Tạo bảng trong Database

1. Trong Supabase dashboard, vào **SQL Editor** (icon database bên trái)
2. Click **"New Query"**
3. Dán và chạy đoạn SQL sau:

```sql
-- Tạo bảng work_logs
CREATE TABLE work_logs (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date               DATE NOT NULL,
  start_time         TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  real_end_time      TIME NOT NULL,
  overtime_hours     NUMERIC(4,2) DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- Bật Row Level Security (bảo mật từng user chỉ thấy data của mình)
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Policy: user chỉ được xem data của mình
CREATE POLICY "Users can view own logs"
  ON work_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: user chỉ được thêm data cho mình
CREATE POLICY "Users can insert own logs"
  ON work_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: user chỉ được sửa data của mình
CREATE POLICY "Users can update own logs"
  ON work_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: user chỉ được xóa data của mình
CREATE POLICY "Users can delete own logs"
  ON work_logs FOR DELETE
  USING (auth.uid() = user_id);
```

4. Click **"Run"** — bạn sẽ thấy thông báo thành công.

---

## ✉️ Bước 4: Cấu hình Email (cho tính năng đăng ký)

> Mặc định Supabase yêu cầu xác nhận email. Để bỏ qua trong môi trường dev:

1. Vào **Authentication** → **Providers** → **Email**
2. Tắt **"Confirm email"** → Save

---

## 🚀 Bước 5: Deploy lên Netlify

### Cách 1: Kéo thả (đơn giản nhất)
1. Truy cập **https://netlify.com** → Đăng nhập
2. Kéo thả **toàn bộ thư mục `work-tracker/`** vào vùng deploy
3. Netlify sẽ tự động tạo URL cho app

### Cách 2: Qua GitHub
1. Tạo repository GitHub mới, push 3 file lên
2. Trong Netlify → **"Import from Git"** → Chọn repo
3. Build settings: để trống (site tĩnh không cần build)
4. Click **"Deploy"**

### Cách 3: Netlify CLI
```bash
npm install -g netlify-cli
cd work-tracker/
netlify deploy --prod
```

---

## ✅ Kiểm tra hoạt động

Sau khi deploy:
1. Mở URL app
2. Đăng ký tài khoản mới
3. Kiểm tra email (hoặc bỏ qua nếu đã tắt confirm email)
4. Đăng nhập và thêm ca làm việc thử

---

## 🔒 Bảo mật

- Anon key trong `script.js` là **public key** — an toàn để để trong frontend
- Row Level Security (RLS) đảm bảo mỗi user chỉ truy cập được data của chính họ
- Không bao giờ dùng **service_role key** trong frontend

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `Invalid API key` | Sai SUPABASE_KEY | Kiểm tra lại anon key trong script.js |
| `relation "work_logs" does not exist` | Chưa chạy SQL | Chạy lại đoạn SQL ở Bước 3 |
| `new row violates row-level security` | RLS chưa cấu hình đúng | Chạy lại toàn bộ SQL bao gồm phần CREATE POLICY |
| Đăng ký xong không vào được | Email chưa xác nhận | Tắt "Confirm email" trong Supabase Auth settings |
