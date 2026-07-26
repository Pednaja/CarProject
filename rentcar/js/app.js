/* =========================================================
   ตัวจัดการหน้า (router) — ดูว่า state.tab เป็นอะไร แล้วสั่งวาดหน้านั้น
   ========================================================= */
(function (App) {
  const { el, state } = App;

  App.render = function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(App.renderNav());

    let page;
    switch (state.tab) {
      case 'login': page = App.renderLogin(); break;
      case 'register': page = App.renderRegister(); break;
      default: page = App.renderHome();
    }
    app.appendChild(page);

    app.appendChild(el(`<div class="footer-note">Rent Car Demo 2026 — ข้อมูลจำลองบนหน่วยความจำเบราว์เซอร์</div>`));
  };

  App.render();
})(window.App);
