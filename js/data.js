window.App = window.App || {};

(function (App) {
  let uid = 100;
  App.nextId = (prefix) => prefix + '-' + (++uid);

  // เลขพร้อมเพย์ สามารถเปลี่ยนเป็นเบอร์ได้
  App.PROMPTPAY_NUMBER = '0800000000';


  const defaultUsers = [
    { id: 'u-1', name: 'ผู้ดูแลระบบ', email: 'admin@gmail.com', password: 'admin123', phone: '0800000000', idCard: '1234567890123', role: 'admin', isNewMember: false, joinedAt: '2024-01-01' }
  ];

  // ถ้าเคยมีผู้ใช้สมัครไว้ก่อนหน้า (บันทึกไว้ใน localStorage ผ่าน storage.js)
  // ให้โหลดกลับมาใช้ต่อ เพื่อให้ผู้ใช้เดิม login เข้าระบบได้โดยไม่ต้องสมัครใหม่
  const restoredUsers = App.loadUsersFromStorage ? App.loadUsersFromStorage() : null;

  App.state = {
    ui: { tab: 'cars', authMode: 'login', bookingCarId: null, trackingContractId: null },
    currentUser: null,

    users: restoredUsers || defaultUsers,

    //แอดมินอัปโหลดรูป "จัดการรถ"
    cars: [
      { id: 'c-1', brand: 'Toyota', model: 'Yaris Ativ', year: 2023, plate: '1กก 4521', category: 'อีโค่คาร์', seats: 5, transmission: 'ออโต้', fuel: 'เบนซิน', pricePerDay: 1200, status: 'available', image: '' },
      { id: 'c-2', brand: 'Honda', model: 'City', year: 2023, plate: '2ขค 8834', category: 'ซีดาน', seats: 5, transmission: 'ออโต้', fuel: 'เบนซิน', pricePerDay: 1400, status: 'available', image: '' },
      { id: 'c-3', brand: 'Toyota', model: 'Fortuner', year: 2022, plate: '3งจ 1190', category: 'เอสยูวี', seats: 7, transmission: 'ออโต้', fuel: 'ดีเซล', pricePerDay: 2800, status: 'available', image: '' }
    ],

    bookings: [],
    contracts: [],
    payments: [],

    promotions: [
      { id: 'p1', code: 'WEEKLY10', name: 'เช่ายาว 7 วันขึ้นไป', desc: 'ลดทันที 10% เมื่อเช่ารถตั้งแต่ 7 วันขึ้นไป (ใช้ได้เฉพาะการจองครั้งแรกของสมาชิกเท่านั้น)', type: 'percent', value: 10, rule: (ctx) => ctx.days >= 7 },
      { id: 'p2', code: 'NEWMEMBER300', name: 'สมาชิกใหม่', desc: 'ลด 300 บาท สำหรับการจองครั้งแรกของสมาชิกใหม่', type: 'fixed', value: 300, rule: (ctx) => ctx.isNewMember }
    ],

    // สาขาที่เปิดให้บริการรับ-คืนรถ
    locations: ['สาขาสนามบินสุวรรณภูมิ', 'สาขาสนามบินดอนเมือง', 'สาขาสีลม กรุงเทพฯ', 'สาขาเชียงใหม่', 'สาขาภูเก็ต']
  };
})(window.App);
