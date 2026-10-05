# Octavia — Frontend

React 19 + TypeScript + Vite + MUI

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173 (proxy /api → http://127.0.0.1:8080)
npm test           # vitest (watch); ใช้ `npx vitest run` สำหรับรันครั้งเดียว
npm run build      # tsc -b && vite build
npm run lint       # oxlint
```

## โครงสร้างโฟลเดอร์

```
src/
├── main.tsx            entry ของ Vite
├── app/                App.tsx (กำหนด route ทั้งหมด), App.css
├── theme/              MUI theme
├── layouts/            โครงหน้าที่ใช้ร่วมกัน
│   ├── backoffice/     Layout, Header, Sidebar, PromotionLayout ของฝั่งพนักงาน
│   └── customer/       CustomerHeader ของฝั่งลูกค้า
├── shared/             ของที่ใช้ข้ามหลายระบบ (components/, utils/)
├── assets/             รูปภาพ (assets/poster ห้ามย้าย — backend seed อ่านไฟล์จากที่นี่)
└── features/           หนึ่งโฟลเดอร์ต่อหนึ่งระบบย่อย
    ├── auth/              เข้าสู่ระบบ / สิทธิ์การเข้าถึง (access/)
    ├── userManagement/    ระบบจัดการผู้ใช้งานและการกำหนดสิทธิ์
    ├── promotion/         ระบบจัดการโปรโมชั่นคอนเสิร์ต
    ├── concert/           ระบบจัดการข้อมูลคอนเสิร์ต + หน้าแสดงคอนเสิร์ตฝั่งลูกค้า
    ├── artist/            ระบบจัดการศิลปินและการแสดง
    ├── booking/           ระบบจองบัตร + ระบบชำระเงิน
    ├── contact/           ระบบประสานงานภายนอก (ติดต่อ - สอบถาม)
    ├── report/            ระบบรายงานและสรุปผล
    ├── eventRegistration/ ระบบลงทะเบียนเข้างาน
    └── ticketPlanning/    ระบบวางแผนการจำหน่ายบัตร
```

ภายในแต่ละ feature แบ่งเป็น `api/`, `components/`, `pages/`, `hooks/`, `types/`, `utils/`, `data/` ตามที่จำเป็น

## ข้อตกลง

- import ภายในโปรเจกต์ใช้ alias `@/` เสมอ เช่น `import { concertApi } from '@/features/concert/api/concertApi'`
- หน้าแต่ละหน้าเป็นโฟลเดอร์ PascalCase ที่มี `index.tsx` เช่น `features/promotion/pages/PromotionList/index.tsx`
- ไฟล์ทดสอบ `*.test.ts(x)` วางคู่กับไฟล์ที่ทดสอบ
- ของที่ใช้แค่ระบบเดียวให้อยู่ใน feature นั้น; ย้ายเข้า `shared/` เมื่อมีมากกว่าหนึ่ง feature ใช้
