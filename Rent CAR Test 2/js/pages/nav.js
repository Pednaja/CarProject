/* =========================================================
   หน้าต่างปุ่ม/แถบเมนู 
   ========================================================= */
(function (App) {
  const { el, state } = App;

  App.renderNav = function renderNav() {
    const tabs = [
      { id: 'cars', label: 'รถทั้งหมด' },
      { id: 'booking', label: 'จองรถ' },
      { id: 'contracts', label: 'สัญญาเช่า' },
      { id: 'payments', label: 'ชำระเงิน' },
      { id: 'promotions', label: 'โปรโมชั่น' }
    ];
    if (state.currentUser && state.currentUser.role === 'admin') tabs.push({ id: 'admin', label: 'จัดการรถ' });

    const tabsHtml = tabs.map(t => `<button class="navtab ${state.ui.tab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');

    const userHtml = state.currentUser
      ? `<div class="navuser">
           <span class="who">สวัสดี, <b>${state.currentUser.name}</b>${state.currentUser.role === 'admin' ? ' (แอดมิน)' : ''}</span>
           <button class="btn btn-ghost btn-sm" id="logoutBtn">ออกจากระบบ</button>
         </div>`
      : `<div class="navuser"><button class="btn btn-primary btn-sm" id="loginNavBtn">เข้าสู่ระบบ</button></div>`;

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
    if (logoutBtn) logoutBtn.addEventListener('click', () => { state.currentUser = null; App.toast('ออกจากระบบแล้ว'); App.setTab('cars'); });

    const loginNavBtn = nav.querySelector('#loginNavBtn');
    if (loginNavBtn) loginNavBtn.addEventListener('click', () => App.setTab('auth'));

    return nav;
  };
})(window.App);
