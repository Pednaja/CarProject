/* =========================================================
   การชำระเงิน
   ========================================================= */
(function (App) {
  const { el, state, money, toast, setTab, PROMPTPAY_NUMBER } = App;

  App.renderPayments = function renderPayments() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`
      <div class="pagehead">
        <h1>ชำระเงิน</h1>
        <p>สแกน QR Code เพื่อจ่ายเงินเข้าบัญชีจริง หรือจำลองการตัดผ่านบัตรเครดิต</p>
      </div>`));

    if (!state.currentUser) {
      wrap.appendChild(el(`<div class="panel"><p style="margin:0;color:var(--text-muted);">กรุณาเข้าสู่ระบบ</p></div>`));
      return wrap;
    }

    const isAdmin = state.currentUser.role === 'admin';
    const pending = (isAdmin ? state.contracts : state.contracts.filter(c => c.userId === state.currentUser.id)).filter(c => c.status === 'pending_payment');

    if (pending.length === 0) {
      wrap.appendChild(el(`<div class="empty">ไม่มีรายการที่รอชำระเงิน</div>`));
      return wrap;
    }

    wrap.appendChild(buildPaymentLayout(pending));
    return wrap;
  };

  function buildPaymentLayout(pending) {
    let activeContractId = pending[0].id;

    const layout = el(`<div class="form-row" style="align-items:flex-start;"></div>`);
    const left = el(`<div class="panel"></div>`);
    const right = el(`<div class="panel"></div>`);
    layout.appendChild(left);
    layout.appendChild(right);

    left.appendChild(el(`<h3 style="margin-top:0;">รายการรอชำระเงิน</h3>`));
    const list = el(`<div></div>`);
    pending.forEach(ct => {
      const car = state.cars.find(c => c.id === ct.carId);
      list.appendChild(el(`
        <div style="padding:10px 0;border-bottom:1px solid var(--line-soft);cursor:pointer;" data-select="${ct.id}">
          <div style="display:flex;justify-content:space-between;"><b>${ct.id}</b><span class="num" style="color:var(--amber);">฿${money(ct.total)}</span></div>
          <div style="font-size:12.5px;color:var(--text-muted);">${car ? car.brand + ' ' + car.model : ''}</div>
        </div>`));
    });
    left.appendChild(list);

    function renderPayForm() {
      const ct = state.contracts.find(c => c.id === activeContractId);
      right.innerHTML = '';
      right.appendChild(el(`<h3 style="margin-top:0;">ชำระเงินสำหรับสัญญา <span class="num">${ct.id}</span></h3>`));

      // เจนเนอเรท QR PromptPay จริง ผ่าน API Open Source (สแกนโอนเงินได้จริง)
      const promptPayUrl = `https://promptpay.io/${PROMPTPAY_NUMBER}/${ct.total}.png`;

      right.appendChild(el(`
        <div class="subtabs">
          <button class="subtab active" data-method="qr">📱 ใช้ได้จริง QR PromptPay</button>
          <button class="subtab" data-method="credit">💳 บัตรเครดิต</button>
        </div>
        <div id="methodBody"></div>`));

      let method = 'qr';
      const methodBody = right.querySelector('#methodBody');

      function complete(methodLabel) {
        ct.status = 'active';
        const car = state.cars.find(c => c.id === ct.carId);
        if (car) car.status = 'rented';
        toast(`ชำระเงินสำเร็จด้วย ${methodLabel} สัญญาเช่าเริ่มทำงาน รถถูกเปิดระบบ GPS ติดตามแล้ว`);
        setTab('contracts');
      }

      function drawMethod() {
        methodBody.innerHTML = '';
        if (method === 'qr') {
          const box = el(`
            <div class="qr-box">
              <img src="${promptPayUrl}" class="qr-image" alt="PromptPay QR Code">
              <div class="num" style="font-size:18px;font-weight:700;color:var(--amber);">฿${money(ct.total)}</div>
              <p class="hint" style="text-align:center;">เปิดแอปธนาคาร สแกนยอดโอนเงินจริงเข้าบัญชีปลายทางได้ทันที เมื่อโอนเสร็จแล้วกดปุ่มด้านล่าง</p>
              <button class="btn btn-primary" id="payNow" style="width:100%;">ฉันโอนเงินเรียบร้อยแล้ว</button>
            </div>`);
          methodBody.appendChild(box);
          methodBody.querySelector('#payNow').addEventListener('click', () => complete('QR PromptPay'));
        } else {
          methodBody.appendChild(el(`
            <div class="form-row single"><div><label>ชื่อบนบัตร</label><input type="text" id="ccName" placeholder="เช่น SOMCHAI JAIDEE"></div></div>
            <div class="form-row single"><div><label>หมายเลขบัตร (16 หลัก)</label><input type="text" id="ccNum" placeholder="xxxx xxxx xxxx xxxx" maxlength="19"></div></div>
            <div class="form-row"><div><label>วันหมดอายุ (MM/YY)</label><input type="text" id="ccExp" placeholder="MM/YY" maxlength="5"></div>
            <div><label>CVV (3 หลัก)</label><input type="text" id="ccCvv" placeholder="xxx" maxlength="3"></div></div>
            <div id="ccError"></div>
            <button class="btn btn-primary" id="payNow" style="width:100%;margin-top:6px;">ชำระเงิน ฿${money(ct.total)}</button>`));

          methodBody.querySelector('#payNow').addEventListener('click', () => {
            const errBox = methodBody.querySelector('#ccError');
            errBox.innerHTML = '';

            const name = methodBody.querySelector('#ccName').value.trim();
            const num = methodBody.querySelector('#ccNum').value.replace(/\s+/g, '');
            const exp = methodBody.querySelector('#ccExp').value.trim();
            const cvv = methodBody.querySelector('#ccCvv').value.trim();

            if (!name) { errBox.appendChild(el(`<div class="error-box">กรุณากรอกชื่อบนบัตร</div>`)); return; }
            if (!/^\d{16}$/.test(num)) { errBox.appendChild(el(`<div class="error-box">หมายเลขบัตรต้องเป็นตัวเลข 16 หลัก</div>`)); return; }
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) { errBox.appendChild(el(`<div class="error-box">รูปแบบวันหมดอายุไม่ถูกต้อง (MM/YY)</div>`)); return; }

            // ตรวจสอบว่าบัตรยังไม่หมดอายุ
            const [mm, yy] = exp.split('/').map(Number);
            const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
            if (expDate < new Date()) { errBox.appendChild(el(`<div class="error-box">บัตรหมดอายุแล้ว กรุณาใช้บัตรใบอื่น</div>`)); return; }

            if (!/^\d{3}$/.test(cvv)) { errBox.appendChild(el(`<div class="error-box">CVV ต้องเป็นตัวเลข 3 หลัก</div>`)); return; }

            complete('บัตรเครดิต');
          });
        }
      }

      right.querySelectorAll('.subtab').forEach(b => b.addEventListener('click', () => {
        right.querySelectorAll('.subtab').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        method = b.dataset.method;
        drawMethod();
      }));

      drawMethod();
    }

    list.querySelectorAll('[data-select]').forEach(it => it.addEventListener('click', () => { activeContractId = it.dataset.select; renderPayForm(); }));
    renderPayForm();

    return layout;
  }
})(window.App);
