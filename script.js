// =========================================================
// LITTLE LEAF CAFÉ
// JavaScript + Vue 3
// =========================================================

const { createApp } = Vue;

createApp({
  data() {
    return {
      // -------------------- Menu --------------------
      menu: [],
      loading: true,
      selectedCategory: "All",

      // -------------------- UI --------------------
      mobileMenuOpen: false,
      darkMode: localStorage.getItem("littleLeafDarkMode") === "true",
      showGoTop: false,

      // -------------------- Menu Detail --------------------
      selectedItem: null,
      detailQuantity: 1,

      // -------------------- Cart --------------------
      cart: [],
      checkoutOpen: false,

      // -------------------- Order --------------------
      currentOrder: null,
      receiptOpen: false,

      // -------------------- Forms --------------------
      orderForm: {
        name: "",
        email: "",
        phone: "",
        note: ""
      },

      contactForm: {
        name: "",
        email: "",
        message: ""
      },

      // -------------------- Toast --------------------
      toastMessage: ""
    };
  },

  computed: {
    // สร้างรายการหมวดหมู่จากข้อมูลเมนู
    categories() {
      return ["All", ...new Set(this.menu.map(item => item.category))];
    },

    // filter() ใช้กรองเมนูตามหมวดหมู่
    filteredMenu() {
      if (this.selectedCategory === "All") {
        return this.menu;
      }

      return this.menu.filter(
        item => item.category === this.selectedCategory
      );
    },

    // คำนวณราคารวมจากสินค้าในตะกร้า
    cartTotal() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }
  },

  async mounted() {
    // ใช้ async/await + Fetch API ตามเนื้อหาวิชา
    await this.loadMenu();

    // โหลดออเดอร์จาก localStorage
    this.loadCurrentOrder();

    // ใช้สถานะ Dark Mode ที่เคยบันทึกไว้
    document.body.classList.toggle("dark-mode", this.darkMode);

    // ตรวจจับการ Scroll เพื่อแสดงปุ่ม Go Top
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  methods: {

    // =====================================================
    // FETCH + JSON
    // =====================================================

    async loadMenu() {
      try {
        const response = await fetch("menu.json");

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลด menu.json ได้");
        }

        // แปลง JSON เป็น JavaScript Object
        this.menu = await response.json();

      } catch (error) {
        console.error(error);
        this.showToast("โหลดเมนูไม่สำเร็จ");

      } finally {
        this.loading = false;
      }
    },


    // =====================================================
    // DARK MODE
    // =====================================================

    toggleDarkMode() {
      this.darkMode = !this.darkMode;

      document.body.classList.toggle(
        "dark-mode",
        this.darkMode
      );

      // เก็บค่าไว้ใน localStorage
      localStorage.setItem(
        "littleLeafDarkMode",
        this.darkMode
      );

      this.playClick();
    },


    // =====================================================
    // MOBILE MENU
    // =====================================================

    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },


    // =====================================================
    // MENU DETAIL
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

    changeDetailQuantity(amount) {
      this.detailQuantity += amount;

      if (this.detailQuantity < 1) {
        this.detailQuantity = 1;
      }

      this.playClick();
    },


    // =====================================================
    // CART
    // =====================================================

    addToOrder(item, quantity) {
      const existing = this.cart.find(
        cartItem => cartItem.id === item.id
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
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

      // ถ้ามีออเดอร์อยู่แล้ว = ให้เพิ่มต่อในออเดอร์เดิม
      // ถ้ายังไม่มี = เปิด Checkout เพื่อสร้างออเดอร์แรก
      this.checkoutOpen = true;
    },

    changeCartQuantity(id, amount) {
      const item = this.cart.find(
        cartItem => cartItem.id === id
      );

      if (!item) return;

      item.quantity += amount;

      if (item.quantity <= 0) {
        this.cart = this.cart.filter(
          cartItem => cartItem.id !== id
        );
      }

      this.playClick();
    },


    // =====================================================
    // ORDER / LOCAL STORAGE
    // =====================================================

    loadCurrentOrder() {
      const saved = localStorage.getItem("littleLeafCurrentOrder");

      if (!saved) {
        return;
      }

      try {
        const order = JSON.parse(saved);

        // แสดงเฉพาะ Order ของวันนี้
        if (this.isToday(order.createdAt)) {
          this.currentOrder = order;
        } else {
          // ถ้าเป็นวันเก่า ให้ลบออก
          localStorage.removeItem("littleLeafCurrentOrder");
        }

      } catch (error) {
        console.error("อ่าน Order ไม่สำเร็จ", error);
        localStorage.removeItem("littleLeafCurrentOrder");
      }
    },

    submitOrder() {
      if (this.cart.length === 0) {
        this.showToast("Please add something first 🍰");
        return;
      }

      const now = new Date();

      // -----------------------------------------------
      // ถ้ายังไม่มี Order = สร้าง Order ใหม่
      // ถ้ามี Order อยู่แล้ว = เพิ่มสินค้าเข้า Order เดิม
      // -----------------------------------------------

      if (!this.currentOrder) {

        const orderId =
          "LL" +
          Date.now().toString().slice(-6);

        this.currentOrder = {
          id: orderId,
          createdAt: now.toISOString(),

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

      } else {

        // เพิ่มรายการใหม่เข้าใบเสร็จเดิม
        this.cart.forEach(cartItem => {

          const existing = this.currentOrder.items.find(
            item => item.id === cartItem.id
          );

          if (existing) {
            existing.quantity += cartItem.quantity;

          } else {
            this.currentOrder.items.push({
              ...cartItem,
              addedLater: true
            });
          }
        });

        // อัปเดตยอดรวมใหม่
        this.currentOrder.total =
          this.currentOrder.items.reduce(
            (total, item) =>
              total + item.price * item.quantity,
            0
          );

        // อัปเดตข้อมูลลูกค้า ถ้ามีการกรอกใหม่
        this.currentOrder.customer = {
          name: this.orderForm.name,
          email: this.orderForm.email,
          phone: this.orderForm.phone,
          note: this.orderForm.note
        };
      }

      // บันทึก Order ลง localStorage
      localStorage.setItem(
        "littleLeafCurrentOrder",
        JSON.stringify(this.currentOrder)
      );

      // เคลียร์ตะกร้าชั่วคราว
      this.cart = [];

      // ปิด Checkout
      this.checkoutOpen = false;

      // รีเซ็ตฟอร์ม
      this.resetOrderForm();

      // แจ้งผู้ใช้
      this.showToast(
        this.currentOrder.items.some(item => item.addedLater)
          ? "Added to your existing order ✦"
          : "Your order has been submitted ♡"
      );

      // เปิดใบเสร็จทันที
      setTimeout(() => {
        this.openReceipt();
      }, 350);
    },


    resetOrderForm() {
      this.orderForm = {
        name: this.currentOrder?.customer?.name || "",
        email: this.currentOrder?.customer?.email || "",
        phone: this.currentOrder?.customer?.phone || "",
        note: this.currentOrder?.customer?.note || ""
      };
    },


    openReceipt() {
      if (!this.currentOrder) return;

      this.receiptOpen = true;
      this.playClick();
    },


    // =====================================================
    // DATE / TIME
    // =====================================================

    isToday(dateString) {
      const date = new Date(dateString);
      const today = new Date();

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    },

    formatDate(dateString) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(dateString));
    },

    formatTime(dateString) {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(dateString));
    },


    // =====================================================
    // GO TO TOP
    // =====================================================

    handleScroll() {
      this.showGoTop = window.scrollY > 500;
    },

    goTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      this.playClick();
    },

    scrollToMenu() {
      document
        .getElementById("menu")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    },


    // =====================================================
    // CONTACT FORM
    // =====================================================

    submitContact() {
      // Prototype: ยังไม่มี Backend จริง
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
    // TOAST
    // =====================================================

    showToast(message) {
      this.toastMessage = message;

      clearTimeout(this.toastTimer);

      this.toastTimer = setTimeout(() => {
        this.toastMessage = "";
      }, 2500);
    },


    // =====================================================
    // CLICK SOUND
    // ใช้ Web Audio API เพื่อไม่ต้องมีไฟล์เสียงเพิ่ม
    // =====================================================

    playClick() {
      try {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) return;

        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 520;

        gain.gain.setValueAtTime(
          0.0001,
          audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
          0.04,
          audio.currentTime + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          audio.currentTime + 0.08
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start();
        oscillator.stop(audio.currentTime + 0.08);

      } catch (error) {
        // ถ้า Browser ไม่รองรับเสียง ไม่ต้องทำอะไร
      }
    }
  }
}).mount("#app");
