/* =========================================================
หน้าต่าง Admin (add / edit / delete cars)
========================================================= */
(function (App) {
    'use strict';

    App.renderAdmin = function () {
        const container = document.createElement('div');
        container.className = 'container my-4';
        
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="text-white m-0">จัดการข้อมูลรถ</h2>
            </div>

            <div class="table-responsive">
                <table class="table table-dark table-striped align-middle">
                    <thead>
                        <tr>
                            <th>รูปภาพ</th>
                            <th>ยี่ห้อ/รุ่น</th>
                            <th>ทะเบียน</th>
                            <th>ราคา/วัน</th>
                            <th>สถานะ</th>
                            <th class="text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody id="admin-car-table-body">
                        <tr><td colspan="6" class="text-center text-muted">กำลังโหลดข้อมูล...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Modal สำหรับแก้ไขข้อมูลรถ -->
            <div id="editCarModal" class="modal fade" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content bg-dark text-white">
                  <div class="modal-header border-secondary">
                    <h5 class="modal-title">แก้ไขข้อมูลรถ</h5>
                    <button type="button" class="btn-close btn-close-white" id="closeModalBtn"></button>
                  </div>
                  <div class="modal-body">
                    <form id="editCarForm">
                      <input type="hidden" id="edit-id">
                      <div class="mb-2"><label>ยี่ห้อ</label><input type="text" id="edit-brand" class="form-control bg-secondary text-white border-0" required></div>
                      <div class="mb-2"><label>รุ่น</label><input type="text" id="edit-model" class="form-control bg-secondary text-white border-0" required></div>
                      <div class="mb-2"><label>ทะเบียน</label><input type="text" id="edit-plate" class="form-control bg-secondary text-white border-0" required></div>
                      <div class="mb-2"><label>ราคา/วัน (บาท)</label><input type="number" id="edit-price" class="form-control bg-secondary text-white border-0" required></div>
                      <div class="mb-2">
                        <label>สถานะ</label>
                        <select id="edit-status" class="form-select bg-secondary text-white border-0">
                          <option value="available">พร้อมให้เช่า (available)</option>
                          <option value="rented">ถูกเช่าอยู่ (rented)</option>
                          <option value="maintenance">ซ่อมบำรุง (maintenance)</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label>URL รูปภาพ (ลิงก์รูป)</label>
                        <input type="text" id="edit-image" class="form-control bg-secondary text-white border-0" placeholder="https://example.com/car.jpg">
                      </div>
                      <button type="submit" class="btn btn-warning w-100">บันทึกการแก้ไข</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
        `;

        let carsData = [];

        // ฟังก์ชันดึงข้อมูลมาแสดงผล
        async function loadCars() {
            try {
                const res = await fetch('http://localhost:5000/api/cars');
                carsData = await res.json();
                const tbody = container.querySelector('#admin-car-table-body');
                
                if (!tbody) return;

                if (!carsData || carsData.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">ไม่มีข้อมูลรถในระบบ</td></tr>`;
                    return;
                }

                tbody.innerHTML = carsData.map(c => `
                    <tr>
                        <td>
                            <img src="${c.image || 'https://via.placeholder.com/80?text=No+Image'}" 
                                 width="80" height="50" style="object-fit:cover;" class="rounded border border-secondary"
                                 onerror="this.src='https://via.placeholder.com/80?text=Error'">
                        </td>
                        <td><strong>${c.brand}</strong> ${c.model}</td>
                        <td>${c.plate}</td>
                        <td>฿${Number(c.pricePerDay).toLocaleString()}</td>
                        <td>
                            <span class="badge bg-${c.status === 'available' ? 'success' : c.status === 'rented' ? 'warning' : 'danger'}">
                                ${c.status}
                            </span>
                        </td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-warning edit-btn me-1" data-id="${c.id}">แก้ไข/ใส่รูป</button>
                            <button class="btn btn-sm btn-outline-danger del-btn" data-id="${c.id}">ลบ</button>
                        </td>
                    </tr>
                `).join('');

                // ผูก Event ปุ่มลบ
                tbody.querySelectorAll('.del-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('ยืนยันที่จะลบรถคันนี้?')) return;
                        const carId = btn.dataset.id;
                        await fetch(`http://localhost:5000/api/cars/${carId}`, { method: 'DELETE' });
                        loadCars();
                    });
                });

                // ผูก Event ปุ่มแก้ไข
                tbody.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const car = carsData.find(item => item.id === btn.dataset.id);
                        if (!car) return;

                        // เอาข้อมูลเดิมมาหยอดใส่ Modal
                        container.querySelector('#edit-id').value = car.id;
                        container.querySelector('#edit-brand').value = car.brand;
                        container.querySelector('#edit-model').value = car.model;
                        container.querySelector('#edit-plate').value = car.plate;
                        container.querySelector('#edit-price').value = car.pricePerDay;
                        container.querySelector('#edit-status').value = car.status;
                        container.querySelector('#edit-image').value = car.image || '';

                        // แสดง Modal
                        const modal = container.querySelector('#editCarModal');
                        modal.classList.add('show');
                        modal.style.display = 'block';
                    });
                });

            } catch (err) {
                console.error("Error loading cars:", err);
            }
        }

        // ปิด Modal
        const closeModal = () => {
            const modal = container.querySelector('#editCarModal');
            modal.classList.remove('show');
            modal.style.display = 'none';
        };
        container.querySelector('#closeModalBtn').addEventListener('click', closeModal);

        // บันทึกฟอร์มแก้ไข
        container.querySelector('#editCarForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = container.querySelector('#edit-id').value;
            const updatedCar = {
                brand: container.querySelector('#edit-brand').value,
                model: container.querySelector('#edit-model').value,
                plate: container.querySelector('#edit-plate').value,
                pricePerDay: container.querySelector('#edit-price').value,
                status: container.querySelector('#edit-status').value,
                image: container.querySelector('#edit-image').value
            };

            try {
                const res = await fetch(`http://localhost:5000/api/cars/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedCar)
                });

                if (res.ok) {
                    closeModal();
                    loadCars(); // รีโหลดตาราง
                } else {
                    alert('บันทึกไม่สำเร็จ');
                }
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            }
        });

        loadCars();
        return container;
    };

})(window.App = window.App || {});

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

  addPanel.querySelector('#addCarBtn').addEventListener('click', async () => {
      const brand = addPanel.querySelector('#nCarBrand').value.trim();
      const model = addPanel.querySelector('#nCarModel').value.trim();
      const plate = addPanel.querySelector('#nCarPlate').value.trim();
      const image = addPanel.querySelector('#nCarImage').value.trim();

      if (!brand || !model || !plate) { toast('กรุณากรอก ยี่ห้อ รุ่น และทะเบียนรถ', true); return; }

      const cat = addPanel.querySelector('#nCarCat').value;

      const newCar = {
        id: nextId('c'), brand, model, year: Number(addPanel.querySelector('#nCarYear').value) || 2025, plate,
        category: cat, seats: Number(addPanel.querySelector('#nCarSeats').value) || 5,
        transmission: addPanel.querySelector('#nCarTrans').value, fuel: addPanel.querySelector('#nCarFuel').value,
        pricePerDay: Number(addPanel.querySelector('#nCarPrice').value) || 1200, status: 'available',
        image: image
      };

      try {
        const res = await fetch('http://localhost:5000/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCar)
        });

        if (!res.ok) throw new Error('ไม่สามารถเพิ่มรถลงฐานข้อมูลได้');

        state.cars.push(newCar);
        toast('เพิ่มรถเข้าระบบสำเร็จ');
        App.render();
      } catch (err) {
        toast(err.message, true);
      }
    });

// ดึง tbody จากตารางแอดมิน
const tbl = document.getElementById('admin-car-table-body') || document.querySelector('#adminCarsTable tbody');

if (tbl) {
    tbl.innerHTML = htmlContent;

    tbl.querySelectorAll('[data-del]').forEach(d => {
        d.addEventListener('click', async () => {
            const carId = d.dataset.del;
            if (!confirm(`คุณต้องการลบรถรหัส ${carId} ใช่หรือไม่?`)) return;

            try {
                const res = await fetch(`http://localhost:5000/api/cars/${carId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('ลบรถไม่สำเร็จ');

                state.cars = state.cars.filter(c => c.id !== carId);
                toast('ลบรถออกจากระบบแล้ว');
                
                // เรียกฟังก์ชันเรนเดอร์หน้าแอดมินใหม่อีกรอบ
                if (typeof App.renderAdmin === 'function') {
                    App.renderAdmin();
                } else if (typeof App.render === 'function') {
                    App.render();
                }
            } catch (err) {
                toast(err.message, true);
            }
        });
    });
}

