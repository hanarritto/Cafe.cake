// =========================================================
// LITTLE LEAF CAFÉ
// JavaScript + Vue 3
// =========================================================


// =========================================================
// CREATE VUE APPLICATION
// =========================================================

const { createApp } = Vue;

createApp({

  // =======================================================
  // DATA
  // เก็บข้อมูลและสถานะต่าง ๆ ของเว็บไซต์
  // =======================================================

  data() {
    return {

      // -------------------- Menu --------------------

      // รายการเมนูทั้งหมด
      menu: [],

      // สถานะการโหลดเมนู
      loading: true,

      // Category ที่เลือก
      selectedCategory: "All",


      // -------------------- UI --------------------

      // เปิด / ปิด Mobile Menu
      mobileMenuOpen: false,

      // Dark Mode
      darkMode:
        localStorage.getItem("littleLeafDarkMode") === "true",

      // แสดง / ซ่อนปุ่ม Go Top
      showGoTop: false,


      // -------------------- Menu Detail --------------------

      // เมนูที่กำลังดูรายละเอียด
      selectedItem: null,

      // จำนวนสินค้าที่เลือก
      detailQuantity: 1,


      // -------------------- Cart --------------------

      // รายการสินค้าในตะกร้า
      cart: [],

      // เปิด / ปิด Checkout
      checkoutOpen: false,


      // -------------------- Order --------------------

      // Order ปัจจุบัน
      currentOrder: null,

      // เปิด / ปิด Receipt
      receiptOpen: false,


      // -------------------- Order Form --------------------

      // ข้อมูลสำหรับสั่งซื้อ
      orderForm: {
        name: "",
        email: "",
        phone: "",
        note: ""
      },


      // -------------------- Contact Form --------------------

      // ข้อมูลจาก Contact Form
      contactForm: {
        name: "",
        email: "",
        message: ""
      },


      // -------------------- Toast --------------------

      // ข้อความแจ้งเตือน
      toastMessage: ""
    };
  },


  // =======================================================
  // COMPUTED
  // คำนวณข้อมูลจาก Data และอัปเดตอัตโนมัติ
  // =======================================================

  computed: {

    // สร้างรายการ Category จาก Menu
    categories() {
      return [
        "All",
        ...new Set(
          this.menu.map(item => item.category)
        )
      ];
    },


    // กรอง Menu ตาม Category ที่เลือก
    filteredMenu() {

      if (this.selectedCategory === "All") {
        return this.menu;
      }

      return this.menu.filter(
        item => item.category === this.selectedCategory
      );
    },


    // คำนวณราคารวมของสินค้าใน Cart
    cartTotal() {
      return this.cart.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      );
    }
  },


  // =======================================================
  // LIFECYCLE
  // ทำงานเมื่อ Vue โหลดและเชื่อมต่อกับ HTML
  // =======================================================

  async mounted() {

    // โหลด Menu จาก menu.json
    await this.loadMenu();

    // โหลด Order จาก Local Storage
    this.loadCurrentOrder();

    // โหลดสถานะ Dark Mode
    document.body.classList.toggle(
      "dark-mode",
      this.darkMode
    );

    // ตรวจจับการ Scroll
    window.addEventListener(
      "scroll",
      this.handleScroll
    );
  },


  // ลบ Event Listener ก่อน Vue ถูกถอดออก
  beforeUnmount() {

    window.removeEventListener(
      "scroll",
      this.handleScroll
    );
  },


  // =======================================================
  // METHODS
  // รวม Function ทั้งหมดของเว็บไซต์
  // =======================================================

  methods: {


    // =====================================================
    // FETCH + JSON
    // โหลดข้อมูล Menu จาก menu.json
    // =====================================================

    async loadMenu() {
      try {

        const response =
          await fetch("menu.json");

        if (!response.ok) {
          throw new Error(
            "ไม่สามารถโหลด menu.json ได้"
          );
        }

        // แปลง JSON → JavaScript Object
        this.menu = await response.json();

      } catch (error) {

        console.error(error);

        this.showToast(
          "โหลดเมนูไม่สำเร็จ"
        );

      } finally {

        this.loading = false;
      }
    },


    // =====================================================
    // DARK MODE
    // เปิด / ปิด Dark Mode
    // =====================================================

    toggleDarkMode() {

      this.darkMode =
        !this.darkMode;

      document.body.classList.toggle(
        "dark-mode",
        this.darkMode
      );

      // บันทึกสถานะ Dark Mode
      localStorage.setItem(
        "littleLeafDarkMode",
        this.darkMode
      );

      this.playClick();
    },


    // =====================================================
    // MOBILE MENU
    // จัดการ Mobile Navigation
    // =====================================================

    closeMobileMenu() {

      this.mobileMenuOpen = false;
    },


    // =====================================================
    // MENU DETAIL
    // เปิด / ปิดรายละเอียดสินค้า
    // =====================================================

    openMenuDetail(item) {

      this.selectedItem = item;

      this.detailQuantity = 1;

      this.playClick();
    },


    closeMenuDetail() {

      this.selectedItem = null;

      this.detailQuantity = 1;
    },


    // เพิ่ม / ลดจำนวนสินค้าใน Menu Detail
    changeDetailQuantity(amount) {

      this.detailQuantity += amount;

      if (this.detailQuantity < 1) {
        this.detailQuantity = 1;
      }

      this.playClick();
    },


    // =====================================================
    // CART
    // จัดการสินค้าในตะกร้า
    // =====================================================

    addToOrder(item, quantity) {

      // ตรวจสอบว่าสินค้ามีอยู่ใน Cart แล้วหรือไม่
      const existing = this.cart.find(
        cartItem => cartItem.id === item.id
      );

      if (existing) {

        // ถ้ามีอยู่แล้ว → เพิ่มจำนวน
        existing.quantity += quantity;

      } else {

        // ถ้ายังไม่มี → เพิ่มสินค้าใหม่
        this.cart.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity
        });
      }

      this.playClick();

      this.showToast(
        `${item.name} × ${quantity} added to order`
      );

      this.closeMenuDetail();

      // เปิด Checkout
      this.checkoutOpen = true;
    },


    // เพิ่ม / ลดจำนวนสินค้าใน Cart
    changeCartQuantity(id, amount) {

      const item = this.cart.find(
        cartItem => cartItem.id === id
      );

      if (!item) return;

      item.quantity += amount;

      // ถ้าจำนวนเหลือ 0 → ลบออกจาก Cart
      if (item.quantity <= 0) {

        this.cart = this.cart.filter(
          cartItem => cartItem.id !== id
        );
      }

      this.playClick();
    },


    // =====================================================
    // ORDER + LOCAL STORAGE
    // จัดการ Order และบันทึกข้อมูลใน Browser
    // =====================================================

    loadCurrentOrder() {

      // โหลด Order จาก Local Storage
      const saved =
        localStorage.getItem(
          "littleLeafCurrentOrder"
        );

      if (!saved) {
        return;
      }

      try {

        // JSON String → JavaScript Object
        const order = JSON.parse(saved);

        // แสดงเฉพาะ Order ของวันนี้
        if (this.isToday(order.createdAt)) {

          this.currentOrder = order;

        } else {

          // ลบ Order ของวันเก่า
          localStorage.removeItem(
            "littleLeafCurrentOrder"
          );
        }

      } catch (error) {

        console.error(
          "อ่าน Order ไม่สำเร็จ",
          error
        );

        localStorage.removeItem(
          "littleLeafCurrentOrder"
        );
      }
    },


    // =====================================================
    // SUBMIT ORDER
    // สร้าง Order ใหม่ หรือเพิ่มสินค้าเข้า Order เดิม
    // =====================================================

    submitOrder() {

      // ตรวจสอบว่า Cart มีสินค้าหรือไม่
      if (this.cart.length === 0) {

        this.showToast(
          "Please add something first 🍰"
        );

        return;
      }

      const now = new Date();


      // ---------------------------------------------------
      // สร้าง Order ใหม่
      // ---------------------------------------------------

      if (!this.currentOrder) {

        const orderId =
          "LL" +
          Date.now().toString().slice(-6);

        this.currentOrder = {

          id: orderId,

          createdAt:
            now.toISOString(),

          customer: {
            name: this.orderForm.name,
            email: this.orderForm.email,
            phone: this.orderForm.phone,
            note: this.orderForm.note
          },

          items: this.cart.map(item => ({
            ...item,
            addedLater: false
          })),

          total: this.cartTotal
        };


      // ---------------------------------------------------
      // เพิ่มสินค้าเข้า Order เดิม
      // ---------------------------------------------------

      } else {

        this.cart.forEach(cartItem => {

          const existing =
            this.currentOrder.items.find(
              item => item.id === cartItem.id
            );

          if (existing) {

            // ถ้ามีสินค้าเดิม → เพิ่มจำนวน
            existing.quantity +=
              cartItem.quantity;

          } else {

            // ถ้าเป็นสินค้าใหม่ → เพิ่มเข้า Order
            this.currentOrder.items.push({
              ...cartItem,
              addedLater: true
            });
          }
        });


        // คำนวณยอดรวมใหม่
        this.currentOrder.total =
          this.currentOrder.items.reduce(
            (total, item) =>
              total + item.price * item.quantity,
            0
          );


        // อัปเดตข้อมูลลูกค้า
        this.currentOrder.customer = {
          name: this.orderForm.name,
          email: this.orderForm.email,
          phone: this.orderForm.phone,
          note: this.orderForm.note
        };
      }


      // ---------------------------------------------------
      // บันทึก Order ลง Local Storage
      // ---------------------------------------------------

      localStorage.setItem(
        "littleLeafCurrentOrder",
        JSON.stringify(this.currentOrder)
      );


      // ---------------------------------------------------
      // Reset หลัง Submit
      // ---------------------------------------------------

      this.cart = [];

      this.checkoutOpen = false;

      this.resetOrderForm();


      // ---------------------------------------------------
      // แสดงข้อความสำเร็จ
      // ---------------------------------------------------

      this.showToast(
        this.currentOrder.items.some(
          item => item.addedLater
        )
          ? "Added to your existing order ✦"
          : "Your order has been submitted ♡"
      );


      // เปิด Receipt หลังจาก 350ms
      setTimeout(() => {

        this.openReceipt();

      }, 350);
    },


    // Reset Order Form
    resetOrderForm() {

      this.orderForm = {
        name:
          this.currentOrder?.customer?.name || "",

        email:
          this.currentOrder?.customer?.email || "",

        phone:
          this.currentOrder?.customer?.phone || "",

        note:
          this.currentOrder?.customer?.note || ""
      };
    },


    // =====================================================
    // RECEIPT
    // เปิดใบเสร็จ
    // =====================================================

    openReceipt() {

      if (!this.currentOrder) return;

      this.receiptOpen = true;

      this.playClick();
    },


    // =====================================================
    // DATE + TIME
    // จัดการวันที่และเวลา
    // =====================================================

    // ตรวจสอบว่า Order เป็นของวันนี้หรือไม่
    isToday(dateString) {

      const date =
        new Date(dateString);

      const today =
        new Date();

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    },


    // Format วันที่
    formatDate(dateString) {

      return new Intl.DateTimeFormat(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      ).format(
        new Date(dateString)
      );
    },


    // Format เวลา
    formatTime(dateString) {

      return new Intl.DateTimeFormat(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      ).format(
        new Date(dateString)
      );
    },


    // =====================================================
    // SCROLL
    // จัดการการ Scroll ของเว็บไซต์
    // =====================================================

    // ตรวจจับตำแหน่ง Scroll
    handleScroll() {

      // ถ้า Scroll มากกว่า 500px
      // ให้แสดงปุ่ม Go Top

      this.showGoTop =
        window.scrollY > 500;
    },


    // เลื่อนกลับไปด้านบน
    goTop() {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      this.playClick();
    },


    // เลื่อนไปยัง Menu Section
    scrollToMenu() {

      document
        .getElementById("menu")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    },


    // =====================================================
    // CONTACT FORM
    // จัดการ Contact Form
    // =====================================================

    submitContact() {

      // Prototype:
      // ยังไม่มี Backend จริง

      this.showToast(
        "Thank you! Your message was received ♡"
      );

      this.contactForm = {
        name: "",
        email: "",
        message: ""
      };
    },


    // =====================================================
    // TOAST NOTIFICATION
    // แสดงข้อความแจ้งเตือนชั่วคราว
    // =====================================================

    showToast(message) {

      this.toastMessage = message;

      // ยกเลิก Timer เดิม
      clearTimeout(this.toastTimer);


      // ซ่อน Toast หลังจาก 2.5 วินาที
      this.toastTimer = setTimeout(() => {

        this.toastMessage = "";

      }, 2500);
    },


    // =====================================================
    // WEB AUDIO API
    // สร้างเสียง Click โดยไม่ใช้ไฟล์เสียง
    // =====================================================

    playClick() {

      try {

        // รองรับ Browser ที่ใช้ AudioContext
        // และ Browser ที่ใช้ webkitAudioContext

        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;


        if (!AudioContext) return;


        // สร้างระบบเสียง

        const audio =
          new AudioContext();


        // สร้างตัวสร้างคลื่นเสียง

        const oscillator =
          audio.createOscillator();


        // สร้างตัวควบคุม Volume

        const gain =
          audio.createGain();


        // กำหนดรูปแบบคลื่นเสียง

        oscillator.type = "sine";


        // กำหนดความถี่เสียง

        oscillator.frequency.value = 520;


        // กำหนด Volume เริ่มต้น

        gain.gain.setValueAtTime(
          0.0001,
          audio.currentTime
        );


        // เพิ่ม Volume อย่างรวดเร็ว

        gain.gain.exponentialRampToValueAtTime(
          0.04,
          audio.currentTime + 0.01
        );


        // ลด Volume ลง

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          audio.currentTime + 0.08
        );


        // เชื่อมเสียงเข้าด้วยกัน

        oscillator.connect(gain);

        gain.connect(audio.destination);


        // เริ่มเสียง

        oscillator.start();


        // หยุดเสียง

        oscillator.stop(
          audio.currentTime + 0.08
        );


      } catch (error) {

        // ถ้า Browser ไม่รองรับเสียง
        // ไม่ต้องทำอะไร

      }
    }
  }

}).mount("#app");


// =========================================================
// END OF LITTLE LEAF CAFÉ JAVASCRIPT
// =========================================================
