window.App = window.App || {};

/* ========================================================
   ระบบ จองรถ / สัญญาเช่า / ชำระเงิน / โปรโมชั่น / แอดมิน
   ยังไม่ใส่มา
   ========================================================= */
(function (App) {

  App.state = {
    // tab บอกว่าตอนนี้กำลังแสดงหน้าไหนอยู่: 'home' | 'login' | 'register'
    tab: 'home',

    // ผู้ใช้ที่ล็อกอินอยู่ตอนนี้ (ถ้ายังไม่ล็อกอิน = null)
    currentUser: null,

    // รายชื่อผู้ใช้ในระบบ 
    users: [
      { name: 'ผู้ดูแลระบบ', email: 'admin@gmail.com', password: 'admin123', role: 'admin' }
    ],

    // รถตัวอย่าง แสดงในหน้าหลักเฉยๆ (ยังกดจองไม่ได้)
    cars: [
      { id: 'car-1', brand: 'Toyota', model: 'Yaris Ativ', year: 2023, category: 'อีโค่คาร์', pricePerDay: 1200 },
      { id: 'car-2', brand: 'Honda', model: 'City', year: 2023, category: 'ซีดาน', pricePerDay: 1400 },
      { id: 'car-3', brand: 'Toyota', model: 'Fortuner', year: 2022, category: 'เอสยูวี', pricePerDay: 2800 }
    ],
    bookings: [],
    contracts: [],
    payments: [],
  };

})(window.App);
