/* =========================================================
   แถบเมนูด้านบน 
   ========================================================= */
(function (App) {
  const { el, state } = App;

  App.renderNav = function renderNav() {
    // รายการเมนู 
    const tabs = [
      { id: 'home', label: 'หน้าหลัก' },
      { id: 'booking', label: 'จองรถ' },
      { id: 'contract', label: 'สัญญาเช่า' },
      { id: 'payment', label: 'ชำระเงิน' },
      { id: 'promo', label: 'โปรโมชั่น' },
      { id: 'admin', label: 'แอดมิน' }
    ];
    App.navTabs = tabs; // เก็บไว้ให้ตัวจัดการหน้า (router) เอาไปใช้อ้างอิงชื่อแท็บได้

    const tabsHtml = tabs.map(t =>
      `<button class="navtab ${state.tab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`
    ).join('');

    // ฝั่งขวาของเมนู ถ้าล็อกอินแล้วโชว์ชื่อ+ปุ่มออกจากระบบ ถ้ายังไม่ล็อกอินโชว์ปุ่มเข้าสู่ระบบ/สมัครสมาชิก
    const userHtml = state.currentUser
      ? `<div class="navuser">
           <span class="who">สวัสดี, <b>${state.currentUser.name}</b>${state.currentUser.role === 'admin' ? ' (แอดมิน)' : ''}</span>
           <button class="btn btn-ghost btn-sm" id="logoutBtn">ออกจากระบบ</button>
         </div>`
      : `<div class="navuser">
           <button class="btn btn-ghost btn-sm" id="loginNavBtn">เข้าสู่ระบบ</button>
           <button class="btn btn-primary btn-sm" id="registerNavBtn">สมัครสมาชิก</button>
         </div>`;

    const nav = el(`
      <div class="signpost">
        <div class="signpost-inner">
          <div class="brand"><span class="plate-dot"></span> Rent Car <span style="color:var(--text-faint);font-weight:400;font-size:13px;">เช่ารถออนไลน์</span></div>
          <div class="navtabs">${tabsHtml}</div>
          ${userHtml}
        </div>
      </div>`);

    nav.querySelectorAll('.navtab').forEach(b => b.addEventListener('click', () => App.setTab(b.dataset.tab)));

    const logoutBtn = nav.querySelector('#logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      state.currentUser = null;
      App.toast('ออกจากระบบแล้ว');
      App.setTab('home');
    });

    const loginNavBtn = nav.querySelector('#loginNavBtn');
    if (loginNavBtn) loginNavBtn.addEventListener('click', () => App.setTab('login'));

    const registerNavBtn = nav.querySelector('#registerNavBtn');
    if (registerNavBtn) registerNavBtn.addEventListener('click', () => App.setTab('register'));

    return nav;
  };

})(window.App);
