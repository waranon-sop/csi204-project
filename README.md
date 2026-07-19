# Re-wear - แพลตฟอร์มส่งต่อเสื้อผ้ามือสอง 

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&style=flat-square)](https://nextjs.org/)
[![Status](https://img.shields.io/badge/Status-Development-blue?style=flat-square)](#)

> ️ **Circular Fashion:** โครงการนี้จัดทำขึ้นเพื่อประกอบการเรียนวิชา **CSI204 ดิจิทัลแพลตฟอร์มสำหรับพัฒนาซอฟต์แวร์** โดยเป็นระบบ e-Commerce แพลตฟอร์มสำหรับการส่งต่อเสื้อผ้ามือสอง

---

## สารบัญ (Table of Contents)
- [รายละเอียดโครงการ](#-รายละเอียดโครงการ)
- [วัตถุประสงค์ของโครงการ](#-วัตถุประสงค์ของโครงการ)
- [หลักการและเหตุผล (Rationale)](#-หลักการและเหตุผล-rationale)
- [ขอบเขตของระบบ (System Scope)](#-ขอบเขตของระบบ-system-scope)
- [ฟีเจอร์หลักของระบบ](#-ฟีเจอร์หลักของระบบ)
- [แผนการดำเนินงาน (Work Plan)](#-แผนการดำเนินงาน-work-plan)
- [แนวทางการทดสอบระบบ (Testing Approach)](#-แนวทางการทดสอบระบบ-testing-approach)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจกต์จริง (Next.js Frontend)](#-โครงสร้างโปรเจกต์จริง-nextjs-frontend)
- [คู่มือการเปิดใช้งานและทดสอบระบบสิทธิ์](#-คู่มือการเปิดใช้งานและทดสอบระบบสิทธิ์)
- [ลิงก์ที่เกี่ยวข้อง](#-ลิงก์ที่เกี่ยวข้อง)
- [ผู้จัดทำ](#-ผู้จัดทำ)

---

## รายละเอียดโครงการ

| หัวข้อ | รายละเอียด |
|---|---|
| ชื่อโครงการ | Re-wear (แพลตฟอร์มส่งต่อเสื้อผ้ามือสอง) |
| ผู้จัดทำ | 1. นางสาวพิมพ์มาดา คงดี / 67154952<br>2. นายวรานนท์ โสปรก / 67155008<br>3. นายณัฐพงศ์ หาญชัยภา / 67152565 |
| วิชา | CSI204 Digital Platform for Software Development |
| วันที่จัดทำ | 4 กรกฎาคม 2026 |

---

## วัตถุประสงค์ของโครงการ

- **ศึกษาและฝึกปฏิบัติ** การพัฒนาเว็บแอปพลิเคชัน
- ️ **เรียนรู้การประยุกต์ใช้** เครื่องมือในกระบวนการ SDLC
- **ฝึกการทำงานร่วมกัน** ผ่าน Git และ GitHub

---

## หลักการและเหตุผล (Rationale)

> *"เพราะแฟชั่นไม่จำเป็นต้องทำร้ายโลก"*

ในปัจจุบันอุตสาหกรรมแฟชั่นส่งผลกระทบต่อสิ่งแวดล้อมอย่างมาก การนำเสื้อผ้ามือสองกลับมาหมุนเวียนใช้ใหม่ (Circular Fashion) จึงเป็นทางเลือกที่ยั่งยืน โครงการ **Re-wear** ถูกพัฒนาขึ้นเพื่อเป็นตัวกลางในการส่งต่อเสื้อผ้ามือสองคุณภาพดี โดยมีเป้าหมายเพื่อ:
- **ลดปริมาณขยะแฟชั่น**
- **สร้างคอมมูนิตี้** สำหรับผู้ที่ใส่ใจสิ่งแวดล้อม
- **อำนวยความสะดวก** ในการซื้อขายผ่านแพลตฟอร์มที่ใช้งานง่าย

---

## ขอบเขตของระบบ (System Scope)

ระบบประกอบด้วยฟังก์ชันหลักสำหรับ 3 กลุ่มผู้ใช้งาน ได้แก่:
1. **ลูกค้า (Customer):** สมัครสมาชิก, ค้นหา/ดูรายละเอียดสินค้า, จัดการตะกร้าสินค้า, สั่งซื้อ, ชำระเงิน (Mockup), ติดตามสถานะคำสั่งซื้อและดูประวัติ
2. **พนักงาน (Staff):** จัดการสินค้า, ตรวจสอบและอัปเดตสถานะคำสั่งซื้อ, ยืนยันการชำระเงิน, ตรวจสอบสต็อก
3. **ผู้ดูแลระบบ (Admin):** จัดการสิทธิ์การใช้งาน, ดูแลข้อมูลผู้ใช้, และดูรายงานสรุป (Dashboard)

---

## ฟีเจอร์หลักของระบบ

- [x] ระบบสมัครสมาชิก / ค้นหาเสื้อผ้า
- [x] ระบบตะกร้าสินค้า / สั่งซื้อ
- [x] ระบบจัดการสต็อกเสื้อผ้ามือสอง / อัปเดตออเดอร์ (พนักงาน)
- [x] ระบบบริหารจัดการเว็บ / จัดการสิทธิ์พนักงาน (ผู้ดูแลระบบ)
- [x] Dashboard และดูแลความปลอดภัยระบบ

---

## แผนการดำเนินงาน (Work Plan)

| สัปดาห์ | กิจกรรม | รายละเอียด |
|---|---|---|
| 1 | Planning & Analysis | จัดทำ Project Charter, วิเคราะห์ความต้องการ, สรุป Use Case และกำหนด SLA |
| 2 | System Design | ออกแบบ UX/UI (Figma), จัดทำ Class/Sequence/Architecture Diagram และ Database Schema |
| 3 | Development | พัฒนา Frontend (Next.js) และ Backend พร้อมจำลองระบบและสิทธิ์ผู้ใช้ |
| 4 | Testing & Deployment | ทดสอบระบบ (UAT), เผยแพร่ผ่าน GitHub และนำเสนอผลงาน |

---

## แนวทางการทดสอบระบบ (Testing Approach)

- **ประเภทการทดสอบ:** User Acceptance Testing (UAT)
- **วิธีการ:** Manual Testing ตามฟังก์ชันที่พัฒนา
- **รายละเอียด:** ทดสอบการทำงานของระบบด้วยตนเอง (Re-Tester) โดยจำลองพฤติกรรมการใช้งานของ Customer, Staff และ Admin เพื่อเปรียบเทียบผลลัพธ์ที่ได้กับสิ่งที่คาดหวัง และปรับปรุงตาม SLA ที่กำหนดไว้

---

## ️ เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | **Next.js 15** (App Router + React) |
| Styling | Tailwind CSS v3 (Earth Tone Style Guide Mapped) |
| Icons | Lucide React |
| Image Optimization | next/image (Automatic WebP + Lazy Load) |
| Version Control | Git + GitHub |
| เครื่องมือช่วยพัฒนา | Figma, Draw.io / Lucidchart |

---

## โครงสร้างโปรเจกต์จริง (Next.js Frontend)

```
re-wear/
├── src/
│ ├── app/ # หน้าทั้งหมด (App Router) — แต่ละโฟลเดอร์ = 1 URL
│ │ ├── page.jsx # หน้าแรก (Homepage)
│ │ ├── product/[id]/ # หน้ารายละเอียดสินค้า (Dynamic Route)
│ │ ├── search/ # หน้าผลการค้นหา
│ │ ├── orders/ # หน้าประวัติการสั่งซื้อ
│ │ ├── wardrobe/ # หน้าตู้เสื้อผ้า
│ │ ├── profile/ # หน้าตั้งค่าโปรไฟล์
│ │ ├── payment/ # หน้าช่องทางชำระเงิน
│ │ ├── eco-impact/ # หน้าแดชบอร์ดรักษ์โลก
│ │ └── layout.jsx # Layout หลัก (Navbar + Footer ครอบทุกหน้า)
│ ├── components/ # คอมโพเนนต์ที่ใช้ซ้ำ (Navbar, Footer, Sidebar, CartDrawer)
│ ├── context/ # Global State (CartContext, UserContext)
│ ├── data/ # ข้อมูล Mock (products.js)
│ └── styles/ # ไฟล์ CSS หลัก
├── docs/ # เอกสารวิเคราะห์และออกแบบระบบ
├── next.config.mjs # ตั้งค่า Next.js (Image Optimization)
├── tailwind.config.js # ตั้งค่าระบบสี Earth Tone
└── package.json # รายชื่อปลั๊กอินและสคริปต์
```

---

## คู่มือการเปิดใช้งานและทดสอบระบบสิทธิ์

### 1. วิธีเปิดใช้งานโปรเจกต์ภายในเครื่อง (Local Run)
1. ติดตั้ง Dependencies พื้นฐานทั้งหมด:
 ```bash
 npm install
 ```
2. เริ่มเซิร์ฟเวอร์สำหรับพัฒนาในเครื่อง:
 ```bash
 npm run dev
 ```
3. เปิดบราวเซอร์ไปที่ลิงก์: [http://localhost:3000](http://localhost:3000)

### 2. การทดสอบสิทธิ์ผู้ใช้งาน (Role-Based Login)
ระบบใช้การ **Login จริง** เพื่อทดสอบสิทธิ์แต่ละบทบาท โดยไปที่หน้า `/login` แล้วเลือก Login ตามบทบาทที่ต้องการ:

| บทบาท | Email | Password | สิทธิ์การเข้าถึง |
|---|---|---|---|
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin` | เข้าได้ทุกหน้า (Dashboard, Inventory, Orders, Users, Settings) |
| **พนักงาน (Staff)** | `staff` | `staff` | เข้าได้เฉพาะ Inventory และ Orders เท่านั้น |
| **ลูกค้า (Customer)** | ลงทะเบียนผ่าน `/register` | - | เข้าถึงหน้าร้านค้า ตะกร้าสินค้า และประวัติคำสั่งซื้อ |

> **หมายเหตุ:** บัญชี `admin` และ `staff` จะถูกสร้างอัตโนมัติเมื่อเปิดใช้งานระบบครั้งแรก

---

## ลิงก์ที่เกี่ยวข้อง

- GitHub Repository: [https://github.com/waranon-sop/csi204-project](https://github.com/waranon-sop/csi204-project)
- GitHub Pages (Web): [https://waranon-sop.github.io/csi204-project/](https://waranon-sop.github.io/csi204-project/)
- เอกสาร Analysis & Design: [docs/analysis-design.md](docs/analysis-design.md)
- Figma Design: [Re-wear UI/UX](https://www.figma.com/design/1K2hJcSxbNVsy1EvjIkmAZ/Re-wear?node-id=0-1&p=f&t=ZE52yZWB8HONY6yu-0)

---

## ผู้จัดทำ

> สร้างด้วย ️ โดย **กลุ่ม Re-wear** (พิมพ์มาดา, วรานนท์, ณัฐพงศ์) สำหรับวิชา CSI204
