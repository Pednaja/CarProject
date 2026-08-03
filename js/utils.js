(function (App) {

  // Build a DOM node from an HTML string
  App.el = function el(html) {
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    if (d.children.length === 1) return d.firstElementChild;
    d.style.display = 'contents';
    return d;
  };

  App.money = function money(n) {
    return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  App.fmtDate = function fmtDate(d) {
    if (!d) return '-';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  App.toast = function toast(msg, isErr) {
    const t = App.el(`<div class="toast ${isErr ? 'err' : ''}">${msg}</div>`);
    document.getElementById('toastWrap').appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = '.3s';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  };

  App.setTab = function setTab(tab) {
    App.state.ui.tab = tab;
    App.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  App.requireLogin = function requireLogin() {
    if (!App.state.currentUser) {
      App.toast('กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้', true);
      App.setTab('auth');
      return false;
    }
    return true;
  };

  App.statusLabel = function statusLabel(s) {
    return { available: 'ว่าง', reserved: 'จองแล้ว', rented: 'ถูกเช่า', maintenance: 'ซ่อมบำรุง' }[s] || s;
  };

  App.contractStatusLabel = function contractStatusLabel(s) {
    return { pending_payment: 'รอชำระเงิน', active: 'กำลังเช่า', closed: 'คืนรถแล้ว' }[s] || s;
  };

  App.daysBetween = function daysBetween(d1, d2) {
    const a = new Date(d1 + 'T00:00:00'), b = new Date(d2 + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  };

  // วาดวงแหวนตัวเลขสรุป (ใช้ในหน้ารายการรถ เช่น "รถว่างกี่คัน")
  App.gaugeSvg = function gaugeSvg(value, total, color) {
    const r = 22, c = 2 * Math.PI * r;
    const pct = total > 0 ? value / total : 0;
    const off = c * (1 - pct);
    return `<svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="${r}" fill="none" stroke="var(--line)" stroke-width="5"/>
      <circle cx="26" cy="26" r="${r}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 26 26)"/>
    </svg>`;
  };

})(window.App);
