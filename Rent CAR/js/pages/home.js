/* =========================================================
   หน้าหลัก
   ========================================================= */
(function (App) {
  const { el, state, money } = App;

  App.renderHome = function renderHome() {
    const wrap = el(`<div class="wrap"></div>`);

    wrap.appendChild(el(`
      <div class="pagehead">
        <h1>รถทั้งหมด</h1>
        <p>รายการรถทั้งหมดที่มีในระบบ</p>
      </div>`));

    const grid = el(`<div class="grid-cars"></div>`);

    state.cars.forEach(car => {
      const card = el(`
        <div class="car-card">
          <div class="car-top"><div class="no-image">ยังไม่มีรูปภาพ</div></div>
          <div class="car-body">
            <h3>${car.brand} ${car.model} <span style="color:var(--text-faint);font-weight:400;font-size:13px;">'${String(car.year).slice(-2)}</span></h3>
            <div class="car-meta"><span class="tag">${car.category}</span></div>
            <div class="car-price">
              <span class="amt">฿${money(car.pricePerDay)}</span> <span class="per">/วัน</span>
            </div>
            <button class="btn btn-primary btn-book" style="width:100%;margin-top:4px;">จองรถคันนี้</button>
          </div>
        </div>`);

      card.querySelector('.btn-book').addEventListener('click', () => App.openBookingModal(car.id));
      grid.appendChild(card);
    });

    wrap.appendChild(grid);
    return wrap;
  };

})(window.App);
