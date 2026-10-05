# Octavia — Concert Management System

ระบบบริหารจัดการคอนเสิร์ต (SA กลุ่ม T01)

| โฟลเดอร์ | เนื้อหา |
|---|---|
| [`frontend/`](frontend/README.md) | React + TypeScript + Vite |
| [`backend/`](backend/README.md) | Go + Fiber + GORM + PostgreSQL |
| [`docs/`](docs/) | เอกสาร, diagram, ตัวอย่าง UI, บัญชีทดสอบ |

## รันทั้งระบบ

```bash
cd backend && docker compose up -d && cp .env.example .env && go run ./cmd/server
cd frontend && npm install && cp .env.example .env && npm run dev
```

เปิด http://localhost:5173 — บัญชีทดสอบอยู่ที่ [docs/test-accounts.md](docs/test-accounts.md)

## ผู้จัดทำและระบบที่รับผิดชอบ

| รหัสนักศึกษา | ระบบ | โฟลเดอร์ frontend |
|---|---|---|
| [B6707651](docs/team/B6707651.md) | จัดการข้อมูลคอนเสิร์ต, จัดการศิลปินและการแสดง | `features/concert`, `features/artist` |
| [B6708856](docs/team/B6708856.md) | ลงทะเบียนเข้างาน, วางแผนการจำหน่ายบัตร | `features/eventRegistration`, `features/ticketPlanning` |
| [B6717537](docs/team/B6717537.md) | จัดการโปรโมชั่น, จัดการผู้ใช้งานและสิทธิ์ | `features/promotion`, `features/userManagement` |
| [B6728786](docs/team/B6728786.md) | จองบัตร, ชำระเงิน | `features/booking` |
| [B6733377](docs/team/B6733377.md) | ประสานงานภายนอก, รายงานและสรุปผล | `features/contact`, `features/report` |

โครงสร้างโฟลเดอร์ถูกจัดใหม่เมื่อ 2026-10 — ถ้ามี branch เก่าค้างอยู่ ดู [docs/RESTRUCTURE.md](docs/RESTRUCTURE.md)
