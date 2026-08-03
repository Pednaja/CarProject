/* =========================================================
   หน้าจองรถ — ฟอร์มการจอง + การวิเคราะห์ราคา 
   ========================================================= */
(function (App) {
  const { el, state, money, daysBetween, nextId, toast, setTab } = App;

  // กติกาโปรโมชั่น: ใช้ได้เฉพาะ "การจองครั้งแรก" ของผู้ใช้แต่ละคนเท่านั้น (ต่อ 1 User)
  // เมื่อผู้ใช้เคยมีการจองมาก่อนหน้านี้แล้ว (ไม่ว่าจะจ่ายเงินแล้วหรือไม่ก็ตาม)
  // จะไม่สามารถรับส่วนลดจากโปรโมชั่นใดๆ ได้อีก
  function computePromotions(user, days) {
    if (!user) return [];
    const isFirstBooking = state.bookings.filter(b => b.userId === user.id).length === 0;
    if (!isFirstBooking) return [];
    const ctx = { days, isNewMember: user.isNewMember, isFirstBooking };
    return state.promotions.filter(p => p.rule(ctx)).map(p => ({ ...p, ctx }));
  }
  App.computePromotions = computePromotions;

  App.renderBooking = function renderBooking() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`
      <div class="pagehead">
        <h1>จองรถ</h1>
        <p>เลือกวันเวลาและสถานที่รับ-คืนรถ ระบบจะคำนวณราคาให้อัตโนมัติ</p>
      </div>`));

    if (!state.currentUser) {
      wrap.appendChild(el(`<div class="panel"><p style="margin:0;color:var(--text-muted);">กรุณา <a href="#" id="goLogin">เข้าสู่ระบบ</a> ก่อนทำการจองรถ</p></div>`));
      wrap.querySelector('#goLogin').addEventListener('click', (e) => { e.preventDefault(); setTab('auth'); });
      return wrap;
    }

    const availableCars = state.cars.filter(c => c.status === 'available' || c.id === state.ui.bookingCarId);
    if (availableCars.length === 0) {
      wrap.appendChild(el(`<div class="empty">ขณะนี้ไม่มีรถว่างให้บริการ กรุณาลองใหม่ภายหลัง</div>`));
      return wrap;
    }

    const selectedId = state.ui.bookingCarId && availableCars.some(c => c.id === state.ui.bookingCarId) ? state.ui.bookingCarId : availableCars[0].id;
    const panel = buildForm(availableCars, selectedId);
    wrap.appendChild(panel);

    return wrap;
  };

  function buildForm(availableCars, selectedId) {
    const panel = el(`<div class="panel"></div>`);
    const carOptions = availableCars.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.brand} ${c.model} — ฿${money(c.pricePerDay)}/วัน ${c.status !== 'available' ? '(ไม่ว่าง)' : ''}</option>`).join('');
    const locOptions = state.locations.map(l => `<option value="${l}">${l}</option>`).join('');
    const today = new Date().toISOString().slice(0, 10);

    panel.appendChild(el(`
      <div class="form-row single"><div><label>เลือกรถ</label><select id="bkCar">${carOptions}</select></div></div>
      <div class="form-row">
        <div><label>วันที่รับรถ</label><input type="date" id="bkPickupDate" min="${today}" value="${today}"></div>
        <div><label>เวลารับรถ</label><input type="time" id="bkPickupTime" value="10:00"></div>
      </div>
      <div class="form-row">
        <div><label>สถานที่รับรถ</label><select id="bkPickupLoc">${locOptions}</select></div>
        <div><label>สถานที่คืนรถ</label><select id="bkReturnLoc">${locOptions}</select></div>
      </div>
      <div class="form-row">
        <div><label>วันที่คืนรถ</label><input type="date" id="bkReturnDate" min="${today}" value="${today}"></div>
        <div><label>เวลาคืนรถ</label><input type="time" id="bkReturnTime" value="10:00"></div>
      </div>
      <div id="bkResult"></div>
    `));

    function refreshResult() {
      const carId = panel.querySelector('#bkCar').value;
      const car = state.cars.find(c => c.id === carId);
      const pDate = panel.querySelector('#bkPickupDate').value;
      const rDate = panel.querySelector('#bkReturnDate').value;
      const resultBox = panel.querySelector('#bkResult');
      resultBox.innerHTML = '';

      if (car.status !== 'available') {
        resultBox.appendChild(el(`<div class="error-box">รถคันนี้ไม่พร้อมให้บริการในขณะนี้</div>`));
        resultBox.appendChild(el(`<button class="btn btn-primary" disabled style="width:100%;">ไม่สามารถจองได้</button>`));
        return;
      }

      const days = daysBetween(pDate, rDate);
      if (!pDate || !rDate || days < 1) {
        resultBox.appendChild(el(`<div class="error-box">กรุณาเลือกวันคืนรถหลังวันรับรถอย่างน้อย 1 วัน</div>`));
        return;
      }

      const base = days * car.pricePerDay;
      const isFirstBooking = state.bookings.filter(b => b.userId === state.currentUser.id).length === 0;
      const promos = computePromotions(state.currentUser, days);
      let discount = 0;
      const promoRows = promos.map(p => {
        const amt = p.type === 'percent' ? Math.round(base * p.value / 100) : p.value;
        discount += amt;
        return `<div class="brow"><span>🎁 ${p.name}</span><span class="minus">-฿${money(amt)}</span></div>`;
      }).join('');
      const total = Math.max(0, base - discount);

      let promoNote;
      if (promoRows) {
        promoNote = promoRows;
      } else if (!isFirstBooking) {
        promoNote = `<div class="brow"><span style="color:var(--text-faint);">ไม่มีส่วนลด — สิทธิ์โปรโมชั่นใช้ได้เฉพาะการจองครั้งแรกของสมาชิกเท่านั้น</span><span></span></div>`;
      } else {
        promoNote = `<div class="brow"><span style="color:var(--text-faint);">ยังไม่เข้าเงื่อนไขโปรโมชั่นใดในระบบ</span><span></span></div>`;
      }

      resultBox.appendChild(el(`
        <div class="breakdown">
          <div class="brow"><span>${car.brand} ${car.model} × ${days} วัน</span><span>฿${money(base)}</span></div>
          ${promoNote}
          <div class="brow total"><span>ยอดชำระรวม</span><span class="num">฿${money(total)}</span></div>
        </div>
        ${isFirstBooking ? `<p class="hint">✨ นี่คือการจองครั้งแรกของคุณ ระบบจะตรวจสอบและใส่ส่วนลดที่เข้าเงื่อนไขให้อัตโนมัติ</p>` : ''}
        <button class="btn btn-primary" id="confirmBookBtn" style="width:100%;margin-top:14px;">ยืนยันการจอง</button>
      `));

      resultBox.querySelector('#confirmBookBtn').addEventListener('click', () => {
        confirmBooking(panel, car, pDate, rDate, days, base, discount, total, promos);
      });
    }

    panel.querySelectorAll('select, input').forEach(f => f.addEventListener('input', refreshResult));
    refreshResult();

    return panel;
  }

  function confirmBooking(panel, car, pDate, rDate, days, base, discount, total, promos) {
    const pLoc = panel.querySelector('#bkPickupLoc').value;
    const rLoc = panel.querySelector('#bkReturnLoc').value;
    const pTime = panel.querySelector('#bkPickupTime').value;
    const rTime = panel.querySelector('#bkReturnTime').value;

    const booking = {
      id: nextId('bk'), userId: state.currentUser.id, carId: car.id,
      pickupDate: pDate, pickupTime: pTime, pickupLocation: pLoc,
      returnDate: rDate, returnTime: rTime, returnLocation: rLoc,
      days, basePrice: base, discount, total,
      status: 'confirmed', createdAt: new Date().toISOString()
    };
    state.bookings.push(booking);
    car.status = 'reserved';
    if (promos.some(p => p.code === 'NEWMEMBER300')) state.currentUser.isNewMember = false;

    const deposit = 1000;
    const contract = {
      id: nextId('ct'), bookingId: booking.id, carId: car.id, userId: state.currentUser.id,
      customerName: state.currentUser.name, customerPhone: state.currentUser.phone, customerIdCard: state.currentUser.idCard,
      deposit, rentalStart: pDate, rentalEnd: rDate, pickupLocation: pLoc, total,
      status: 'pending_payment', createdAt: new Date().toISOString()
    };
    state.contracts.push(contract);

    toast('จองรถสำเร็จ! กรุณาชำระเงิน');
    state.ui.bookingCarId = null;
    setTab('contracts');
  }
})(window.App);
