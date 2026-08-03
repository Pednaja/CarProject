/* =========================================================
   หน้าต่าง Admin (add / edit / delete cars)
   ========================================================= */
(function (App) {
  const { el, state, money, statusLabel, contractStatusLabel, fmtDate, nextId, toast } = App;

  App.renderAdmin = function renderAdmin() {
    const wrap = el(`<div class="wrap"></div>`);
    wrap.appendChild(el(`
      <div class="pagehead">
        <h1>จัดการรถ (แอดมิน)</h1>
        <p>เพิ่ม แก้ไข หรือลบยานพาหนะพร้อมรูปถ่ายออกจากระบบ</p>
      </div>`));

    wrap.appendChild(buildAddCarPanel());
    wrap.appendChild(el(`<h3>รายการรถทั้งหมด (${state.cars.length})</h3>`));
    wrap.appendChild(buildCarTable());

    wrap.appendChild(el(`<div class="lane-divider"></div>`));
    wrap.appendChild(el(`<h3>การจองล่าสุด (${state.bookings.length}) — ขึ้นแสดงทันทีที่มีการจองใหม่</h3>`));
    wrap.appendChild(buildBookingsTable());

    return wrap;
  };

  function buildBookingsTable() {
    if (state.bookings.length === 0) {
      return el(`<div class="empty">ยังไม่มีการจองรถเข้ามาในระบบ</div>`);
    }

    const tbl = el(`<div class="panel"><table>
      <thead><tr><th>รหัสจอง</th><th>ลูกค้า</th><th>รถ</th><th>ช่วงเวลาเช่า</th><th>ยอดรวม</th><th>สถานะสัญญา</th></tr></thead>
      <tbody></tbody></table></div>`);
    const tbody = tbl.querySelector('tbody');

    state.bookings.slice().reverse().forEach(bk => {
      const car = state.cars.find(c => c.id === bk.carId);
      const customer = state.users.find(u => u.id === bk.userId);
      const contract = state.contracts.find(c => c.bookingId === bk.id);
      tbody.appendChild(el(`
        <tr>
          <td class="num">${bk.id}</td>
          <td>${customer ? customer.name : '-'}</td>
          <td>${car ? `${car.brand} ${car.model} (${car.plate})` : '-'}</td>
          <td>${fmtDate(bk.pickupDate)} — ${fmtDate(bk.returnDate)}</td>
          <td class="num">฿${money(bk.total)}</td>
          <td><span class="tag">${contract ? contractStatusLabel(contract.status) : '-'}</span></td>
        </tr>`));
    });

    return tbl;
  }

  function buildAddCarPanel() {
    const addPanel = el(`<div class="panel" style="margin-bottom:20px;"></div>`);
    addPanel.appendChild(el(`<h3 style="margin-top:0;">เพิ่มรถใหม่</h3>`));
    addPanel.appendChild(el(`
      <div class="form-row three">
        <div><label>ยี่ห้อ</label><input type="text" id="nCarBrand" placeholder="Toyota"></div>
        <div><label>รุ่น</label><input type="text" id="nCarModel" placeholder="Yaris"></div>
        <div><label>ปี</label><input type="number" id="nCarYear" value="2025"></div>
      </div>
      <div class="form-row three">
        <div><label>ทะเบียนรถ</label><input type="text" id="nCarPlate" placeholder="1กก 1234"></div>
        <div><label>หมวดหมู่</label><select id="nCarCat"><option>อีโค่คาร์</option><option>ซีดาน</option><option>เอสยูวี</option><option>กระบะ</option></select></div>
        <div><label>ราคา/วัน (บาท)</label><input type="number" id="nCarPrice" value="1200"></div>
      </div>
      <div class="form-row single">
        <div>
          <label>URL รูปภาพรถ (ใส่ลิงก์รูปภาพถ่ายของรถเพื่อแสดงผล)</label>
          <input type="text" id="nCarImage" placeholder="https://images.unsplash.com/... หรือ ปล่อยว่างไว้ใช้ภาพเงา">
        </div>
      </div>
      <div class="form-row three">
        <div><label>จำนวนที่นั่ง</label><input type="number" id="nCarSeats" value="5"></div>
        <div><label>เกียร์</label><select id="nCarTrans"><option>ออโต้</option><option>ธรรมดา</option></select></div>
        <div><label>เชื้อเพลิง</label><select id="nCarFuel"><option>เบนซิน</option><option>ดีเซล</option><option>ไฟฟ้า</option></select></div>
      </div>
      <button class="btn btn-primary" id="addCarBtn">เพิ่มรถเข้าระบบ</button>
    `));

    addPanel.querySelector('#addCarBtn').addEventListener('click', () => {
      const brand = addPanel.querySelector('#nCarBrand').value.trim();
      const model = addPanel.querySelector('#nCarModel').value.trim();
      const plate = addPanel.querySelector('#nCarPlate').value.trim();
      const image = addPanel.querySelector('#nCarImage').value.trim();

      if (!brand || !model || !plate) { toast('กรุณากรอก ยี่ห้อ รุ่น และทะเบียนรถ', true); return; }

      const cat = addPanel.querySelector('#nCarCat').value;

      // ถ้าแอดมินไม่ได้ใส่ลิงก์รูปภาพ ก็เก็บเป็นค่าว่างไว้ก่อน — หน้ารายการรถจะแสดง "ยังไม่มีรูปภาพ" ให้เอง
      state.cars.push({
        id: nextId('c'), brand, model, year: Number(addPanel.querySelector('#nCarYear').value) || 2025, plate,
        category: cat, seats: Number(addPanel.querySelector('#nCarSeats').value) || 5,
        transmission: addPanel.querySelector('#nCarTrans').value, fuel: addPanel.querySelector('#nCarFuel').value,
        pricePerDay: Number(addPanel.querySelector('#nCarPrice').value) || 1200, status: 'available',
        image: image
      });

      toast('เพิ่มรถพร้อมรูปถ่ายเข้าสู่ระบบสแล้ว');
      App.render();
    });

    return addPanel;
  }

  function buildCarTable() {
    const tbl = el(`<div class="panel"><table>
      <thead><tr><th>รถ</th><th>ทะเบียน</th><th>ราคา/วัน</th><th>สถานะ</th><th>การจัดการ</th></tr></thead>
      <tbody></tbody></table></div>`);
    const tbody = tbl.querySelector('tbody');

    state.cars.forEach(car => {
      tbody.appendChild(el(`
        <tr>
          <td>${car.brand} ${car.model}</td>
          <td class="num">${car.plate}</td>
          <td class="num">฿${money(car.pricePerDay)}</td>
          <td>
            <select data-status="${car.id}">
              <option value="available" ${car.status === 'available' ? 'selected' : ''}>ว่าง</option>
              <option value="rented" ${car.status === 'rented' ? 'selected' : ''}>ถูกเช่า</option>
              <option value="maintenance" ${car.status === 'maintenance' ? 'selected' : ''}>ซ่อมบำรุง</option>
            </select>
          </td>
          <td><button class="btn btn-danger btn-sm" data-del="${car.id}">ลบ</button></td>
        </tr>`));
    });

    tbl.querySelectorAll('[data-status]').forEach(s => s.addEventListener('change', () => {
      const car = state.cars.find(c => c.id === s.dataset.status);
      car.status = s.value;
      toast(`อัปเดตสถานะเป็น ${statusLabel(car.status)}`);
    }));

    tbl.querySelectorAll('[data-del]').forEach(d => d.addEventListener('click', () => {
      state.cars = state.cars.filter(c => c.id !== d.dataset.del);
      toast('ลบรถแล้ว');
      App.render();
    }));

    return tbl;
  }
})(window.App);
