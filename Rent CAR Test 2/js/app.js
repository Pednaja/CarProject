(function (App) {
  const { el, state } = App;

  App.render = function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(App.renderNav());

    let page;
    switch (state.ui.tab) {
      case 'auth': page = App.renderAuth(); break;
      case 'booking': page = App.renderBooking(); break;
      case 'contracts': page = App.renderContracts(); break;
      case 'payments': page = App.renderPayments(); break;
      case 'promotions': page = App.renderPromotions(); break;
      case 'admin':
        page = (state.currentUser && state.currentUser.role === 'admin') ? App.renderAdmin() : App.renderCars();
        break;
      default:
        page = App.renderCars();
    }
    app.appendChild(page);
    app.appendChild(el(`<div class="footer-note">Rent Car Demo 2026 — ข้อมูลจำลองบนหน่วยความจำเบราว์เซอร์</div>`));
  };

  App.render();
})(window.App);
