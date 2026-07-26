/* =========================================================
   หน้าเข้าสู่ระบบ และหน้าสมัครสมาชิก
   ========================================================= */
(function (App) {
  const { el, state, toast, setTab } = App;

  // ---------- หน้าเข้าสู่ระบบ ----------
  App.renderLogin = function renderLogin() {
    const wrap = el(`<div class="wrap"><div class="auth-wrap"></div></div>`);
    const box = wrap.querySelector('.auth-wrap');

    box.appendChild(el(`
      <div class="panel">
        <h3 style="margin-top:0;">เข้าสู่ระบบสมาชิก</h3>
        <div class="form-row single">
          <div><label>อีเมล (ต้องลงท้ายด้วย @gmail.com)</label><input type="email" id="loginEmail" placeholder="example@gmail.com"></div>
        </div>
        <div class="form-row single">
          <div><label>รหัสผ่าน</label><input type="password" id="loginPass" placeholder="••••••••"></div>
        </div>
        <button class="btn btn-primary" id="loginBtn" style="width:100%;margin-top:6px;">เข้าสู่ระบบ</button>
        <p class="hint" style="margin-top:14px;">ยังไม่มีบัญชี? <a href="#" id="goRegister">สมัครสมาชิก</a></p>
        <p class="hint">ทดลองบัญชีแอดมิน: <b>admin@gmail.com</b> / <b>admin123</b></p>
      </div>`));

    box.querySelector('#goRegister').addEventListener('click', (e) => { e.preventDefault(); setTab('register'); });

    box.querySelector('#loginBtn').addEventListener('click', () => {
      const email = box.querySelector('#loginEmail').value.trim().toLowerCase();
      const pass = box.querySelector('#loginPass').value;

      if (!email.endsWith('@gmail.com')) {
        toast('อีเมลเข้าสู่ระบบต้องลงท้ายด้วย @gmail.com เท่านั้น', true);
        return;
      }

      const user = state.users.find(u => u.email.toLowerCase() === email && u.password === pass);
      if (!user) { toast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', true); return; }

      state.currentUser = user;
      toast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' + user.name);
      setTab('home');
    });

    return wrap;
  };

  // ---------- หน้าสมัครสมาชิก ----------
  App.renderRegister = function renderRegister() {
    const wrap = el(`<div class="wrap"><div class="auth-wrap"></div></div>`);
    const box = wrap.querySelector('.auth-wrap');

    box.appendChild(el(`
      <div class="panel">
        <h3 style="margin-top:0;">สมัครสมาชิกใหม่</h3>
        <div class="form-row single"><div><label>ชื่อ-นามสกุล</label><input type="text" id="regName"></div></div>
        <div class="form-row single"><div><label>อีเมล (ต้องลงท้ายด้วย @gmail.com)</label><input type="email" id="regEmail" placeholder="name@gmail.com"></div></div>
        <div class="form-row single"><div><label>รหัสผ่าน</label><input type="password" id="regPass"></div></div>
        <button class="btn btn-primary" id="regBtn" style="width:100%;margin-top:6px;">สมัครสมาชิก</button>
        <p class="hint" style="margin-top:14px;">มีบัญชีอยู่แล้ว? <a href="#" id="goLogin">เข้าสู่ระบบ</a></p>
      </div>`));

    box.querySelector('#goLogin').addEventListener('click', (e) => { e.preventDefault(); setTab('login'); });

    box.querySelector('#regBtn').addEventListener('click', () => {
      const name = box.querySelector('#regName').value.trim();
      const email = box.querySelector('#regEmail').value.trim();
      const pass = box.querySelector('#regPass').value;

      if (!name || !email || !pass) { toast('กรุณากรอกข้อมูลให้ครบถ้วน', true); return; }

      if (!email.toLowerCase().endsWith('@gmail.com')) {
        toast('อีเมลที่ใช้สมัครต้องลงท้ายด้วย @gmail.com เท่านั้น', true);
        return;
      }

      if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast('อีเมลนี้ถูกใช้งานแล้ว', true);
        return;
      }

      const user = { name, email, password: pass, role: 'customer' };
      state.users.push(user);
      state.currentUser = user;
      toast('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ Rent Car');
      setTab('home');
    });

    return wrap;
  };

})(window.App);
