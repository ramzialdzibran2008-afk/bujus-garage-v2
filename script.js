
/* =====================================================
   BUJUS GARAGE - MAIN JAVASCRIPT
   Tanpa fitur Nailong
===================================================== */

"use strict";

/* GANTI DATA CONTOH DI BAWAH DENGAN DATA ASLI */
const CONFIG = {
  adminWhatsApp: "6281234567890",
  address: "Jl. Raya Cibubur No. 10, Jakarta Timur, DKI Jakarta",
  mapsUrl: "https://maps.google.com/?q=Bengkel+Bujus+Garage+Cibubur"
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const rupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(value);

function isValidWhatsApp() {
  return /^\d{10,15}$/.test(CONFIG.adminWhatsApp);
}

function makeWhatsAppUrl(message) {
  return `https://wa.me/${CONFIG.adminWhatsApp}?text=${encodeURIComponent(message)}`;
}

/* TOAST NOTIFICATION */
let toastTimeout;

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* MOBILE NAVIGATION */
const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  });

  $$("#navMenu a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* CONTACT INFORMATION */
const addressText = $("#addressText");
const mapsLink = $("#mapsLink");

if (addressText) addressText.textContent = CONFIG.address;

if (mapsLink) {
  mapsLink.href = CONFIG.mapsUrl;
  mapsLink.target = "_blank";
  mapsLink.rel = "noopener noreferrer";
}

function setupWhatsAppLink(link) {
  if (!link) return;

  if (isValidWhatsApp()) {
    link.href = makeWhatsAppUrl(
      "Halo Bujus Garage, saya ingin bertanya tentang layanan bengkel."
    );
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.href = "#booking";
    link.removeAttribute("target");
  }
}

setupWhatsAppLink($("#whatsappLink"));
setupWhatsAppLink($("#floatingWhatsApp"));

/* COPYRIGHT YEAR */
const currentYear = $("#currentYear");
if (currentYear) currentYear.textContent = new Date().getFullYear();

/* BOOKING DATE: TODAY OR LATER */
const bookingDate = $("#bookingDate");

if (bookingDate) {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  bookingDate.min = today;
}

/* PRICE ESTIMATOR */
const priceService = $("#priceService");
const quantity = $("#quantity");
const estimateTotal = $("#estimateTotal");
const estimateNote = $("#estimateNote");

function getQuantity() {
  const value = Number(quantity?.value || 1);
  return Math.max(1, Math.min(10, Math.floor(value || 1)));
}

function updateEstimate() {
  if (!priceService || !quantity || !estimateTotal) return;

  const amount = getQuantity();
  quantity.value = amount;

  const unitPrice = Number(priceService.value);
  const total = unitPrice * amount;

  estimateTotal.textContent = unitPrice > 0
    ? rupiah(total)
    : "Perlu konsultasi";

  if (estimateNote) {
    estimateNote.textContent = unitPrice > 0
      ? "Estimasi awal, belum termasuk suku cadang tambahan."
      : "Harga perlu dikonfirmasi admin sebelum pekerjaan dimulai.";
  }
}

priceService?.addEventListener("change", updateEstimate);
quantity?.addEventListener("input", updateEstimate);

$("#quantityMinus")?.addEventListener("click", () => {
  if (!quantity) return;
  quantity.value = Math.max(1, getQuantity() - 1);
  updateEstimate();
});

$("#quantityPlus")?.addEventListener("click", () => {
  if (!quantity) return;
  quantity.value = Math.min(10, getQuantity() + 1);
  updateEstimate();
});

updateEstimate();

/* SERVICE CARD BUTTONS */
const bookingService = $("#bookingService");
const bookingSection = $("#booking");
const bookingStatus = $("#bookingStatus");

function scrollToBooking() {
  bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

$$(".choose-service").forEach((button) => {
  button.addEventListener("click", () => {
    const service = button.dataset.service;
    if (!service || !bookingService) return;

    bookingService.value = service;

    $$(".service-card").forEach((card) => card.classList.remove("selected"));
    button.closest(".service-card")?.classList.add("selected");

    if (bookingStatus) {
      bookingStatus.textContent = `Layanan "${service}" dipilih. Lengkapi data kendaraan untuk melanjutkan.`;
    }

    scrollToBooking();
    showToast(`Layanan ${service} dipilih.`);

    setTimeout(() => bookingService.focus({ preventScroll: true }), 500);
  });
});

/* BOOKING FROM ESTIMATOR */
$("#bookEstimate")?.addEventListener("click", () => {
  if (!priceService || !bookingService) return;

  const option = priceService.options[priceService.selectedIndex];
  const serviceLabel = option.textContent;

  let service = "Pemeriksaan / Konsultasi";

  if (serviceLabel.startsWith("Servis Ringan")) service = "Servis Ringan";
  else if (serviceLabel.startsWith("Servis Berat")) service = "Servis Berat";
  else if (serviceLabel.startsWith("Bore Up")) service = "Bore Up";
  else if (serviceLabel.startsWith("Modifikasi")) service = "Modifikasi / Aksesori";

  bookingService.value = service;

  if (bookingStatus) {
    const unitPrice = Number(priceService.value);
    bookingStatus.textContent = unitPrice > 0
      ? `Estimasi ${getQuantity()} kendaraan: ${rupiah(unitPrice * getQuantity())}. Lengkapi data booking.`
      : "Layanan ini memerlukan konsultasi harga. Lengkapi data booking.";
  }

  scrollToBooking();
  showToast("Estimasi dipilih. Lengkapi formulir booking.");

  setTimeout(() => bookingService.focus({ preventScroll: true }), 500);
});

/* BOOKING FORM VALIDATION AND WHATSAPP */
const bookingForm = $("#bookingForm");

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) return;

  if (!isValidWhatsApp()) {
    if (bookingStatus) {
      bookingStatus.textContent =
        "Nomor WhatsApp admin belum benar. Periksa CONFIG di js/script.js.";
    }
    showToast("Nomor WhatsApp admin belum dikonfigurasi.");
    return;
  }

  const form = new FormData(bookingForm);

  const name = String(form.get("customerName") || "").trim();
  const phone = String(form.get("customerPhone") || "").trim();
  const vehicleType = String(form.get("vehicleType") || "");
  const motor = String(form.get("motorType") || "").trim();
  const date = String(form.get("bookingDate") || "");
  const time = String(form.get("bookingTime") || "");
  const service = String(form.get("bookingService") || "");
  const complaint = String(form.get("complaint") || "").trim();

  // Cek ulang tanggal agar tanggal lampau tidak lolos.
  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  if (date < minDate) {
    if (bookingStatus) bookingStatus.textContent = "Pilih tanggal hari ini atau tanggal berikutnya.";
    bookingDate?.focus();
    return;
  }

  // Validasi nomor telepon pelanggan secara dasar.
  const normalizedPhone = phone.replace(/[\s()-]/g, "");
  if (!/^\+?\d{8,16}$/.test(normalizedPhone)) {
    if (bookingStatus) bookingStatus.textContent = "Periksa format nomor WhatsApp pelanggan.";
    $("#customerPhone")?.focus();
    return;
  }

  const message = [
    "HALO BUJUS GARAGE",
    "SAYA INGIN BOOKING SERVIS MOTOR",
    "",
    "DATA PELANGGAN",
    `Nama: ${name}`,
    `WhatsApp pelanggan: ${phone}`,
    "",
    "DATA KENDARAAN",
    `Jenis kendaraan: ${vehicleType}`,
    `Merek/tipe: ${motor}`,
    "",
    "DETAIL BOOKING",
    `Tanggal: ${date}`,
    `Waktu yang diminta: ${time}`,
    `Layanan: ${service}`,
    `Keluhan/permintaan: ${complaint || "Belum ada keterangan"}`,
    "",
    "Mohon konfirmasi ketersediaan jadwal dan estimasi biaya. Terima kasih."
  ].join("\n");

  const url = makeWhatsAppUrl(message);

  if (bookingStatus) {
    bookingStatus.textContent =
      "Membuka WhatsApp dengan detail booking. Periksa pesan lalu tekan Kirim.";
  }

  showToast("Menyiapkan pesan booking WhatsApp.");

  // Menggunakan tab baru agar form tetap terbuka.
  const whatsappWindow = window.open("about:blank", "_blank");

  if (whatsappWindow) {
    whatsappWindow.opener = null;
    whatsappWindow.location.href = url;
  } else {
    // Fallback jika browser memblokir pop-up.
    window.location.href = url;
  }
});

