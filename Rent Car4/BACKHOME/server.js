const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.put('/api/cars/:id', async (req, res) => {
    const { brand, model, plate, pricePerDay, status, image } = req.body;
    try {
        await db.query(
            'UPDATE cars SET brand=?, model=?, plate=?, pricePerDay=?, status=?, image=? WHERE id=?',
            [brand, model, plate, pricePerDay, status, image, req.params.id]
        );
        res.json({ message: 'บันทึกสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      //  username
  password: '51018000',      //  password MySQL 
  database: 'rentcar_db',
  waitForConnections: true,
  connectionLimit: 10
});


//  ดึงข้อมูลรถทั้งหมด
app.get('/api/cars', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cars');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ลบรถ
app.delete('/api/cars/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
        res.json({ message: 'Car deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// สมัครสมาชิก
app.post('/api/users/register', async (req, res) => {
  const { id, name, phone, email, idCard, password, role, isNewMember, joinedAt } = req.body;
  try {
    await db.query(
      'INSERT INTO users (id, name, phone, email, idCard, password, role, isNewMember, joinedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, phone, email, idCard, password, role || 'customer', isNewMember ? 1 : 0, joinedAt]
    );
    res.json({ message: 'Register success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// เข้าสู่ระบบ (Login)
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?', [email, password]);
    if (rows.length === 0) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// บันทึกการจองรถใหม่
app.post('/api/bookings', async (req, res) => {
  const b = req.body;
  try {
    await db.query(
      `INSERT INTO bookings (id, userId, carId, pickupDate, pickupTime, pickupLocation, returnDate, returnTime, returnLocation, days, basePrice, discount, total, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.userId, b.carId, b.pickupDate, b.pickupTime, b.pickupLocation, b.returnDate, b.returnTime, b.returnLocation, b.days, b.basePrice, b.discount, b.total, b.status, b.createdAt]
    );
    
    await db.query('UPDATE cars SET status = "reserved" WHERE id = ?', [b.carId]);
    res.json({ message: 'Booking created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));

// ดึงการจองทั้งหมด
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// แอดมินเพิ่มรถใหม่
app.post('/api/cars', async (req, res) => {
  const c = req.body;
  try {
    await db.query(
      `INSERT INTO cars (id, brand, model, year, plate, category, seats, transmission, fuel, pricePerDay, status, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.brand, c.model, c.year, c.plate, c.category, c.seats, c.transmission, c.fuel, c.pricePerDay, c.status || 'available', c.image || '']
    );
    res.json({ message: 'Car added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// แอดมินลบรถ
app.delete('/api/cars/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// API แก้ไขข้อมูลรถ
app.put('/api/cars/:id', async (req, res) => {
    const { brand, model, plate, pricePerDay, status, image } = req.body;
    try {
        await db.query(
            'UPDATE cars SET brand=?, model=?, plate=?, pricePerDay=?, status=?, image=? WHERE id=?',
            [brand, model, plate, pricePerDay, status, image, req.params.id]
        );
        res.json({ message: 'บันทึกการแก้ไขเรียบร้อย' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});