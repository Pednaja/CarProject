/* ============================
   หน้าต่าง login และ Regis 
   ============================ */
(function (App) {
  const { el, state, toast, setTab, nextId } = App; //

  App.renderAuth = function renderAuth() {
    const wrap = el(`<div class="wrap"><div class="auth-wrap"></div></div>`); //[cite: 6]
    const box = wrap.querySelector('.auth-wrap'); //[cite: 6]
    const mode = state.ui.authMode; //[cite: 6]

    box.appendChild(el(`
      <div class="auth-toggle">
        <button data-m="login" class="${mode === 'login' ? 'active' : ''}">เข้าสู่ระบบ</button>
        <button data-m="register" class="${mode === 'register' ? 'active' : ''}">สมัครสมาชิก</button>
      </div>`)); //[cite: 6]
    box.querySelectorAll('.auth-toggle button').forEach(b => b.addEventListener('click', () => { state.ui.authMode = b.dataset.m; App.render(); })); //[cite: 6]

    const panel = el(`<div class="panel"></div>`); //[cite: 6]
    box.appendChild(panel); //[cite: 6]

    if (mode === 'login') {
      renderLoginForm(panel); //[cite: 6]
    } else {
      renderRegisterForm(panel); //[cite: 6]
    }

    return wrap; //[cite: 6]
  };

  function renderLoginForm(panel) {
    panel.appendChild(el(`
      <h3 style="margin-top:0;">เข้าสู่ระบบสมาชิก</h3>
      <div class="form-row single"><div><label>อีเมล (ต้องลงท้ายด้วย @gmail.com)</label><input type="email" id="loginEmail" placeholder="example@gmail.com"></div></div>
      <div class="form-row single"><div><label>รหัสผ่าน</label><input type="password" id="loginPass" placeholder="••••••••"></div></div>
      <button class="btn btn-primary" id="loginBtn" style="width:100%;margin-top:6px;">เข้าสู่ระบบ</button>
      <p class="hint" style="margin-top:14px;">ทดลองบัญชีแอดมิน: <b>admin@gmail.com</b> / <b>admin123</b></p>
    `)); //[cite: 6]

    // --- แก้ไขจุดที่ 1: Login ยิงไปเช็คใน MySQL ---
    panel.querySelector('#loginBtn').addEventListener('click', async () => {
      const email = panel.querySelector('#loginEmail').value.trim().toLowerCase();
      const pass = panel.querySelector('#loginPass').value;

      if (!email.endsWith('@gmail.com')) {
        toast('อีเมลเข้าสู่ระบบต้องลงท้ายด้วย @gmail.com เท่านั้น', true); //[cite: 6]
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');

        state.currentUser = data; // บันทึกข้อมูล user ที่ตอบกลับมาจาก MySQL
        toast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' + data.name);
        setTab('cars'); //[cite: 6]
      } catch (err) {
        toast(err.message, true);
      }
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
    `)); //[cite: 6]

    // --- แก้ไขจุดที่ 2: Register บันทึกลง MySQL ---
    panel.querySelector('#regBtn').addEventListener('click', async () => {
      const name = panel.querySelector('#regName').value.trim();
      const phone = panel.querySelector('#regPhone').value.trim();
      const email = panel.querySelector('#regEmail').value.trim();
      const idCard = panel.querySelector('#regIdCard').value.trim();
      const pass = panel.querySelector('#regPass').value;

      if (!name || !phone || !email || !idCard || !pass) { toast('กรุณากรอกข้อมูลให้ครบถ้วน', true); return; } //[cite: 6]

      if (!/^\d{10}$/.test(phone)) {
        toast('เบอร์โทรศัพท์ต้องเป็นตัวเลขความยาว 10 หลัก', true); //[cite: 6]
        return;
      }

      if (!/^\d{13}$/.test(idCard)) {
        toast('เลขบัตรประชาชนต้องเป็นตัวเลขความยาว 13 หลัก', true); //[cite: 6]
        return;
      }

      if (!email.toLowerCase().endsWith('@gmail.com')) {
        toast('อีเมลที่ใช้สมัครต้องลงท้ายด้วย @gmail.com เท่านั้น', true); //[cite: 6]
        return;
      }

      const newUser = {
        id: nextId('u'),
        name,
        phone,
        email,
        idCard,
        password: pass,
        role: 'customer',
        isNewMember: true,
        joinedAt: new Date().toISOString().slice(0, 10)
      };

      try {
        const res = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');

        state.currentUser = newUser;
        toast('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ Rent Car');
        setTab('cars'); //[cite: 6]
      } catch (err) {
        toast(err.message, true);
      }
    });
  }
})(window.App);