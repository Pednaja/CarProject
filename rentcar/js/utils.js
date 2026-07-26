/* =========================================================
   ฟังก์ชัน
   ========================================================= */
(function (App) {

  // แปลง string ของ HTML ให้กลายเป็น element จริงๆ ที่เอาไปแปะหน้าเว็บได้
  App.el = function el(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstElementChild;
  };

  // ใส่ comma ให้ตัวเลขเงิน เช่น 1200 -> "1,200"
  App.money = function money(n) {
    return Number(n).toLocaleString('th-TH');
  };

  // แสดงข้อความแจ้งเตือนเล็กๆ มุมขวาล่าง (isErr = true คือข้อความ error สีแดง)
  App.toast = function toast(msg, isErr) {
    const t = App.el(`<div class="toast ${isErr ? 'err' : ''}">${msg}</div>`);
    document.getElementById('toastWrap').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  // เปลี่ยนหน้าที่กำลังแสดง แล้วสั่งวาดหน้าจอใหม่
  App.setTab = function setTab(tab) {
    App.state.tab = tab;
    App.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

})(window.App);
