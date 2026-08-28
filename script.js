/* =========================================================
   FREE TRAVEL — script.js
   Arquivo JS Corrigido e Otimizado
   ========================================================= */

"use strict";

/* =========================================================
   DADOS DAS OFERTAS
   ========================================================= */

const trips = [
  {
    id: 1,
    destination: "Rio de Janeiro",
    country: "Brasil",
    location: "Rio de Janeiro, Brasil",
    type: "Praia",
    rating: "4.9",
    reviews: "2.341",
    price: 899,
    oldPrice: 1199,
    badge: "OFERTA",
    image:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=85",
    description:
      "Praias famosas, paisagens incríveis e uma das cidades mais vibrantes do Brasil."
  },

  {
    id: 2,
    destination: "Buenos Aires",
    country: "Argentina",
    location: "Buenos Aires, Argentina",
    type: "Cidade",
    rating: "4.8",
    reviews: "1.876",
    price: 749,
    oldPrice: 999,
    badge: "DESTAQUE",
    image:
      "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=900&q=85",
    description:
      "Arquitetura, restaurantes, cultura, tango e muita coisa para descobrir."
  },

  {
    id: 3,
    destination: "Bariloche",
    country: "Argentina",
    location: "Bariloche, Argentina",
    type: "Natureza",
    rating: "4.9",
    reviews: "1.245",
    price: 1290,
    oldPrice: 1590,
    badge: "OFERTA",
    image:
      "https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=900&q=85",
    description:
      "Montanhas, lagos, neve e paisagens espetaculares na Patagônia argentina."
  },

  {
    id: 4,
    destination: "Madrid",
    country: "Espanha",
    location: "Madrid, Espanha",
    type: "Cidade",
    rating: "4.8",
    reviews: "3.012",
    price: 2490,
    oldPrice: 2990,
    badge: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85",
    description:
      "História, museus, gastronomia e uma vida urbana cheia de energia."
  },

  {
    id: 5,
    destination: "Paris",
    country: "França",
    location: "Paris, França",
    type: "Cidade",
    rating: "4.9",
    reviews: "4.125",
    price: 2890,
    oldPrice: 3390,
    badge: "DESTAQUE",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
    description:
      "A Cidade Luz reúne arte, gastronomia, história e alguns dos lugares mais famosos do mundo."
  },

  {
    id: 6,
    destination: "Florianópolis",
    country: "Brasil",
    location: "Florianópolis, Brasil",
    type: "Praia",
    rating: "4.8",
    reviews: "1.932",
    price: 990,
    oldPrice: 1290,
    badge: "OFERTA",
    image:
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=900&q=85",
    description:
      "Ilhas, praias, trilhas e uma ótima combinação de natureza e vida urbana."
  },

  {
    id: 7,
    destination: "Mendoza",
    country: "Argentina",
    location: "Mendoza, Argentina",
    type: "Natureza",
    rating: "4.7",
    reviews: "876",
    price: 1090,
    oldPrice: 1390,
    badge: "OFERTA",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
    description:
      "Vinícolas, montanhas e paisagens incríveis aos pés dos Andes."
  },

  {
    id: 8,
    destination: "Barcelona",
    country: "Espanha",
    location: "Barcelona, Espanha",
    type: "Praia",
    rating: "4.9",
    reviews: "2.762",
    price: 2590,
    oldPrice: 3090,
    badge: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85",
    description:
      "Praia, arquitetura, gastronomia e a atmosfera única da Catalunha."
  }
];

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let favorites = [];

try {
  const savedFavorites = localStorage.getItem("freeTravelFavorites");
  if (savedFavorites) {
    const parsed = JSON.parse(savedFavorites);
    if (Array.isArray(parsed)) {
      favorites = parsed;
    }
  }
} catch (error) {
  console.warn("Não foi possível carregar os favoritos.", error);
}

let currentFilter = "Todos";
let currentSearch = "";

/* =========================================================
   ELEMENTOS
   ========================================================= */