// ประกาศสร้าง App object
window.App = window.App || {};

App.renderAdmin = async function() {
    const app = document.getElementById('app');
    if (!app) return;

    // ข้อมูลรถจาก API
    try {
        const res = await fetch('http://localhost:5000/api/cars');
        if (res.ok) {
            state.cars = await res.json();
        }
    } catch (err) {
        console.error("Error fetching cars:", err);
    }

    //หน้าจอแอดมิน
    app.innerHTML = `
        <div class="container my-4">
            <h2 class="text-white mb-4">จัดการข้อมูลรถ</h2>
            <table class="table table-dark table-striped">
                <thead>
                    <tr>
                        <th>รูปภาพ</th>
                        <th>ยี่ห้อ/รุ่น</th>
                        <th>ทะเบียน</th>
                        <th>ราคา/วัน</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody id="admin-car-table-body"></tbody>
            </table>
        </div>
    `;

    // ใส่ข้อมูลลงในตาราง
    const tbl = document.getElementById('admin-car-table-body');
    if (tbl) {
        if (!state.cars || state.cars.length === 0) {
            tbl.innerHTML = `<tr><td colspan="6" class="text-center text-muted">ไม่มีข้อมูลรถในระบบ</td></tr>`;
        } else {
            tbl.innerHTML = state.cars.map(c => `
                <tr>
                    <td><img src="${c.image || 'https://via.placeholder.com/80'}" width="80" class="rounded"></td>
                    <td><strong>${c.brand}</strong> ${c.model}</td>
                    <td>${c.plate}</td>
                    <td>฿${Number(c.pricePerDay).toLocaleString()}</td>
                    <td><span class="badge bg-${c.status === 'available' ? 'success' : 'danger'}">${c.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" data-del="${c.id}">ลบ</button>
                    </td>
                </tr>
            `).join('');
        }
    }
};