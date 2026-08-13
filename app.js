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

const bookingForm = document.getElementById("bookingForm");
const EMAIL_TO = "hello@albufeiracoworking.com";
const PHONE_HREF = "https://wa.me/351926298278";

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(bookingForm);
  const lines = [
    "Silent disco booking request",
    "",
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Event date: ${data.get("date") || "Not set"}`,
    `Guests: ${data.get("guests") || "Not set"}`,
    `Event type: ${data.get("type") || "Not set"}`,
    `Message: ${data.get("message") || "—"}`,
  ];
  const subject = encodeURIComponent(`Booking request — ${data.get("date") || ""}`.trim());
  const body = encodeURIComponent(lines.join("\n"));

  const mailLink = document.createElement("a");
  mailLink.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  mailLink.click();

  const status = document.createElement("p");
  status.className = "form-status";
  status.textContent = "Your email app opened with your request pre-filled. Hit send and we'll reply within 24h.";
  bookingForm.appendChild(status);
  bookingForm.querySelector(".btn").disabled = true;
});
