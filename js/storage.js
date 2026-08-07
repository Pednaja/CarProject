/* =========================================================
   storage.js — เก็บข้อมูลบัญชีผู้ใช้ (email/password) ลง localStorage
   เพื่อให้เมื่อผู้ใช้กลับมาเปิดเว็บใหม่ (ปิด/เปิดเบราว์เซอร์ใหม่)
   ยังสามารถ login ด้วยอีเมล/รหัสผ่านเดิมได้ โดยไม่ต้องสมัครซ้ำ
   ========================================================= */
window.App = window.App || {};

(function (App) {
  const USERS_KEY = 'rentcar_users_v1';

  // โหลดรายชื่อผู้ใช้ที่เคยสมัคร/บันทึกไว้จาก localStorage
  // คืนค่า null ถ้ายังไม่เคยมีข้อมูล (ครั้งแรกที่เปิดเว็บ)
  App.loadUsersFromStorage = function loadUsersFromStorage() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return null;
    } catch (e) {
      console.warn('ไม่สามารถอ่านข้อมูลผู้ใช้จาก localStorage ได้', e);
      return null;
    }
  };

  // บันทึกรายชื่อผู้ใช้ปัจจุบันทั้งหมดลง localStorage
  // เรียกทุกครั้งหลังสมัครสมาชิกใหม่ หรือมีการแก้ไขข้อมูลผู้ใช้
  App.saveUsersToStorage = function saveUsersToStorage() {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(App.state.users));
    } catch (e) {
      console.warn('ไม่สามารถบันทึกข้อมูลผู้ใช้ลง localStorage ได้', e);
    }
  };

  // ล้างข้อมูลผู้ใช้ทั้งหมดออกจาก localStorage (สำหรับรีเซ็ตระบบ)
  App.clearUsersStorage = function clearUsersStorage() {
    try {
      localStorage.removeItem(USERS_KEY);
    } catch (e) { /* ignore */ }
  };
})(window.App);