/* GALLERY LIGHTBOX */
const imageDialog = $("#imageDialog");
const expandedImage = $("#expandedImage");

$$(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const imageUrl = item.dataset.image;
    const image = $("img", item);

    if (!imageUrl || !expandedImage) return;

    expandedImage.src = imageUrl;
    expandedImage.alt = image?.alt || "Foto galeri Bujus Garage";

    if (imageDialog?.showModal) {
      imageDialog.showModal();
    } else {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  });
});

$("#closeImage")?.addEventListener("click", () => {
  imageDialog?.close();
});

imageDialog?.addEventListener("click", (event) => {
  if (event.target === imageDialog) imageDialog.close();
});

imageDialog?.addEventListener("close", () => {
  if (expandedImage) expandedImage.removeAttribute("src");
});

/* SCROLL REVEAL */
const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

/* BACK TO TOP */
$("#backTop")?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* WELCOME INTRO */
(() => {
  const screen = $("#welcomeScreen");
  const loader = $("#welcomeLoaderFill");
  const status = $("#welcomeStatus");
  const skip = $("#skipWelcome");

  if (!screen || !loader || !status) return;

  document.body.classList.add("intro-active");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = reducedMotion.matches ? 0 : 2800;

  const stages = [
    { progress: 0, text: "PREPARING WORKSHOP..." },
    { progress: 30, text: "CHECKING SERVICES..." },
    { progress: 65, text: "PREPARING YOUR EXPERIENCE..." },
    { progress: 90, text: "READY TO RIDE..." },
    { progress: 100, text: "WELCOME TO BUJUS GARAGE!" }
  ];

  let startTime = 0;
  let frame = null;
  let closeTimer = null;
  let closed = false;
  let previousStage = -1;

  function closeWelcome() {
    if (closed) return;
    closed = true;

    if (frame !== null) cancelAnimationFrame(frame);
    clearTimeout(closeTimer);

    screen.classList.add("is-leaving");
    document.body.classList.remove("intro-active");

    closeTimer = setTimeout(() => screen.remove(), 800);
  }

  function animateWelcome(timestamp) {
    if (closed) return;

    if (!startTime) startTime = timestamp;

    const progress = duration === 0
      ? 1
      : Math.min((timestamp - startTime) / duration, 1);

    loader.style.width = `${Math.round(progress * 100)}%`;

    const index = Math.min(
      Math.floor(progress * stages.length),
      stages.length - 1
    );

    if (index !== previousStage) {
      status.textContent = stages[index].text;
      previousStage = index;
    }

    if (progress < 1) {
      frame = requestAnimationFrame(animateWelcome);
    } else {
      closeTimer = setTimeout(closeWelcome, 400);
    }
  }

  skip?.addEventListener("click", closeWelcome);
  frame = requestAnimationFrame(animateWelcome);
})();

/* STARTUP */
console.log("Bujus Garage: semua fitur siap digunakan.");
