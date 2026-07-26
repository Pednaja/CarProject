/* =========================================================
   ตัวจัดการหน้า (router)
   ========================================================= */
(function (App) {
  const { el, state } = App;

  // หน้ากลางๆ สำหรับแท็บที่ยังไม่มีระบบจริง (contract / payment / promo / admin / booking)
  App.renderComingSoon = function renderComingSoon(tabId) {
    const tab = (App.navTabs || []).find(t => t.id === tabId);
    const label = tab ? tab.label : '';
    const msg = COMING_SOON_MSG[tabId];

    return el(`
      <div class="wrap">
        <div class="pagehead">
          <h1>${label}</h1>
          <p>${msg}</p>
        </div>
        <div class="panel" style="text-align:center;padding:40px 20px;color:var(--text-muted);">
          🚧 หน้า "${label}" ยังไม่พร้อมใช้งาน
        </div>
      </div>`);
  };

  App.render = function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(App.renderNav());

    let page;
    switch (state.tab) {
      case 'login': page = App.renderLogin(); break;
      case 'register': page = App.renderRegister(); break;
      case 'booking':
      case 'contract':
      case 'payment':
      case 'promo':
      case 'admin':
        page = App.renderComingSoon(state.tab); break;
      default: page = App.renderHome();
    }
    app.appendChild(page);

    app.appendChild(el(`<div class="footer-note">Rent Car Demo 2026 — ข้อมูลจำลองบนหน่วยความจำเบราว์เซอร์</div>`));
  };

  // เรียก render ครั้งแรกเมื่อโหลดเว็บ
  App.render();
})(window.App);