const tripGrid = document.getElementById("tripGrid");
const resultCount = document.getElementById("resultCount");
const budgetSlider = document.getElementById("budgetSlider");
const budgetValue = document.getElementById("budgetValue");
const searchForm = document.getElementById("searchForm");
const destinationInput = document.getElementById("destination");
const departureInput = document.getElementById("departure");
const returnInput = document.getElementById("return");
const passengersInput = document.getElementById("passengers");
const mainNav = document.getElementById("mainNav");
const menuToggle = document.querySelector("[data-menu-toggle]");
const favoriteCount = document.querySelector("[data-favorite-count]");

/* =========================================================
   UTILIDADES
   ========================================================= */

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

function saveFavorites() {
  try {
    localStorage.setItem("freeTravelFavorites", JSON.stringify(favorites));
  } catch (error) {
    console.warn("Não foi possível salvar os favoritos.", error);
  }
}

function isFavorite(id) {
  return favorites.includes(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message) {
  let toast = document.querySelector(".ft-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "ft-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* =========================================================
   ATUALIZAR CONTADOR DE FAVORITOS
   ========================================================= */

function updateFavoriteCount() {
  if (!favoriteCount) return;

  const count = favorites.length;
  favoriteCount.textContent = count;
  favoriteCount.hidden = count === 0;
}

/* =========================================================
   RENDERIZAR OFERTAS
   ========================================================= */

function renderTrips() {
  if (!tripGrid) return;

  let filteredTrips = [...trips];

  if (currentFilter !== "Todos") {
    filteredTrips = filteredTrips.filter(trip => trip.type === currentFilter);
  }

  if (currentSearch.trim() !== "") {
    const search = currentSearch.trim().toLowerCase();
    filteredTrips = filteredTrips.filter(trip =>
      `${trip.destination} ${trip.country} ${trip.type}`
        .toLowerCase()
        .includes(search)
    );
  }

  const budget = budgetSlider ? Number(budgetSlider.value) : 5000;
  filteredTrips = filteredTrips.filter(trip => trip.price <= budget);

  if (resultCount) {
    resultCount.textContent = `${filteredTrips.length} ${
      filteredTrips.length === 1 ? "oferta encontrada" : "ofertas encontradas"
    }`;
  }

  if (filteredTrips.length === 0) {
    tripGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✈</div>
        <h3>Nenhuma oferta encontrada</h3>
        <p>Tente aumentar o orçamento ou escolher outro destino.</p>
        <button
          class="primary-btn"
          type="button"
          data-action="clear-filters"
        >
          Limpar filtros
        </button>
      </div>
    `;
    return;
  }

  tripGrid.innerHTML = filteredTrips.map(createTripCard).join("");
}

/* =========================================================
   CARD DE VIAGEM
   ========================================================= */

function createTripCard(trip) {
  const favorite = isFavorite(trip.id);

  return `
    <article class="trip-card" data-trip-id="${trip.id}">
      <div class="trip-image">
        <img
          src="${escapeHtml(trip.image)}"
          alt="${escapeHtml(trip.destination)}"
          loading="lazy"
        >
        <span class="trip-badge">
          ${escapeHtml(trip.badge)}
        </span>
        <button
          class="favorite-btn ${favorite ? "active" : ""}"
          type="button"
          data-action="favorite"
          data-id="${trip.id}"
          aria-label="${favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
          aria-pressed="${favorite}"
        >
          ${favorite ? "♥" : "♡"}
        </button>
      </div>

      <div class="trip-content">
        <span class="trip-location">
          ${escapeHtml(trip.location)}
        </span>
        <h3>${escapeHtml(trip.destination)}</h3>
        <div class="trip-rating">
          <span>★</span>
          <strong>${escapeHtml(trip.rating)}</strong>
          <span>(${escapeHtml(trip.reviews)})</span>
          <span class="trip-type">${escapeHtml(trip.type)}</span>
        </div>
        <p>${escapeHtml(trip.description)}</p>
        <div class="trip-bottom">
          <div>
            <small>a partir de</small>
            <div class="trip-price">${formatMoney(trip.price)}</div>
            <del>${formatMoney(trip.oldPrice)}</del>
          </div>
          <button
            class="primary-btn small-btn"
            type="button"
            data-action="details"
            data-id="${trip.id}"
          >
            Ver oferta
          </button>
        </div>
      </div>
    </article>
  `;
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function toggleFavorite(id) {
  const index = favorites.indexOf(id);

  if (index === -1) {
    favorites.push(id);
    showToast("Oferta adicionada aos favoritos.");
  } else {
    favorites.splice(index, 1);
    showToast("Oferta removida dos favoritos.");
  }

  saveFavorites();
  updateFavoriteCount();
  renderTrips();
}

/* =========================================================
   MODAL BASE
   ========================================================= */

function closeModal() {
  const modal = document.querySelector(".ft-modal");
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    if (modal && !modal.classList.contains("open")) {
      modal.remove();
    }
  }, 200);

  document.body.classList.remove("modal-open");
}

function createModal(content) {
  closeModal();

  const modal = document.createElement("div");
  modal.className = "ft-modal open";
  modal.setAttribute("aria-hidden", "false");

  modal.innerHTML = `
    <div class="ft-modal-backdrop" data-modal-close></div>
    <div class="ft-modal-box" role="dialog" aria-modal="true">
      <button
        class="ft-modal-close"
        type="button"
        data-modal-close
        aria-label="Fechar"
      >
        ×
      </button>
      ${content}
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  return modal;
}

/* =========================================================
   MODAL DE OFERTA
   ========================================================= */

function showTripDetails(id) {
  const trip = trips.find(item => item.id === id);
  if (!trip) return;

  createModal(`
    <img
      class="ft-modal-image"
      src="${escapeHtml(trip.image)}"
      alt="${escapeHtml(trip.destination)}"
    >
    <div class="ft-modal-body">
      <span class="modal-kicker">${escapeHtml(trip.badge)}</span>
      <h2>${escapeHtml(trip.destination)}</h2>
      <p class="modal-location">${escapeHtml(trip.location)}</p>
      <div class="modal-rating">
        ★ ${escapeHtml(trip.rating)} · ${escapeHtml(trip.reviews)} avaliações
      </div>
      <p>${escapeHtml(trip.description)}</p>
      <div class="modal-price">
        <small>A partir de</small>
        <strong>${formatMoney(trip.price)}</strong>
        <del>${formatMoney(trip.oldPrice)}</del>
      </div>
      <div class="modal-actions">
        <button
          class="primary-btn"
          type="button"
          data-action="reserve"
          data-id="${trip.id}"
        >
          Continuar
        </button>
        <button
          class="secondary-btn"
          type="button"
          data-action="favorite"
          data-id="${trip.id}"
        >
          ${isFavorite(trip.id) ? "♥ Remover favorito" : "♡ Favoritar"}
        </button>
      </div>
      <small class="modal-note">
        Os valores apresentados são demonstrativos nesta versão do Free Travel.
      </small>
    </div>
  `);
}

/* =========================================================
   MODAL DE LOGIN
   ========================================================= */

function showLogin() {
  createModal(`
    <div class="login-box">
      <div class="login-logo">✈</div>
      <span class="section-kicker">FREE TRAVEL</span>
      <h2>Entre na sua conta</h2>
      <p>Salve ofertas, acompanhe suas viagens e personalize sua experiência.</p>
      <form id="loginForm">
        <label>
          E-mail
          <input
            type="email"
            name="email"
            placeholder="seu@email.com"
            required
          >
        </label>
        <label>
          Senha
          <input
            type="password"
            name="password"
            placeholder="Sua senha"
            required
          >
        </label>
        <button class="primary-btn full-btn" type="submit">
          Entrar
        </button>
      </form>
      <small class="modal-note">
        Nesta versão inicial, o login é apenas demonstrativo.
      </small>
    </div>
  `);

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      showToast("Login demonstrativo realizado.");
      closeModal();
    });
  }
}

/* =========================================================
   MODAL DE CONTATO / FALE CONOSCO
   ========================================================= */

function showContactForm() {
  createModal(`
    <div class="login-box">
      <div class="login-logo">✉</div>
      <span class="section-kicker">ATENDIMENTO</span>
      <h2>Fale Conosco</h2>
      <p>Preencha o formulário abaixo e entraremos em contato o mais breve possível.</p>
      <form id="contactForm">
        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
          <div>
            <label style="display: block; color: #555; font-size: 11px; font-weight: 900; margin-bottom: 5px;">
              NOME
            </label>
            <input
              type="text"
              name="name"
              placeholder="Seu nome completo"
              style="width: 100%; height: 45px; padding: 0 12px; border: 1px solid #ddd; border-radius: 8px; outline: 0; font-size: 13px; box-sizing: border-box;"
              required
            >
          </div>
          <div>
            <label style="display: block; color: #555; font-size: 11px; font-weight: 900; margin-bottom: 5px;">
              E-MAIL
            </label>
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              style="width: 100%; height: 45px; padding: 0 12px; border: 1px solid #ddd; border-radius: 8px; outline: 0; font-size: 13px; box-sizing: border-box;"
              required
            >
          </div>
          <div>
            <label style="display: block; color: #555; font-size: 11px; font-weight: 900; margin-bottom: 5px;">
              ASSUNTO
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Ex: Dúvida sobre reserva, sugestão..."
              style="width: 100%; height: 45px; padding: 0 12px; border: 1px solid #ddd; border-radius: 8px; outline: 0; font-size: 13px; box-sizing: border-box;"
              required
            >
          </div>
          <div>
            <label style="display: block; color: #555; font-size: 11px; font-weight: 900; margin-bottom: 5px;">
              MENSAGEM
            </label>
            <textarea
              name="message"
              rows="4"
              placeholder="Escreva sua mensagem aqui..."
              style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; outline: 0; font-size: 13px; font-family: inherit; resize: vertical; box-sizing: border-box;"
              required
            ></textarea>
          </div>
          <button class="primary-btn full-btn" type="submit" style="margin-top: 10px;">
            Enviar mensagem
          </button>
        </div>
      </form>
      <small class="modal-note">
        Nesta versão inicial, o envio é apenas demonstrativo.
      </small>
    </div>
  `);

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      showToast("Mensagem enviada com sucesso! Em breve responderemos.");
      closeModal();
    });
  }
}

