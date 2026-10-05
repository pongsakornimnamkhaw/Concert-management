# Octavia — Backend

Go + Fiber + GORM + PostgreSQL

## เริ่มต้นใช้งาน

```bash
docker compose up -d          # PostgreSQL :5432 และ pgAdmin :8081 (ดู compose.yml)
cp .env.example .env
go run ./cmd/server           # API ที่ http://localhost:8080 — migrate และ seed บัญชีเดโมให้อัตโนมัติ
go test ./...
```

บัญชีทดสอบ: [docs/test-accounts.md](../docs/test-accounts.md)

## โครงสร้างโฟลเดอร์

```
cmd/
├── server/              API server (main.go) + poster seed
├── check-demo-data/     ตรวจข้อมูลเดโมในฐานข้อมูล
├── seed-customer-demo/  seed ข้อมูลลูกค้า/บัตรเดโม       (go run ./cmd/seed-customer-demo --apply)
├── seed-employees/      seed บัญชีพนักงานเดโม           (go run ./cmd/seed-employees --apply)
├── seed-management/     seed โปรโมชั่น/พนักงานเดโม       (go run ./cmd/seed-management --apply)
└── seed-reports/        seed ข้อมูลรายงาน               (go run ./cmd/seed-reports --apply)
internal/
├── access/              สิทธิ์การเข้าถึงโมดูลของพนักงาน
├── config/              โหลด .env และเชื่อมต่อฐานข้อมูล
├── eventregistration/   API ระบบลงทะเบียนเข้างาน
├── handlers/            HTTP handlers ของระบบอื่น ๆ
├── mailer/              ส่งอีเมล (SMTP หรือ log ลง console)
├── models/              GORM models + AutoMigrate
├── seed/                ข้อมูลเริ่มต้น (บัญชีเดโม)
└── ticketplanning/      API ระบบวางแผนการจำหน่ายบัตร
tests/                   integration tests ของ API
```

ทุกคำสั่ง `go run ./cmd/...` ต้องรันจากโฟลเดอร์ `backend` (เครื่องมือ seed อ่าน `.env` จาก working directory)

เอกสารเพิ่มเติม: [docs/backend/MANAGEMENT.md](../docs/backend/MANAGEMENT.md), [docs/backend/REPORT_DATA.md](../docs/backend/REPORT_DATA.md)
