# การจัดโครงสร้างโฟลเดอร์ใหม่ (2026-10)

ไม่มีการเปลี่ยนพฤติกรรมของระบบ — ย้ายไฟล์และแก้ path ของ import เท่านั้น
ตารางการย้ายไฟล์ฝั่ง frontend ทั้งหมดอยู่ใน `frontend/scripts/restructure/moves/*.json`

## สรุปการเปลี่ยนแปลง

- frontend: `src/pages`, `src/components`, `src/api`, `src/utils`, `src/types`, `src/hooks`, `src/data`, `src/access`
  ถูกแยกเข้า `src/features/<ระบบ>/` (ดู frontend/README.md); `App.tsx` → `src/app/App.tsx`
- frontend: import ภายในทั้งหมดเปลี่ยนเป็น alias `@/...`
- frontend: ลบโค้ดที่ไม่ถูกใช้ (`src/auth`, `src/interface`, `src/services`, `features/registration`, `features/venueSeats` ฯลฯ)
- backend: `cmd/server/<tool>` → `cmd/<tool>`; ลบ `database/` ที่ไม่ถูกใช้; เลิก commit ไฟล์ `.exe`
- เอกสาร: `B67xxxxx.md`, `diagram/`, `ui-example/`, `MANAGEMENT.md`, `REPORT_DATA.md`, `test.md` → `docs/`

## ย้าย branch เก่าของตัวเองมาโครงสร้างใหม่

```bash
git fetch origin
git checkout <branch-ของคุณ>
git merge origin/main
```

Git ตรวจจับการ rename ได้เอง — การแก้ไขในไฟล์เดิมจะตามไปอยู่ในไฟล์ที่ย้ายแล้ว
ถ้ามี conflict ให้แก้ตามปกติ (ส่วนใหญ่จะเป็นบรรทัด import) แล้วรัน:

```bash
cd frontend
node scripts/restructure/to-alias.mjs
for f in scripts/restructure/moves/*.json; do node scripts/restructure/move.mjs --rewrite-only "$f"; done
npx tsc -b && npx vitest run
```

คำสั่งชุดนี้แปลง import ที่ยังชี้ path เก่าให้เป็น path ใหม่โดยไม่ย้ายไฟล์

ไฟล์ใหม่ที่คุณสร้างไว้ในโฟลเดอร์เก่า (เช่น `src/pages/Employee/NewPage/`) จะไม่ถูกย้ายอัตโนมัติ —
ให้ `git mv` เข้า `src/features/<ระบบของคุณ>/pages/` เอง แล้วรัน `npx tsc -b` เพื่อเช็ก

บน Windows ถ้า `git mv` โฟลเดอร์แล้วขึ้น `Permission denied` (มักเกิดจาก VS Code เปิดไฟล์ในโฟลเดอร์นั้นอยู่)
`move.mjs` จะย้ายทีละไฟล์ให้เอง และรันซ้ำได้โดยข้ามรายการที่ย้ายไปแล้ว
