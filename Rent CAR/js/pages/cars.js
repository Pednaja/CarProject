/* =========================================================
   หน้าตางรถทั้งหมด
   ========================================================= */
(function (App) {
  const { el, state, money, statusLabel, gaugeSvg, requireLogin, setTab } = App;

  App.renderCars = function renderCars() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`
      <div class="pagehead">
        <h1>รถทั้งหมด</h1>
        <p>เลือกรถที่ใช่ ตรวจสอบสถานะและราคาแบบเรียลไทม์ ก่อนทำการจอง</p>
      </div>`));

    wrap.appendChild(buildGauges());
    wrap.appendChild(el(`<div class="lane-divider"></div>`));
    wrap.appendChild(buildGrid());

    return wrap;
  };

  function buildGauges() {
    const total = state.cars.length;
    const avail = state.cars.filter(c => c.status === 'available').length;
    const rented = state.cars.filter(c => c.status === 'rented').length;
    const maint = state.cars.filter(c => c.status === 'maintenance').length;

    const gauges = el(`<div class="gauges"></div>`);
    [
      ['รถทั้งหมด', total, total, 'var(--blue)'],
      ['ว่างพร้อมให้เช่า', avail, total, 'var(--green)'],
      ['ถูกเช่าอยู่', rented, total, 'var(--red)'],
      ['ซ่อมบำรุง', maint, total, 'var(--orange)']
    ].forEach(([label, val, tot, color]) => {
      gauges.appendChild(el(`<div class="gauge">${gaugeSvg(val, tot, color)}<div><div class="g-value">${val}</div><div class="g-label">${label}</div></div></div>`));
    });
    return gauges;
  }

  function buildGrid() {
    const grid = el(`<div class="grid-cars"></div>`);

    state.cars.forEach(car => {
      // ถ้าแอดมินใส่รูปรถไว้ ให้แสดงรูปนั้น ถ้ายังไม่มีรูป ให้เว้นว่างไว้ก่อน
      const carVisual = car.image
        ? `<img src="${car.image}" class="car-img" alt="${car.brand}">`
        : `<div class="no-image">ยังไม่มีรูปภาพ</div>`;

      const card = el(`
        <div class="car-card">
          <div class="car-top">
            <div class="status-chip status-${car.status}"><span class="dot"></span>${statusLabel(car.status)}</div>
            <div class="plate">${car.plate}</div>
            ${carVisual}
          </div>
          <div class="car-body">
            <h3>${car.brand} ${car.model} <span style="color:var(--text-faint);font-weight:400;font-size:13px;">'${String(car.year).slice(-2)}</span></h3>
            <div class="car-meta">
              <span class="tag">${car.category}</span>
              <span class="tag">${car.seats} ที่นั่ง</span>
              <span class="tag">${car.transmission}</span>
              <span class="tag">${car.fuel}</span>
            </div>
            <div class="car-price">
              <div><span class="amt">฿${money(car.pricePerDay)}</span> <span class="per">/วัน</span></div>
            </div>
            <div class="car-actions">
              <button class="btn btn-primary btn-sm" style="flex:1;" data-book="${car.id}" ${car.status !== 'available' ? 'disabled' : ''}>จองคันนี้</button>
            </div>
          </div>
        </div>`);
      grid.appendChild(card);
    });

    grid.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => {
      if (!requireLogin()) return;
      state.ui.bookingCarId = b.dataset.book;
      setTab('booking');
    }));

    return grid;
  }
})(window.App);
