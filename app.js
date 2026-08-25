const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const img = item.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

/* ── Pricing Calculator ── */
(function() {
  const headphoneSlider = document.getElementById("calcHeadphones");
  const headphoneVal = document.getElementById("calcHeadphonesVal");
  const transmitterBtns = document.querySelectorAll("#calcTransmitters .calc-btn");
  const chargerBtn = document.getElementById("calcCharger");
  const dayBtns = document.querySelectorAll("#calcDays .calc-btn");
  const breakdownEl = document.getElementById("calcBreakdown");
  const totalEl = document.getElementById("calcTotal");
  const totalNoteEl = document.getElementById("calcTotalNote");
  const perHeadEl = document.getElementById("calcPerHead");
  const bookBtn = document.getElementById("calcBookBtn");

  const TX_PRICE = [0, 15, 25, 35];
  const CHARGER_PRICE = 15;
  const DAY_DISCOUNT = { 1: 0, 2: 0.10, 3: 0.15 };

  let headphones = 8;
  let transmitters = 1;
  let charger = false;
  let days = 1;

  function headphoneUnitPrice(qty) {
    if (qty <= 8) return 9;
    if (qty <= 15) return 7;
    return 6;
  }

  function headphoneTotal(qty) {
    const unitPrice = headphoneUnitPrice(qty);
    return qty * unitPrice;
  }

  function updateCalc() {
    const hpUnit = headphoneUnitPrice(headphones);
    const hpBase = headphones * hpUnit;
    const txBase = TX_PRICE[transmitters];
    const chBase = charger ? CHARGER_PRICE : 0;
    const subtotal = hpBase + txBase + chBase;
    const discountRate = DAY_DISCOUNT[days];
    const discountAmt = Math.round(subtotal * discountRate * 100) / 100;
    const dailyTotal = subtotal - discountAmt;
    const grandTotal = dailyTotal * days;
    const perHead = headphones > 0 ? (grandTotal / headphones) : 0;

    // Update slider display
    headphoneVal.textContent = headphones;

    // Breakdown
    let rows = [];
    rows.push({ label: headphones + " headphones × €" + hpUnit, value: "€" + hpBase.toFixed(2) });
    rows.push({ label: transmitters + " transmitter" + (transmitters > 1 ? "s" : ""), value: "€" + txBase.toFixed(2) });
    if (charger) rows.push({ label: "Charging station", value: "€" + chBase.toFixed(2) });
    if (days > 1) rows.push({ label: days + " days × €" + dailyTotal.toFixed(2), value: "" });
    if (discountAmt > 0) rows.push({ label: "Multi-day discount (" + (discountRate * 100) + "%)", value: "-€" + discountAmt.toFixed(2), discount: true });

    breakdownEl.innerHTML = rows.map(r =>
      '<div class="calc-breakdown-row"><span class="label">' + r.label + '</span><span class="' + (r.discount ? 'discount' : '') + '">' + r.value + '</span></div>'
    ).join("");

    // Total
    totalEl.textContent = "€" + grandTotal.toFixed(0);
    totalNoteEl.textContent = days === 1 ? "per day · €" + dailyTotal.toFixed(2) + "/day" : days + " days total · €" + dailyTotal.toFixed(2) + "/day";

    // Per-head cost
    if (headphones > 0) {
      perHeadEl.textContent = "€" + perHead.toFixed(2) + " per headphone · €" + hpUnit + " each";
      perHeadEl.style.display = "block";
    } else {
      perHeadEl.style.display = "none";
    }

    // Update tier highlight on slider
    if (headphones <= 8) {
      headphoneSlider.style.setProperty("--slider-color", "var(--cyan)");
    } else if (headphones <= 15) {
      headphoneSlider.style.setProperty("--slider-color", "var(--green)");
    } else {
      headphoneSlider.style.setProperty("--slider-color", "var(--magenta)");
    }

    // WhatsApp message
    const gearList = headphones + " headphones, " + transmitters + " transmitter" + (transmitters > 1 ? "s" : "");
    const extras = charger ? " + charging station" : "";
    const msg = "Hi! I'd like to book a silent disco package:\n\n" + gearList + extras + "\n" + days + " day" + (days > 1 ? "s" : "") + " — Total: €" + grandTotal.toFixed(2) + "\n\nCan you confirm availability?";
    bookBtn.href = "https://wa.me/351926298278?text=" + encodeURIComponent(msg);
  }

  // Headphone slider
  headphoneSlider.addEventListener("input", function() {
    headphones = parseInt(this.value);
    updateCalc();
  });

  // Transmitter buttons
  transmitterBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      transmitterBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      transmitters = parseInt(this.dataset.val);
      updateCalc();
    });
  });

  // Charger toggle
  chargerBtn.addEventListener("click", function() {
    charger = this.dataset.active !== "true";
    this.dataset.active = charger;
    updateCalc();
  });

  // Day buttons
  dayBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      dayBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      days = parseInt(this.dataset.val);
      updateCalc();
    });
  });

  // Initial calc
  updateCalc();
})();
