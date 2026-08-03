const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // อนุญาตให้ Frontend เรียกใช้ API ได้
app.use(express.json());

// 1. เชื่อมต่อกับ MySQL (ระบุ Port 3307 ตามที่เราตั้งค่าไว้)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',        // รหัสผ่านของ XAMPP (ปกติเป็นค่าว่าง)
    database: 'rentcar_db',
    port: 3307           // Port ของ MySQL XAMPP
});

db.connect(err => {
    if (err) {
        console.error('❌ เชื่อมต่อ MySQL ไม่สำเร็จ:', err.message);
    } else {
        console.log('✅ เชื่อมต่อ MySQL (rentcar_db) บน Port 3307 สำเร็จ!');
    }
});

// ==========================================
// 2. API Endpoints
// ==========================================

// 2.1 ดึงรายการรถยนต์ทั้งหมด (สำหรับหน้า cars.js)
app.get('/api/cars', (req, res) => {
    const sql = 'SELECT * FROM cars';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        // แปลงข้อมูลจาก MySQL ให้ตรงตามโครงสร้างที่ Frontend รอรับ
        const formattedCars = results.map((car, index) => {
            // แยกชื่อรถ เช่น 'Toyota Camry' ให้กลายเป็น brand = 'Toyota' และ model = 'Camry'
            const nameParts = (car.name || '').split(' ');
            const brand = nameParts[0] || 'Toyota';
            const model = nameParts.slice(1).join(' ') || car.name || 'Car';

            return {
                id: car.id || `c-${index + 1}`,
                brand: brand,
                model: model,
                year: 2023,
                plate: '1กก 9999',
                category: car.type || 'ซีดาน',
                seats: 5,
                transmission: 'ออโต้',
                fuel: 'เบนซิน',
                pricePerDay: Number(car.price_per_day) || 1200, // แปลงราคาเป็นตัวเลข
                status: car.status || 'available',
                image: car.image || ''
            };
        });

        res.json({ success: true, data: formattedCars });
    });
});
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: results });
    });

// สมัครสมาชิก (สำหรับหน้า auth.js)
app.post('/api/auth/register', (req, res) => {
    const { email, password, name, phone } = req.body;
    const userId = 'USR-' + Date.now();

    const sql = 'INSERT INTO users (id, email, password, name, phone) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, email, password, name, phone], (err, result) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }
        res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ', userId });
    });
});

// เข้าสู่ระบบ (สำหรับหน้า auth.js)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT id, email, name, phone, has_booked_first_time FROM users WHERE email = ? AND password = ?';

    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }
    });
});

//2.4 ตรวจสอบโค้ดส่วนลด (สำหรับหน้า promotions.js / booking.js)
app.post('/api/promotions/validate', (req, res) => {
    const { code, userId } = req.body;

    // เช็คโค้ดโปรโมชัน
    const promoSql = 'SELECT * FROM promotions WHERE code = ?';
    db.query(promoSql, [code], (err, promoResults) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (promoResults.length === 0) {
            return res.status(404).json({ valid: false, message: 'ไม่พบโค้ดส่วนลดนี้' });
        }

        const promo = promoResults[0];

        // เช็คเงื่อนไขถ้าเป็นโปรใช้ได้เฉพาะครั้งแรก
        if (promo.is_first_time_only === 1) {
            const userSql = 'SELECT has_booked_first_time FROM users WHERE id = ?';
            db.query(userSql, [userId], (err, userResults) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                
                if (userResults.length > 0 && userResults[0].has_booked_first_time === 1) {
                    return res.json({ valid: false, message: 'โค้ดนี้ใช้ได้เฉพาะการจองครั้งแรกเท่านั้น' });
                }
                
                return res.json({ valid: true, discountPercent: promo.discount_percent });
            });
        } else {
            return res.json({ valid: true, discountPercent: promo.discount_percent });
        }
    });
});

//2.5 บันทึกการจองและชำระเงิน (สำหรับหน้า booking.js / payments.js)
// 🔹 API บันทึกการจองรถ (Booking)
app.post('/api/bookings', (req, res) => {
  const {
    userId, carId, pickupDate, pickupTime, pickupLocation,
    returnDate, returnTime, returnLocation, days, basePrice, discount, total
  } = req.body;

  const sqlBooking = `
    INSERT INTO bookings 
    (user_id, car_id, pickup_date, pickup_time, pickup_location, return_date, return_time, return_location, days, base_price, discount, total_price, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
  `;

  db.query(sqlBooking, [userId, carId, pickupDate, pickupTime, pickupLocation, returnDate, returnTime, returnLocation, days, basePrice, discount, total], (err, result) => {
    if (err) {
      console.error('Booking Error:', err);
      return res.status(500).json({ success: false, message: 'บันทึกการจองไม่สำเร็จ' });
    }

    // อัปเดตสถานะรถใน Database ให้เป็น 'reserved'
    const sqlUpdateCar = `UPDATE cars SET status = 'reserved' WHERE id = ?`;
    db.query(sqlUpdateCar, [carId], (err2) => {
      if (err2) console.error('Update car status error:', err2);
      
      res.json({ 
        success: true, 
        message: 'จองรถเรียบร้อยแล้ว',
        bookingId: result.insertId 
      });
    });
  });
});

// 3. รัน Server ที่ Port 3000
app.listen(3000, () => {
    console.log(' Server กำลังทำงานที่ http://localhost:3000');
});
