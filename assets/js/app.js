const CONTACTS = {
  phone: "+79284507300",
  displayPhone: "+7 928 450-73-00",
  telegramUsername: "anna_bikova",
  maxWebUrl: "https://web.max.ru/"
};

const DEFAULT_BOOKING_MESSAGE =
  "Здравствуйте! Хочу узнать свободные даты и условия бронирования дома в Фазановой лагуне.";

function encodeMessage(message) {
  return encodeURIComponent(message.trim());
}

function buildMaxUrl() {
  return CONTACTS.maxWebUrl;
}

function buildTelegramShareUrl(message = DEFAULT_BOOKING_MESSAGE) {
  return `https://t.me/share/url?url=&text=${encodeMessage(message)}`;
}

function setupMobileNav() {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  if (!nav || !toggle) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    const isOpen = nav.classList.contains("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

function setupStickyHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const toggleState = () => {
    header.classList.toggle("is-sticky", window.scrollY > 16);
  };

  toggleState();
  window.addEventListener("scroll", toggleState, { passive: true });
}

function setupBackToTop() {
  const button = document.querySelector("[data-back-to-top]");
  if (!button) return;

  const toggleVisibility = () => {
    button.classList.toggle("is-visible", window.scrollY > 500);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  toggleVisibility();
  window.addEventListener("scroll", toggleVisibility, { passive: true });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

function createBookingMessage(context = {}) {
  const {
    source = "сайта",
    house = "",
    checkIn = "",
    checkOut = "",
    guests = "",
    name = "",
    phone = "",
    comment = ""
  } = context;

  const parts = [
    "Здравствуйте! Хочу забронировать отдых в Фазановой лагуне.",
    `Источник: ${source}.`
  ];

  if (house) parts.push(`Дом: ${house}.`);
  if (checkIn || checkOut) parts.push(`Даты: ${checkIn || "уточняю"} — ${checkOut || "уточняю"}.`);
  if (guests) parts.push(`Гостей: ${guests}.`);
  if (name) parts.push(`Имя: ${name}.`);
  if (phone) parts.push(`Телефон: ${phone}.`);
  if (comment) parts.push(`Комментарий: ${comment}.`);

  return parts.join(" ");
}

function updateBookingLinks(modal, message) {
  const max = modal.querySelector("[data-modal-max]");
  const telegram = modal.querySelector("[data-modal-telegram]");
  const summary = modal.querySelector("[data-modal-summary]");
  const phone = modal.querySelector("[data-modal-phone]");
  const maxHint = modal.querySelector("[data-modal-max-hint]");

  if (max) max.href = buildMaxUrl();
  if (telegram) telegram.href = buildTelegramShareUrl(`${message} Telegram: @${CONTACTS.telegramUsername}`);
  if (phone) phone.href = `tel:${CONTACTS.phone}`;
  if (summary) summary.textContent = message;
  if (maxHint) {
    maxHint.textContent = `После открытия MAX найдите Анну по номеру ${CONTACTS.displayPhone}.`;
  }
}

function setupBookingModal() {
  const modal = document.querySelector("[data-booking-modal]");
  if (!modal) return;

  const closeButtons = modal.querySelectorAll("[data-modal-close]");
  const openButtons = document.querySelectorAll("[data-booking-trigger]");

  const openModal = (message) => {
    updateBookingLinks(modal, message);
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const href = button.getAttribute("href");
      if (href && href.includes("#")) {
        return;
      }

      event.preventDefault();
      const message =
        button.dataset.bookingMessage ||
        createBookingMessage({
          source: button.dataset.bookingSource || "кнопки на сайте",
          house: button.dataset.bookingHouse || ""
        });
      openModal(message);
    });
  });

  closeButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.matches("[data-modal-backdrop]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  window.openBookingModal = openModal;
}

function setupBookingForms() {
  document.querySelectorAll("[data-booking-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const message = createBookingMessage({
        source: form.dataset.bookingSource || "страницы бронирования",
        house: data.get("house"),
        checkIn: data.get("checkin"),
        checkOut: data.get("checkout"),
        guests: `${data.get("adults") || 0} взрослых, ${data.get("children") || 0} детей`,
        name: data.get("name"),
        phone: data.get("phone"),
        comment: data.get("comment")
      });

      if (typeof window.openBookingModal === "function") {
        window.openBookingModal(message);
      }
    });
  });
}

function setupCallbackForms() {
  document.querySelectorAll("[data-callback-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name");
      const phone = data.get("phone");
      const comment = data.get("comment");

      const message = `Здравствуйте! Прошу связаться со мной по заявке с сайта Фазановой лагуны. Имя: ${name}. Телефон: ${phone}. Комментарий: ${comment || "удобно в ближайшее время"}.`;
      window.open(buildMaxUrl(message), "_blank", "noopener");
    });
  });
}