/* =========================================================
   MODAL DE FAVORITOS
   ========================================================= */

function showFavorites() {
  const favoriteTrips = trips.filter(trip => favorites.includes(trip.id));

  if (favoriteTrips.length === 0) {
    createModal(`
      <div class="ft-modal-body">
        <span class="section-kicker">SEUS FAVORITOS</span>
        <h2>Nenhuma oferta salva.</h2>
        <p>Clique no coração de uma oferta para adicioná-la aos seus favoritos.</p>
        <div class="modal-actions">
          <button class="primary-btn" type="button" data-modal-close>
            Explorar ofertas
          </button>
        </div>
      </div>
    `);
    return;
  }

  createModal(`
    <div class="ft-modal-body">
      <span class="section-kicker">SEUS FAVORITOS</span>
      <h2>Suas ofertas salvas</h2>
      <p>
        Você salvou ${favoriteTrips.length}
        ${favoriteTrips.length === 1 ? "oferta" : "ofertas"}.
      </p>
      <div class="modal-actions">
        ${favoriteTrips
          .map(
            trip => `
              <button
                class="secondary-btn"
                type="button"
                data-action="details"
                data-id="${trip.id}"
              >
                ${escapeHtml(trip.destination)} · ${formatMoney(trip.price)}
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `);
}

/* =========================================================
   PESQUISA
   ========================================================= */

function performSearch() {
  if (!destinationInput) return;

  currentSearch = destinationInput.value.trim();
  const offers = document.getElementById("ofertas");

  if (offers) {
    offers.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderTrips();

  if (currentSearch) {
    showToast(`Buscando ofertas para "${currentSearch}".`);
  } else {
    showToast("Mostrando todas as ofertas.");
  }
}

/* =========================================================
   FILTROS
   ========================================================= */

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.tripType === filter);
  });

  renderTrips();
}

function clearFilters() {
  currentFilter = "Todos";
  currentSearch = "";

  if (destinationInput) destinationInput.value = "";
  if (budgetSlider) budgetSlider.value = 5000;

  updateBudget();
  setFilter("Todos");
  showToast("Filtros limpos.");
}

/* =========================================================
   ORÇAMENTO
   ========================================================= */

function updateBudget() {
  if (!budgetSlider || !budgetValue) return;

  const value = Number(budgetSlider.value);
  budgetValue.textContent = formatMoney(value);
  renderTrips();
}

/* =========================================================
   MENU MOBILE
   ========================================================= */

function toggleMobileMenu() {
  if (!mainNav || !menuToggle) return;

  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

function closeMobileMenu() {
  if (!mainNav || !menuToggle) return;

  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

/* =========================================================
   AÇÕES GERAIS
   ========================================================= */

function handleAction(element) {
  const action = element.dataset.action;
  const id = element.dataset.id ? Number(element.dataset.id) : null;

  switch (action) {
    case "favorite":
      if (id !== null) toggleFavorite(id);
      break;

    case "details":
      if (id !== null) showTripDetails(id);
      break;

    case "reserve":
      showToast("Em breve você poderá continuar para a reserva.");
      break;

    case "login":
      showLogin();
      break;

    case "contact":
      showContactForm();
      break;

    case "show-favorites":
      showFavorites();
      break;

    case "show-all":
      currentFilter = "Todos";
      currentSearch = "";

      if (destinationInput) destinationInput.value = "";

      document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.tripType === "Todos");
      });

      renderTrips();
      document.getElementById("ofertas")?.scrollIntoView({ behavior: "smooth" });
      break;

    case "clear-filters":
      clearFilters();
      break;

    case "go-search":
      document.getElementById("destination")?.focus();
      document.querySelector(".search-card")?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      break;

    default:
      break;
  }
}

/* =========================================================
   EVENTOS
   ========================================================= */

document.addEventListener("click", event => {
  const actionElement = event.target.closest("[data-action]");
  if (actionElement) {
    handleAction(actionElement);
    return;
  }

  const closeElement = event.target.closest("[data-modal-close]");
  if (closeElement) {
    closeModal();
    return;
  }

  const filterButton = event.target.closest("[data-trip-type]");
  if (filterButton) {
    setFilter(filterButton.dataset.tripType);
    return;
  }

  const searchTab = event.target.closest(".search-tab");
  if (searchTab) {
    document.querySelectorAll(".search-tab").forEach(tab => {
      tab.classList.remove("active");
    });
    searchTab.classList.add("active");
    return;
  }

  const destinationCard = event.target.closest("[data-destination]");
  if (destinationCard) {
    const destination = destinationCard.dataset.destination;

    if (destinationInput) destinationInput.value = destination;
    currentSearch = destination;

    document.getElementById("ofertas")?.scrollIntoView({ behavior: "smooth" });
    renderTrips();
    showToast(`Mostrando ofertas para ${destination}.`);
  }
});

if (searchForm) {
  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    performSearch();
  });
}

if (budgetSlider) {
  budgetSlider.addEventListener("input", updateBudget);
}

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMobileMenu);
}

if (mainNav) {
  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    closeMobileMenu();
  }
});

/* =========================================================
   DATAS MÍNIMAS PARA O FORMULÁRIO
   ========================================================= */

function configureDateInputs() {
  if (!departureInput || !returnInput) return;

  const today = new Date().toISOString().split("T")[0];

  departureInput.min = today;
  returnInput.min = today;

  departureInput.addEventListener("change", () => {
    if (departureInput.value) {
      returnInput.min = departureInput.value;
    }

    if (
      returnInput.value &&
      departureInput.value &&
      returnInput.value < departureInput.value
    ) {
      returnInput.value = "";
    }
  });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function initializeApp() {
  updateFavoriteCount();
  configureDateInputs();
  updateBudget();
  renderTrips();
}

initializeApp();

/* =========================================================
   FIM
   ========================================================= */
