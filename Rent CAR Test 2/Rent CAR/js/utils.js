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

  // ---------- หน้าต่างยืนยัน (modal) ----------
  // เปิดหน้าต่างลอยตรงกลางจอ โดยไม่เปลี่ยนหน้า/แถบเมนู
  App.openModal = function openModal(contentEl) {
    App.closeModal(); // กันกรณีมี modal ค้างอยู่

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalOverlay';
    overlay.appendChild(contentEl);

    // คลิกพื้นหลังนอกกล่อง = ปิดหน้าต่าง
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) App.closeModal();
    });

    document.body.appendChild(overlay);
  };

  App.closeModal = function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.remove();
  };

})(window.App);
