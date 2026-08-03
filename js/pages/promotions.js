/* =========================================================
   โปรโมชั่น
   ========================================================= */
(function (App) {
  const { el, state, money } = App;

  App.renderPromotions = function renderPromotions() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`<div class="pagehead"><h1>โปรโมชั่น</h1><p>ส่วนลดที่มีในระบบในปัจจุบัน</p></div>`));

    wrap.appendChild(buildExplainer());

    const grid = el(`<div class="grid-cars" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));margin-top:18px;"></div>`);
    state.promotions.forEach(p => {
      grid.appendChild(el(`
        <div class="promo-card">
          <h3>✨ ${p.name}</h3>
          <p>${p.desc}</p>
          <div class="promo-badge">${p.type === 'percent' ? '-' + p.value + '%' : '-฿' + money(p.value)}</div>
        </div>`));
    });
    wrap.appendChild(grid);

    wrap.appendChild(buildMyStatus());

    return wrap;
  };

  function buildExplainer() {
    return el(`
      <div class="panel">
        <h3 style="margin-top:0;">ระบบโปรโมชั่น</h3>
        <ul style="margin:0;padding-left:18px;color:var(--text-muted);font-size:14px;line-height:1.9;">
          <li>ทุกครั้งที่ทำการจองรถ ระบบจะตรวจสอบอัตโนมัติว่าการจองนั้นเข้าเงื่อนไขของโปรโมชั่นใดบ้าง (เช่น เช่านานกว่า 7 วัน หรือเป็นสมาชิกใหม่)</li>
          <li>ถ้าเข้าเงื่อนไขมากกว่า 1 รายการ ระบบจะรวมส่วนลดทั้งหมดให้อัตโนมัติในหน้าสรุปราคาก่อนยืนยันการจอง</li>
          <li><b style="color:var(--amber);">สิทธิ์โปรโมชั่นใช้ได้เฉพาะ "การจองครั้งแรก" ของผู้ใช้แต่ละคนเท่านั้น (1 สิทธิ์ต่อ 1 บัญชีผู้ใช้)</b> — เมื่อบัญชีของคุณเคยมีการจองมาแล้วอย่างน้อย 1 ครั้ง (ไม่ว่าจะชำระเงินแล้วหรือยังรอชำระอยู่) การจองครั้งต่อไปจะไม่ได้รับส่วนลดใดๆ อีก</li>
          <li>ไม่ต้องกรอกโค้ดส่วนลดเอง ระบบจะคำนวณและใส่ส่วนลดที่เข้าเงื่อนไขให้ในหน้า "จองรถ" โดยอัตโนมัติ</li>
        </ul>
      </div>`);
  }

  function buildMyStatus() {
    if (!state.currentUser) {
      return el(`<div class="panel" style="margin-top:16px;"><p style="margin:0;color:var(--text-muted);font-size:13.5px;">เข้าสู่ระบบเพื่อตรวจสอบว่าคุณยังมีสิทธิ์รับโปรโมชั่นอยู่หรือไม่</p></div>`);
    }
    const hasBooked = state.bookings.some(b => b.userId === state.currentUser.id);
    const msg = hasBooked
      ? `บัญชีของคุณเคยทำการจองมาแล้ว จึงไม่สามารถรับส่วนลดโปรโมชั่นได้อีกในการจองครั้งถัดไป`
      : `บัญชีของคุณยังไม่เคยทำการจอง — การจองครั้งถัดไปของคุณมีสิทธิ์รับส่วนลดโปรโมชั่นที่เข้าเงื่อนไข!`;
    return el(`
      <div class="panel" style="margin-top:16px;">
        <h3 style="margin-top:0;">สถานะสิทธิ์โปรโมชั่นของคุณ</h3>
        <p style="margin:0;color:${hasBooked ? 'var(--text-muted)' : 'var(--green)'};font-size:14px;">${hasBooked ? '🔒' : '🎁'} ${msg}</p>
      </div>`);
  }
})(window.App);