function setupReviewForms() {
  document.querySelectorAll("[data-review-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const guest = data.get("guest");
      const stay = data.get("stay");
      const house = data.get("house");
      const review = data.get("review");

      const message = `Здравствуйте! Хочу оставить отзыв о проживании в Фазановой лагуне. Гость: ${guest}. Дом: ${house || "уточню"}. Период отдыха: ${stay || "уточню"}. Текст отзыва: ${review}.`;
      const channel = data.get("channel");

      if (channel === "telegram") {
        window.open(buildTelegramShareUrl(`${message} Для публикации свяжитесь с @${CONTACTS.telegramUsername}.`), "_blank", "noopener");
        return;
      }

      window.open(buildMaxUrl(message), "_blank", "noopener");
    });
  });
}

function setupReviewSlider() {
  const slider = document.querySelector("[data-reviews-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-reviews-track]");
  const slides = Array.from(track.children);
  const prev = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");
  const dotsWrap = slider.querySelector("[data-slider-dots]");
  let current = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Показать отзыв ${index + 1}`);
    dot.addEventListener("click", () => {
      current = index;
      render();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render() {
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === current));
  }

  prev?.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    render();
  });

  next?.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    render();
  });

  if (slides.length > 1) {
    setInterval(() => {
      current = (current + 1) % slides.length;
      render();
    }, 6500);
  }

  render();
}

function setupGalleryFilters() {
  const toolbar = document.querySelector("[data-gallery-nav]");
  if (!toolbar) return;

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scroll-target]");
    if (!button) return;

    const target = document.querySelector(button.dataset.scrollTarget);
    if (!target) return;

    toolbar.querySelectorAll("[data-scroll-target]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setupDynamicGallery() {
  document.querySelectorAll("[data-gallery-list]").forEach((list) => {
    const groups = JSON.parse(list.dataset.galleryList);
    const fragment = document.createDocumentFragment();

    groups.forEach((group) => {
      for (let index = group.start; index <= group.end; index += 1) {
        const src = `${group.prefix}${index}.${group.ext || "jpg"}`;
        const caption = `${group.title} ${index}`;
        const card = document.createElement("article");
        card.className = "gallery-card reveal is-visible";
        card.innerHTML = `
          <button type="button" data-lightbox-trigger data-image="${src}" data-caption="${caption}">
            <img src="${src}" alt="${caption}" loading="lazy" />
          </button>
          <div class="gallery-card__caption">${caption}</div>
        `;
        fragment.appendChild(card);
      }
    });

    list.appendChild(fragment);
  });
}

function setupServiceCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = Array.from(track?.children || []);
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    let current = 0;

    if (!track || slides.length < 2) return;

    const render = () => {
      track.style.transform = `translateX(-${current * 100}%)`;
    };

    prev?.addEventListener("click", () => {
      current = (current - 1 + slides.length) % slides.length;
      render();
    });

    next?.addEventListener("click", () => {
      current = (current + 1) % slides.length;
      render();
    });

    render();
  });
}

function setupMapChoice() {
  const buttons = document.querySelectorAll("[data-map-choice]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (typeof window.openMapModal === "function") {
        window.openMapModal();
      }
    });
  });

  const modal = document.querySelector("[data-map-modal]");
  if (!modal) return;

  const close = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  window.openMapModal = () => {
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  modal.querySelectorAll("[data-modal-close]").forEach((button) => button.addEventListener("click", close));
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.matches("[data-modal-backdrop]")) {
      close();
    }
  });
}

function setupLightbox() {
  const modal = document.querySelector("[data-lightbox]");
  if (!modal) return;

  const image = modal.querySelector("[data-lightbox-image]");
  const caption = modal.querySelector("[data-lightbox-caption]");

  document.querySelectorAll("[data-lightbox-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.image;
      image.alt = button.dataset.caption || "Фото Фазановой лагуны";
      caption.textContent = button.dataset.caption || "";
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });

  modal.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.matches("[data-modal-backdrop]")) {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  });
}

function setupCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function setupHeroSlider() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  if (slides.length < 2) return;

  let current = 0;

  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupStickyHeader();
  setupBackToTop();
  setupReveal();
  setupHeroSlider();
  setupDynamicGallery();
  setupBookingModal();
  setupBookingForms();
  setupCallbackForms();
  setupReviewForms();
  setupReviewSlider();
  setupServiceCarousels();
  setupGalleryFilters();
  setupMapChoice();
  setupLightbox();
  setupCurrentYear();
});
