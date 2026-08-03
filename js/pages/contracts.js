/* =========================================================
   หน้าสัญญาเช่า / การติดตามรถ
   ========================================================= */
(function (App) {
  const { el, state, money, fmtDate, contractStatusLabel, toast, setTab } = App;

  App.renderContracts = function renderContracts() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`
      <div class="pagehead">
        <h1>สัญญาเช่า / การติดตามรถ</h1>
        <p>ดูรายละเอียดและกดปุ่ม "ติดตามรถ" เพื่อดูโลเคชันสดของยานพาหนะ</p>
      </div>`));

    if (!state.currentUser) {
      wrap.appendChild(el(`<div class="panel"><p style="margin:0;color:var(--text-muted);">กรุณาเข้าสู่ระบบ</p></div>`));
      return wrap;
    }

    const isAdmin = state.currentUser.role === 'admin';
    const myContracts = isAdmin ? state.contracts : state.contracts.filter(c => c.userId === state.currentUser.id);

    if (myContracts.length === 0) {
      wrap.appendChild(el(`<div class="empty">ยังไม่มีสัญญาเช่าในขณะนี้</div>`));
      return wrap;
    }

    myContracts.slice().reverse().forEach(ct => wrap.appendChild(buildContractCard(ct)));

    return wrap;
  };

  function buildContractCard(ct) {
    const car = state.cars.find(c => c.id === ct.carId);
    const isTracking = state.ui.trackingContractId === ct.id;

    const card = el(`
      <div class="panel" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
          <div>
            <h3 style="margin:0 0 4px;">สัญญาเลขที่ <span class="num">${ct.id}</span></h3>
            <div class="tag">${contractStatusLabel(ct.status)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;color:var(--text-muted);">ยอดรวมสัญญา</div>
            <div class="num" style="font-size:20px;font-weight:700;color:var(--amber);">฿${money(ct.total)}</div>
          </div>
        </div>
        <div class="lane-divider" style="margin:16px 0;"></div>
        <div class="form-row">
          <div>
            <label>ข้อมูลลูกค้า</label>
            <div style="font-size:14px;">${ct.customerName}</div>
            <div style="font-size:13px;color:var(--text-muted);">โทร ${ct.customerPhone} · บัตร ปชช. ${ct.customerIdCard}</div>
          </div>
          <div>
            <label>รถที่จอง</label>
            <div style="font-size:14px;">${car ? `${car.brand} ${car.model} (${car.plate})` : '-'}</div>
          </div>
        </div>
        <div class="form-row">
          <div><label>ระยะเวลาเช่า</label><div style="font-size:14px;">${fmtDate(ct.rentalStart)} — ${fmtDate(ct.rentalEnd)}</div></div>
          <div><label>สถานที่รับรถ</label><div style="font-size:14px;">${ct.pickupLocation || 'กรุงเทพฯ'}</div></div>
        </div>

        ${isTracking && ct.status === 'active' ? `
          <div class="map-container">
            <iframe class="map-iframe"
              src="https://maps.google.com/maps?q=${encodeURIComponent(ct.pickupLocation || 'Bangkok')}&t=&z=14&ie=UTF8&iwloc=&output=embed">
            </iframe>
            <div class="rider-info-overlay">
              <div>
                <span style="color:var(--green); font-weight:700; font-size:13px;">● กำลังส่งสัญญาณ GPS</span>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">ความเร็ว: 60 กม./ชม. | กำลังมุ่งหน้าไปยังจุดหมาย</div>
              </div>
              <button class="btn btn-ghost btn-sm" id="closeMapBtn">ปิดแผนที่</button>
            </div>
          </div>
        ` : ''}

        <div class="car-actions" style="margin-top:12px;">
          ${ct.status === 'pending_payment' ? `<button class="btn btn-primary btn-sm" data-pay="${ct.id}">ไปหน้าชำระเงิน</button>` : ''}
          ${ct.status === 'active' ? `
            <button class="btn btn-sm ${isTracking ? 'btn-ghost' : 'btn-primary'}" data-track="${ct.id}">
              📍 ${isTracking ? 'กำลังติดตามรถ...' : 'ติดตามรถไรเดอร์สไตล์'}
            </button>
            <button class="btn btn-danger btn-sm" data-return="${ct.id}">คืนรถ / ปิดสัญญา</button>
          ` : ''}
        </div>
      </div>`);

    const trackBtn = card.querySelector('[data-track]');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        state.ui.trackingContractId = isTracking ? null : ct.id;
        App.render();
        if (!isTracking) toast('เปิดระบบติดตาม GPS แบบเรียลไทม์เรียบร้อย');
      });
    }

    const closeMapBtn = card.querySelector('#closeMapBtn');
    if (closeMapBtn) {
      closeMapBtn.addEventListener('click', () => {
        state.ui.trackingContractId = null;
        App.render();
      });
    }

    const payBtn = card.querySelector('[data-pay]');
    if (payBtn) payBtn.addEventListener('click', () => setTab('payments'));

    const returnBtn = card.querySelector('[data-return]');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        ct.status = 'closed';
        const c = state.cars.find(c => c.id === ct.carId);
        if (c) c.status = 'available';
        toast('คืนรถเรียบร้อย ปิดสัญญาเช่าแล้ว');
        App.render();
      });
    }

    return card;
  }
})(window.App);
