/* =========================================================
   โปรโมชั่น
   ========================================================= */
(function (App) {
  const { el, state, money } = App;

  App.renderPromotions = function renderPromotions() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`<div class="pagehead"><h1>โปรโมชั่น</h1><p>ส่วนลดที่มีในระบบในปัจจุบัน</p></div>`));

    const grid = el(`<div class="grid-cars" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));"></div>`);
    state.promotions.forEach(p => {
      grid.appendChild(el(`
        <div class="promo-card">
          <h3>✨ ${p.name}</h3>
          <p>${p.desc}</p>
          <div class="promo-badge">${p.type === 'percent' ? '-' + p.value + '%' : '-฿' + money(p.value)}</div>
        </div>`));
    });
    wrap.appendChild(grid);

    return wrap;
  };
})(window.App);
