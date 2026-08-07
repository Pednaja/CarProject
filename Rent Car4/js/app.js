(function (App) {
  const { el, state } = App;

  // สร้างฟังก์ชันยิง API ไปดึงข้อมูลรถจาก Backend (MySQL)
  async function loadCarsFromDB() {
    try {
      const res = await fetch('http://localhost:5000/api/cars');
      if (res.ok) {
        const data = await res.json();
        state.cars = data; // เอาข้อมูลจาก DB มาทับ state
        App.render();      // วาดหน้าจอใหม่เมื่อได้ข้อมูลครบ
      }
    } catch (err) {
      console.error('ไม่สามารถเชื่อมต่อกับ Database ได้:', err);
    }
  }

  App.render = function render() {
    const app = document.getElementById('app'); 
    app.innerHTML = ''; 
    app.appendChild(App.renderNav()); 

    let page;
    switch (state.ui.tab) {
      case 'auth': page = App.renderAuth(); break; 
      case 'booking': page = App.renderBooking(); break; 
      case 'contracts': page = App.renderContracts(); break; 
      case 'payments': page = App.renderPayments(); break; 
      case 'promotions': page = App.renderPromotions(); break; 
      case 'admin':
    if (typeof App.renderAdmin === 'function') {
        page = App.renderAdmin();
    } else {
        page = el('<div class="container my-5 text-center text-white"><h2>กำลังโหลดหน้าจัดการ...</h2></div>');
    }
    break;
      default:
        page = App.renderCars(); 
    }
    app.appendChild(page); 
  };
  // 2. เรียกดึงข้อมูลจาก DB 
  loadCarsFromDB();
  
  
  App.render(); 
})(window.App);