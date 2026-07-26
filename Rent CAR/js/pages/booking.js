/* =========================================================
   การจองรถ — เปิดเป็น "หน้าต่างยืนยัน" (modal) ทับหน้าปัจจุบัน
   ไม่เปลี่ยนแท็บ/แถบเมนู เพราะยังไม่มีระบบจองเต็มรูปแบบ
   ========================================================= */
(function (App) {
  const { el, state, toast, money } = App;

  // เปิดหน้าต่างยืนยันการจองรถ ตาม carId ที่กดมาจากหน้าหลัก
  App.openBookingModal = function openBookingModal(carId) {
    const car = state.cars.find(c => c.id === carId);
    if (!car) { toast('ไม่พบรถคันนี้', true); return; }

    const modal = el(`
      <div class="modal panel">
        <h3 style="margin-top:0;">ยืนยันการจองรถ</h3>
        <p style="color:var(--text-muted);font-size:14px;margin-top:-6px;">
          ${car.brand} ${car.model} '${String(car.year).slice(-2)} —
          <span style="color:var(--amber);">฿${money(car.pricePerDay)}</span>/วัน
        </p>

        <div class="form-row single">
          <div><label>วันที่เริ่มเช่า</label><input type="date" id="bkStart"></div>
        </div>
        <div class="form-row single">
          <div><label>วันที่คืนรถ</label><input type="date" id="bkEnd"></div>
        </div>

        <div style="display:flex;gap:10px;margin-top:14px;">
          <button class="btn btn-ghost" id="bkCancel" style="flex:1;">ยกเลิก</button>
          <button class="btn btn-primary" id="bkConfirm" style="flex:1;">ยืนยันการจอง</button>
        </div>
      </div>`);

    modal.querySelector('#bkCancel').addEventListener('click', () => App.closeModal());

    modal.querySelector('#bkConfirm').addEventListener('click', () => {
      const start = modal.querySelector('#bkStart').value;
      const end = modal.querySelector('#bkEnd').value;

      if (!start || !end) { toast('กรุณาเลือกวันที่เริ่มเช่าและวันคืนรถ', true); return; }
      if (end <= start) { toast('วันคืนรถต้องอยู่หลังวันเริ่มเช่า', true); return; }

      // บันทึกการจองไว้ใน state (ยังไม่มีระบบสัญญา/ชำระเงินต่อจากนี้)
      state.bookings.push({
        carId: car.id,
        user: state.currentUser ? state.currentUser.email : null,
        startDate: start,
        endDate: end,
        createdAt: Date.now()
      });

      App.closeModal();
      toast(`จองรถ ${car.brand} ${car.model} สำเร็จ!`);
    });

    App.openModal(modal);
  };

})(window.App);
