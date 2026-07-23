/* ============================
   หน้าต่าง login และ Regis 
   ============================ */
(function (App) {
  const { el, state, toast, setTab, nextId } = App;

  App.renderAuth = function renderAuth() {
    const wrap = el(`<div class="wrap"><div class="auth-wrap"></div></div>`);
    const box = wrap.querySelector('.auth-wrap');
    const mode = state.ui.authMode;

    box.appendChild(el(`
      <div class="auth-toggle">
        <button data-m="login" class="${mode === 'login' ? 'active' : ''}">เข้าสู่ระบบ</button>
        <button data-m="register" class="${mode === 'register' ? 'active' : ''}">สมัครสมาชิก</button>
      </div>`));
    box.querySelectorAll('.auth-toggle button').forEach(b => b.addEventListener('click', () => { state.ui.authMode = b.dataset.m; App.render(); }));

    const panel = el(`<div class="panel"></div>`);
    box.appendChild(panel);

    if (mode === 'login') {
      renderLoginForm(panel);
    } else {
      renderRegisterForm(panel);
    }

    return wrap;
  };

  function renderLoginForm(panel) {
    panel.appendChild(el(`
      <h3 style="margin-top:0;">เข้าสู่ระบบสมาชิก</h3>
      <div class="form-row single"><div><label>อีเมล (ต้องลงท้ายด้วย @gmail.com)</label><input type="email" id="loginEmail" placeholder="example@gmail.com"></div></div>
      <div class="form-row single"><div><label>รหัสผ่าน</label><input type="password" id="loginPass" placeholder="••••••••"></div></div>
      <button class="btn btn-primary" id="loginBtn" style="width:100%;margin-top:6px;">เข้าสู่ระบบ</button>
      <p class="hint" style="margin-top:14px;">ทดลองบัญชีแอดมิน: <b>admin@gmail.com</b> / <b>admin123</b></p>
    `));

    panel.querySelector('#loginBtn').addEventListener('click', () => {
      const email = panel.querySelector('#loginEmail').value.trim().toLowerCase();
      const pass = panel.querySelector('#loginPass').value;

      if (!email.endsWith('@gmail.com')) {
        toast('อีเมลเข้าสู่ระบบต้องลงท้ายด้วย @gmail.com เท่านั้น', true);
        return;
      }

      const u = state.users.find(u => u.email.toLowerCase() === email && u.password === pass);
      if (!u) { toast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', true); return; }

      state.currentUser = u;
      toast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' + u.name);
      setTab('cars');
    });
  }

  function renderRegisterForm(panel) {
    panel.appendChild(el(`
      <h3 style="margin-top:0;">สมัครสมาชิกใหม่</h3>
      <div class="form-row"><div><label>ชื่อ-นามสกุล</label><input type="text" id="regName"></div>
      <div><label>เบอร์โทรศัพท์ (10 หลัก)</label><input type="tel" id="regPhone" placeholder="08xxxxxxxx" maxlength="10"></div></div>
      <div class="form-row"><div><label>อีเมล (ต้องใช้ @gmail.com)</label><input type="email" id="regEmail" placeholder="name@gmail.com"></div>
      <div><label>เลขบัตรประชาชน (13 หลัก)</label><input type="text" id="regIdCard" placeholder="1234567890123" maxlength="13"></div></div>
      <div class="form-row single"><div><label>รหัสผ่าน</label><input type="password" id="regPass"></div></div>
      <button class="btn btn-primary" id="regBtn" style="width:100%;margin-top:6px;">สมัครสมาชิก</button>
    `));

    panel.querySelector('#regBtn').addEventListener('click', () => {
      const name = panel.querySelector('#regName').value.trim();
      const phone = panel.querySelector('#regPhone').value.trim();
      const email = panel.querySelector('#regEmail').value.trim();
      const idCard = panel.querySelector('#regIdCard').value.trim();
      const pass = panel.querySelector('#regPass').value;

      if (!name || !phone || !email || !idCard || !pass) { toast('กรุณากรอกข้อมูลให้ครบถ้วน', true); return; }

      if (!/^\d{10}$/.test(phone)) {
        toast('เบอร์โทรศัพท์ต้องเป็นตัวเลขความยาว 10 หลักพอดี', true);
        return;
      }

      if (!/^\d{13}$/.test(idCard)) {
        toast('เลขบัตรประชาชนต้องเป็นตัวเลขความยาว 13 หลักพอดี', true);
        return;
      }

      if (!email.toLowerCase().endsWith('@gmail.com')) {
        toast('อีเมลที่ใช้สมัครต้องลงท้ายด้วย @gmail.com เท่านั้น', true);
        return;
      }

      if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) { toast('อีเมลนี้ถูกใช้งานแล้ว', true); return; }

      const u = { id: nextId('u'), name, phone, email, idCard, password: pass, role: 'customer', isNewMember: true, joinedAt: new Date().toISOString().slice(0, 10) };
      state.users.push(u);
      state.currentUser = u;
      toast('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ Rent Car');
      setTab('cars');
    });
  }
})(window.App);
