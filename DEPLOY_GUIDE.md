# 🚀 คำแนะนำ Deploy Backend ไปที่ Railway

## 📋 ขั้นตอนทั้งหมด

### ✅ ขั้นตอนที่ 1: เตรียม GitHub (เสร็จแล้ว!)
```
✅ Repository: ea-backend-api
✅ ไฟล์: package.json, server.js อัพโหลดแล้ว
```

---

### 🚂 ขั้นตอนที่ 2: Deploy ไปที่ Railway

#### 2.1 เข้า Railway
```
1. ไปที่: https://railway.app
2. คลิก "Login" 
3. เลือก "Login with GitHub"
4. อนุญาต Railway เข้าถึง GitHub
```

#### 2.2 สร้าง Project ใหม่
```
1. คลิก "New Project"
2. เลือก "Deploy from GitHub repo"
3. เลือก Repository: ea-backend-api
4. คลิก "Deploy Now"
```

#### 2.3 รอ Deploy (1-2 นาที)
```
Railway จะ:
✅ Clone Code จาก GitHub
✅ อ่าน package.json
✅ รัน npm install
✅ เริ่ม Server

คุณจะเห็น:
- Building...
- Installing dependencies...
- Starting application...
```

---

### 🔧 ขั้นตอนที่ 3: เพิ่ม Environment Variables

#### 3.1 ไปที่ Variables Tab
```
1. คลิกที่ Service (ea-backend-api)
2. ไปที่ Tab "Variables"
3. คลิก "New Variable"
```

#### 3.2 เพิ่มตัวแปรทีละตัว

**Variable 1: MONGODB_URI**
```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/ea-cloud

⚠️ แทนที่ด้วย MongoDB Connection String จริงของคุณ
```

**Variable 2: TELEGRAM_BOT_TOKEN**
```
Name: TELEGRAM_BOT_TOKEN
Value: 8217571004:AAG_Vmx9FGQqHfOUPGFK40Of3bYwnYJayas

✅ หรือใช้ Bot Token ของคุณเอง
```

**Variable 3: TELEGRAM_PERMISSION_CHAT_ID**
```
Name: TELEGRAM_PERMISSION_CHAT_ID
Value: -1003583380926

✅ หรือใช้ Chat ID ของคุณเอง
```

**Variable 4: TELEGRAM_PERFORMANCE_CHAT_ID**
```
Name: TELEGRAM_PERFORMANCE_CHAT_ID
Value: -5099731625

✅ หรือใช้ Chat ID ของคุณเอง
```

**Variable 5: PORT**
```
Name: PORT
Value: 3000
```

#### 3.3 บันทึกและรอ Redeploy
```
Railway จะ Redeploy อัตโนมัติ
รอ 1-2 นาที
```

---

### ✅ ขั้นตอนที่ 4: ตรวจสอบว่าทำงาน

#### 4.1 ดู Logs
```
1. ไปที่ Tab "Deployments"
2. คลิก Deployment ล่าสุด
3. ไปที่ Tab "View Logs"

ควรเห็น:
═══════════════════════════════════════
🚀 EA Cloud Backend Server
═══════════════════════════════════════
✅ Server running on port 3000
✅ Environment: production
✅ MongoDB: Connected
✅ Telegram: Enabled
═══════════════════════════════════════
```

#### 4.2 สร้าง Public URL
```
1. ไปที่ Tab "Settings"
2. Scroll ลงไปหา "Networking"
3. ส่วน "Public Networking"
4. คลิก "Generate Domain"

จะได้ URL:
https://ea-backend-api-production.up.railway.app

หรือ:
https://ea-backend-api-production-xxxx.up.railway.app
```

#### 4.3 ทดสอบ URL
```
เปิด Browser ไปที่ URL ที่ได้

ควรเห็น:
{
  "message": "EA Cloud Backend API",
  "status": "running",
  "version": "1.0.0",
  "timestamp": "2025-12-28T..."
}

= สำเร็จ! ✅
```

---

### 🎯 ขั้นตอนที่ 5: ใช้งาน Backend URL

#### 5.1 Copy URL
```
https://ea-backend-api-production.up.railway.app

Copy ทั้งหมด
```

#### 5.2 อัพเดท EA
```
เปลี่ยน BackendURL ในไฟล์ EA:

input string BackendURL = "https://ea-backend-api-production.up.railway.app";
```

#### 5.3 อัพเดท Website
```
เปลี่ยน BACKEND_URL ในไฟล์ Website:

const BACKEND_URL = 'https://ea-backend-api-production.up.railway.app';
```

#### 5.4 เพิ่ม URL ใน MT5
```
1. เปิด MT5
2. Tools → Options → Expert Advisors
3. ☑ Allow WebRequest for listed URL
4. เพิ่ม: https://ea-backend-api-production.up.railway.app
5. กด OK
```

---

## 🔍 Troubleshooting

### ❌ Service is offline

**สาเหตุ:**
- ไม่ได้เพิ่ม Environment Variables
- MongoDB Connection String ผิด
- Start Command ไม่ถูกต้อง

**วิธีแก้:**
1. เช็ค Variables Tab → ต้องมี 5 ตัวแปร
2. เช็ค Logs → ดู Error message
3. เช็ค Settings → Deploy → Start Command = "node server.js"

---

### ❌ MongoDB Connection Error

**ใน Logs เห็น:**
```
❌ MongoDB connection error: ...
```

**วิธีแก้:**
1. ตรวจสอบ MONGODB_URI ให้ถูกต้อง
2. ไปที่ MongoDB Atlas:
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
   - Database Access → ตรวจสอบ Username/Password
3. ทดสอบ Connection String

---

### ❌ Telegram Not Working

**ใน Logs เห็น:**
```
⚠️  Telegram Bot Token not provided
```

**วิธีแก้:**
1. ตรวจสอบ TELEGRAM_BOT_TOKEN
2. ตรวจสอบ TELEGRAM_PERMISSION_CHAT_ID (ต้องมีเครื่องหมายลบ -)
3. ตรวจสอบว่า Bot อยู่ใน Group
4. Redeploy

---

## 📊 Checklist สำเร็จ

```
✅ Railway Deploy สำเร็จ
✅ Service Status: Online
✅ Logs ไม่มี Error
✅ Public URL ทำงานได้
✅ MongoDB Connected
✅ Telegram Bot ทำงาน
✅ ทดสอบ API สำเร็จ

= พร้อมใช้งาน 100%! 🎉
```

---

## 🎯 สรุป

หลังทำตามขั้นตอนทั้งหมดแล้ว คุณจะได้:

```
Backend URL:
https://ea-backend-api-production.up.railway.app

ใช้สำหรับ:
✅ EA เชื่อมต่อ (BackendURL parameter)
✅ Website เรียก API
✅ รับ Telegram Notification อัตโนมัติ
✅ จัดการ Account ทั้งหมด
```

---

## 📞 ติดต่อสอบถาม

หากมีปัญหา:
1. เช็ค Logs ใน Railway
2. เช็ค Environment Variables
3. ส่ง Screenshot Error มาถาม

**ขอให้โชคดีครับ!** 🚀
