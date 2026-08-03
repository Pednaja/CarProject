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
  panel.innerHTML = ''; // เคลียร์พื้นที่กล่องเดิม

  //  สร้างโครงสร้างหน้าตาฟอร์ม Login
  const form = el(`
    <form class="auth-form">
      <h2>เข้าสู่ระบบ</h2>
      <div class="field">
        <label>อีเมล</label>
        <input type="email" name="email" placeholder="กรอกอีเมลของคุณ" required />
      </div>
      <div class="field">
        <label>รหัสผ่าน</label>
        <input type="password" name="password" placeholder="กรอกรหัสผ่าน" required />
      </div>
      <button type="submit" class="btn-primary">เข้าสู่ระบบ</button>
    </form>
  `);

  //  ผูก Event เมื่อกดปุ่ม เข้าสู่ระบบ เพื่อส่งข้อมูลไป MySQL
  form.onsubmit = async function (e) {
    e.preventDefault(); // กันหน้าเว็บรีเฟรช

    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        if (toast) toast('เข้าสู่ระบบสำเร็จ!', 'success');
        
        // บันทึกข้อมูลผู้ใช้ไว้ในเครื่อง
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        state.currentUser = result.user;

        // สลับไปหน้าเลือกดูรถ
        setTab('cars');
      } else {
        if (toast) toast(result.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
      }
    } catch (error) {
      console.error('Login Error:', error);
      if (toast) toast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
  };

  panel.appendChild(form);
}

  

  function renderRegisterForm(panel) {
  panel.innerHTML = ''; // เคลียร์พื้นที่กล่องเดิม

  // 🔹 สร้างโครงสร้างหน้าตาฟอร์ม สมัครสมาชิก
  const form = el(`
    <form class="auth-form">
      <h2>สมัครสมาชิก</h2>
      <div class="field">
        <label>ชื่อ-นามสกุล</label>
        <input type="text" name="name" placeholder="กรอกชื่อ-นามสกุล" required />
      </div>
      <div class="field">
        <label>เบอร์โทรศัพท์</label>
        <input type="tel" name="phone" placeholder="กรอกเบอร์โทรศัพท์" required />
      </div>
      <div class="field">
        <label>อีเมล</label>
        <input type="email" name="email" placeholder="กรอกอีเมลของคุณ" required />
      </div>
      <div class="field">
        <label>รหัสผ่าน</label>
        <input type="password" name="password" placeholder="กำหนดรหัสผ่าน" required />
      </div>
      <button type="submit" class="btn-primary">สมัครสมาชิก</button>
    </form>
  `);

  // 🔹 ผูก Event เมื่อกดปุ่ม สมัครสมาชิก
  form.onsubmit = async function (e) {
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value;
    const phone = form.querySelector('[name="phone"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });

      const result = await response.json();

      if (result.success) {
        if (toast) toast('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ', 'success');
        
        // สลับแท็บกลับมาหน้า Login
        state.ui.authMode = 'login';
        App.renderAuth();
      } else {
        if (toast) toast(result.message || 'สมัครสมาชิกไม่สำเร็จ', 'error');
      }
    } catch (error) {
      console.error('Register Error:', error);
      if (toast) toast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
  };

  panel.appendChild(form);
}
})(window.App);
