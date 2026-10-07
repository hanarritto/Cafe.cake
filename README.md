# Little Leaf Café

โปรเจกต์ Web Technology แบบ Front-end Prototype

## ไฟล์

- index.html — โครงสร้างหน้าเว็บ + Vue 3
- style.css — CSS3 + Responsive + Handmade/Paper theme
- script.js — JavaScript + Vue 3 + DOM/Event + localStorage + Fetch API
- menu.json — ข้อมูลเมนูในรูปแบบ JSON

## วิธีเปิด

แนะนำให้เปิดด้วย VS Code + Live Server เพราะโปรเจกต์ใช้ Fetch API อ่าน menu.json

หากเปิด index.html ด้วยการดับเบิลคลิกโดยตรง บาง Browser อาจบล็อก Fetch API จาก file://

## ฟีเจอร์

- Sticky Navbar
- Responsive Desktop / Tablet / Mobile
- Hamburger Menu
- Dark Mode
- Menu Grid
- Category Filter
- Menu Detail Modal
- Quantity Control
- Checkout Form
- Order ID
- LocalStorage
- ใบเสร็จหลัก 1 ใบต่อวัน
- เพิ่มเมนูเข้าใบเสร็จเดิมได้
- Receipt Modal + Background Blur
- Go To Top
- Smooth Scroll
- Contact Form
- Click Sound
- Fetch API + JSON
- Promise + Async/Await
- Vue 3 CDN

## หมายเหตุ

ระบบ Order เป็น Front-end Prototype:
- ไม่มี Backend
- ไม่มี Database
- ไม่มี Payment
- Order เก็บใน Browser ของผู้ใช้ผ่าน localStorage
- ใบเสร็จจะแสดงเฉพาะ Order ของวันปัจจุบัน
- ข้อมูล Contact เป็นข้อมูลสมมติ
