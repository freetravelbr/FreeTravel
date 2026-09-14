// Estado da Aplicação
const state = {
    allTrips: [
        { id: 'trip-1', title: 'Rio de Janeiro saindo de São Paulo', category: 'Praia', price: 450, days: 5, originCode: 'GRU', destinationCode: 'GIG', departureDate: '2026-10-15', returnDate: '2026-10-20', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&auto=format&fit=crop&q=80', badge: 'Imperdível' },
        { id: 'trip-2', title: 'Buenos Aires saindo de São Paulo', category: 'Cidade', price: 1200, days: 7, originCode: 'GRU', destinationCode: 'EZE', departureDate: '2026-11-01', returnDate: '2026-11-08', image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&auto=format&fit=crop&q=80', badge: 'Mais Vendido' },
        { id: 'trip-3', title: 'Bariloche saindo de Buenos Aires', category: 'Natureza', price: 1800, days: 6, originCode: 'EZE', destinationCode: 'BRC', departureDate: '2026-12-05', returnDate: '2026-12-11', image: 'https://images.pexels.com/photos/13257073/pexels-photo-13257073.jpeg', badge: 'Neve' },
        { id: 'trip-4', title: 'Miami saindo de São Paulo', category: 'Praia', price: 2850, days: 7, originCode: 'GRU', destinationCode: 'MIA', departureDate: '2026-11-10', returnDate: '2026-11-17', image: 'https://images.pexels.com/photos/5903958/pexels-photo-5903958.jpeg', badge: 'Popular' },
        { id: 'trip-5', title: 'Roma saindo de São Paulo', category: 'Cidade', price: 3400, days: 8, originCode: 'GRU', destinationCode: 'FCO', departureDate: '2026-11-15', returnDate: '2026-11-23', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80', badge: 'Destaque' },
        { id: 'trip-6', title: 'Cairo (Egito) saindo de São Paulo', category: 'Natureza', price: 4200, days: 10, originCode: 'GRU', destinationCode: 'CAI', departureDate: '2026-12-01', returnDate: '2026-12-11', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&auto=format&fit=crop&q=80', badge: 'Exótico' },
        { id: 'trip-7', title: 'Lisboa saindo de São Paulo', category: 'Cidade', price: 4500, days: 10, originCode: 'GRU', destinationCode: 'LIS', departureDate: '2026-12-01', returnDate: '2026-12-11', image: 'https://images.pexels.com/photos/29743111/pexels-photo-29743111.jpeg', badge: 'Europa' }
    ],
    filteredTrips: [],
    favorites: JSON.parse(localStorage.getItem('freetravel_favorites') || '[]'),
    activeFilter: 'Todos',
    maxBudget: 5000,
    showOnlyFavorites: false,
    travelPayoutsMarker: '771005'
};

const iataMap = {
    'Rio de Janeiro': 'GIG',
    'Buenos Aires': 'EZE',
    'Madrid': 'MAD',
    'Bariloche': 'BRC',
    'Paris': 'CDG',
    'Santiago': 'SCL',
    'Lisboa': 'LIS',
    'Tóquio': 'TYO'
};

// Mapeamento dos Elementos do DOM
function getElements() {
    return {
        searchForm: document.getElementById('searchForm'),
        originInput: document.getElementById('origin'),
        destinationInput: document.getElementById('destination'),
        departureInput: document.getElementById('departure'),
        returnInput: document.getElementById('return'),
        passengersSelect: document.getElementById('passengers'),
        returnField: document.getElementById('returnField'),
        typeRoundTrip: document.getElementById('typeRoundTrip'),
        typeOneWay: document.getElementById('typeOneWay'),
        tripGrid: document.getElementById('tripGrid'),
        resultCount: document.getElementById('resultCount'),
        budgetSlider: document.getElementById('budgetSlider'),
        budgetValue: document.getElementById('budgetValue'),
        favoriteCountBadge: document.querySelector('[data-favorite-count]'),
        favoritesButton: document.querySelector('[data-action="show-favorites"]'),
        toast: document.getElementById('ftToast'),
        featuredContainer: document.getElementById('featuredDestinationContainer'),
        menuToggle: document.getElementById('menuToggle'),
        mainNav: document.getElementById('mainNav'),
        loginBtn: document.querySelector('.login-btn'),
        loginModal: document.getElementById('loginModal'),
        closeButtons: document.querySelectorAll('.ft-modal-close, .ft-modal-backdrop')
    };
}

let elements = getElements();

// Utilitários de Data e IATA
function extractIataCode(inputString) {
    if (!inputString) return '';
    const match = inputString.match(/\b[A-Z]{3}\b/i);
    return match ? match[0].toUpperCase() : inputString.trim().substring(0, 3).toUpperCase();
}

function getFutureDateString(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForUrl(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}${month}`;
}

function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 3000);
}

// Gerador de URL de Afiliado para Voos (Aviasales)
function generateTravelpayoutsUrl(origin, destination, departureDate, returnDate, passengers = 1) {
    const originIata = extractIataCode(origin) || 'GRU';
    const destinationIata = extractIataCode(destination) || 'GIG';
    const isOneWay = elements.typeOneWay && elements.typeOneWay.checked;

    const depDate = departureDate || getFutureDateString(30);
    const formattedDep = formatDateForUrl(depDate);

    let formattedRet = '';
    if (!isOneWay) {
        const retDate = returnDate || getFutureDateString(37);
        formattedRet = formatDateForUrl(retDate);
    }

    let routePath = `${originIata}${formattedDep}${destinationIata}${formattedRet}${passengers}`;

    return `https://www.aviasales.com/search/${routePath}?marker=${state.travelPayoutsMarker}&currency=BRL`;
}

// Gerador de URL de Afiliado para Hotéis (Kiwi via Travelpayouts)
function generateKiwiHotelUrl(destination) {
    const cleanDestination = destination ? encodeURIComponent(destination.trim()) : '';
    const kiwiHotelUrl = cleanDestination 
        ? `https://www.kiwi.com/br/hotel/search/${cleanDestination}`
        : `https://www.kiwi.com/br/hotel/`;

    return `https://tp.media/r?p=3830&subid=freetravel_hotels&marker=${state.travelPayoutsMarker}&custom_url=${encodeURIComponent(kiwiHotelUrl)}`;
}

// Destino em Destaque
function renderFeaturedDestination() {
    if (!elements.featuredContainer) return;

    const featuredData = {
        title: "Tóquio, Japão",
        badge: "VOO EM DESTAQUE",
        description: "Encontre as melhores tarifas de passagens aéreas para explorar a metrópole onde a tradição encontra o futuro.",
        price: "R$ 8.699",
        oldPrice: "R$ 10.499",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        originCode: "GRU",
        destinationCode: "TYO"
    };

    const directUrl = generateTravelpayoutsUrl(featuredData.originCode, featuredData.destinationCode, '', '');

    elements.featuredContainer.innerHTML = `
      <section style="position: relative; border-radius: 20px; overflow: hidden; background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 100%), url('${featuredData.image}') center/cover no-repeat; color: #ffffff; padding: 60px 40px; min-height: 380px; display: flex; align-items: center; box-shadow: 0 14px 40px rgba(0,0,0,0.12);">
        <div style="max-width: 580px;">
          <span style="display: inline-block; background: #f5c400; color: #090909; font-size: 11px; font-weight: 900; padding: 5px 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">${featuredData.badge}</span>
          <h2 style="font-size: 2.4rem; font-weight: 900; line-height: 1.1; margin-bottom: 10px; color: #ffffff;">${featuredData.title}</h2>
          <p style="font-size: 1rem; color: #e0e0e0; margin-bottom: 22px; line-height: 1.5;">${featuredData.description}</p>
          <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 26px;">
            <span style="font-size: 2rem; font-weight: 900; color: #f5c400;">${featuredData.price}</span>
            <span style="font-size: 1.1rem; text-decoration: line-through; color: #aaaaaa;">${featuredData.oldPrice}</span>
          </div>
          <a href="${directUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; background: #f5c400; color: #090909; font-size: 0.95rem; font-weight: 800; padding: 14px 28px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(245, 196, 0, 0.3); transition: all 0.2s ease-in-out;">
            Buscar Voos Promocionais
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      </section>
    `;
}

// Preenchimento de destino via Cards
function selectDestinationInForm(destinationName, destinationIata) {
    elements = getElements();
    if (elements.destinationInput) {
        elements.destinationInput.value = `${destinationName} (${destinationIata})`;
        elements.destinationInput.dispatchEvent(new Event('input', { bubbles: true }));
        elements.destinationInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        if (elements.departureInput) elements.departureInput.focus();
    }, 400);
}

function setupDestinationCards() {
    document.querySelectorAll('[data-destination]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const cityName = button.getAttribute('data-destination');
            const iataCode = iataMap[cityName] || 'GIG';
            selectDestinationInForm(cityName, iataCode);
        });
    });
}

// Renderização das Ofertas em Grid
function renderTrips() {
    elements = getElements();
    if (!elements.tripGrid) return;

    state.filteredTrips = state.allTrips.filter(trip => {
        const matchesCategory = state.activeFilter === 'Todos' || trip.category === state.activeFilter;
        const matchesBudget = trip.price <= state.maxBudget;
        const matchesFavorites = state.showOnlyFavorites ? state.favorites.includes(trip.id) : true;
        return matchesCategory && matchesBudget && matchesFavorites;
    });

    if (elements.resultCount) {
        elements.resultCount.textContent = `${state.filteredTrips.length} oferta(s) encontrada(s)`;
    }

    if (state.filteredTrips.length === 0) {
        elements.tripGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">Nenhuma oferta encontrada.</p>
                <small>Tente alterar os filtros de categoria ou ajustar o orçamento.</small>
            </div>`;
        return;
    }

    elements.tripGrid.innerHTML = state.filteredTrips.map(trip => {
        const isFav = state.favorites.includes(trip.id);
        const affiliateUrl = generateTravelpayoutsUrl(trip.originCode, trip.destinationCode, trip.departureDate, trip.returnDate);

        return `
            <article class="trip-card" data-id="${trip.id}" style="background: #ffffff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.08); min-height: 380px;">
                <div style="position: relative; width: 100%; height: 200px; overflow: hidden; background-color: #e0e0e0; flex-shrink: 0;">
                    <img src="${trip.image}" alt="" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block; border: 0;">
                    ${trip.badge ? `<span style="position: absolute; top: 12px; left: 12px; background: #111111; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; z-index: 2;">${trip.badge}</span>` : ''}
                    <button type="button" class="favorite-toggle-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${trip.id}')" style="position: absolute; top: 12px; right: 12px; background: #ffffff; border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2); font-size: 1.1rem; color: ${isFav ? '#e63946' : '#777777'}; z-index: 2;" title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
                <div style="padding: 16px; background-color: #ffffff; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 0.8rem; color: #d4a373; font-weight: bold; text-transform: uppercase;">${trip.category}</span>
                            <span style="font-size: 0.8rem; color: #777777;">${trip.days} dias</span>
                        </div>
                        <h3 style="color: #111111 !important; font-size: 1.05rem; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">${trip.title}</h3>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                        <div>
                            <small style="display: block; color: #777777; font-size: 0.75rem;">A partir de</small>
                            <strong style="font-size: 1.25rem; color: #000000; font-weight: 800;">R$ ${trip.price.toLocaleString('pt-BR')}</strong>
                        </div>
                        <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #ffcc00; color: #111111; font-weight: 700; padding: 8px 14px; font-size: 0.85rem; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Ver Oferta →
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Favoritos
window.toggleFavorite = function(tripId) {
    const index = state.favorites.indexOf(tripId);
    if (index === -1) {
        state.favorites.push(tripId);
        showToast("Adicionado aos seus favoritos!");
    } else {
        state.favorites.splice(index, 1);
        showToast("Removido dos favoritos.");
    }
    
    localStorage.setItem('freetravel_favorites', JSON.stringify(state.favorites));
    updateFavoriteBadge();
    renderTrips();
};

function updateFavoriteBadge() {
    elements = getElements();
    if (elements.favoriteCountBadge) {
        const count = state.favorites.length;
        elements.favoriteCountBadge.textContent = count;
        elements.favoriteCountBadge.hidden = count === 0;
    }
}

function filterFavorites() {
    if (state.favorites.length === 0 && !state.showOnlyFavorites) {
        showToast('Você ainda não tem ofertas salvas nos favoritos!');
        return;
    }
    state.showOnlyFavorites = !state.showOnlyFavorites;
    if (elements.favoritesButton) {
        elements.favoritesButton.classList.toggle('active', state.showOnlyFavorites);
    }
    renderTrips();
}

// Eventos e UI Geral
function initEventListeners() {
    elements = getElements();

    // Controle das Abas (Voos vs Hotéis)
    const tabButtons = document.querySelectorAll('.search-tab-btn, [data-tab]');
    let activeTab = 'flights';

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            activeTab = e.target.getAttribute('data-tab') || 'flights';

            // Oculta/Exibe campos do formulário para busca de Hotéis
            if (elements.originInput && elements.originInput.parentElement) {
                elements.originInput.parentElement.style.display = activeTab === 'hotels' ? 'none' : 'block';
            }
            if (elements.returnField) {
                elements.returnField.style.display = activeTab === 'hotels' ? 'none' : 'block';
            }
        });
    });

    // Menu Mobile
    if (elements.menuToggle && elements.mainNav) {
        elements.menuToggle.addEventListener("click", () => elements.mainNav.classList.toggle("open"));
    }

    // Modal Login
    const openModal = (modal) => { if(modal) { modal.classList.add("open"); document.body.classList.add("modal-open"); }};
    const closeModal = (modal) => { if(modal) { modal.classList.remove("open"); document.body.classList.remove("modal-open"); }};
    
    if (elements.loginBtn) elements.loginBtn.addEventListener("click", () => openModal(elements.loginModal));
    elements.closeButtons.forEach(btn => btn.addEventListener("click", () => closeModal(elements.loginModal)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(elements.loginModal) });

    // Alternância Ida e Volta
    if (elements.typeOneWay && elements.typeRoundTrip && elements.returnField) {
        elements.typeOneWay.addEventListener('change', () => {
            elements.returnField.style.display = 'none';
            if (elements.returnInput) elements.returnInput.value = '';
        });
        elements.typeRoundTrip.addEventListener('change', () => {
            if (activeTab !== 'hotels') elements.returnField.style.display = 'block';
        });
    }

    // Submissão do Formulário de Pesquisa (Voos e Hotéis)
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const destination = elements.destinationInput ? elements.destinationInput.value : '';

            if (!destination.trim()) {
                showToast("Por favor, preencha a cidade de destino.");
                return;
            }

            // Busca de Hotéis na Kiwi
            if (activeTab === 'hotels') {
                showToast("Buscando opções de hospedagem na Kiwi...");
                const hotelUrl = generateKiwiHotelUrl(destination);
                
                setTimeout(() => {
                    window.open(hotelUrl, '_blank');
                }, 400);
                return;
            }

            // Busca de Voos no Aviasales
            const origin = elements.originInput ? elements.originInput.value : '';
            if (!origin.trim()) {
                showToast("Por favor, preencha a cidade de origem.");
                return;
            }

            const departure = elements.departureInput ? elements.departureInput.value : '';
            const returnDate = elements.returnInput ? elements.returnInput.value : '';
            const passengers = elements.passengersSelect ? elements.passengersSelect.value : 1;

            showToast("Buscando as melhores ofertas...");
            const flightUrl = generateTravelpayoutsUrl(origin, destination, departure, returnDate, passengers);
            
            setTimeout(() => {
                window.open(flightUrl, '_blank');
            }, 400);
        });
    }

    // Filtros de Orçamento e Categoria
    if (elements.budgetSlider && elements.budgetValue) {
        elements.budgetSlider.addEventListener('input', (e) => {
            state.maxBudget = Number(e.target.value);
            elements.budgetValue.textContent = `R$ ${state.maxBudget.toLocaleString('pt-BR')}`;
            renderTrips();
        });
    }

    document.querySelectorAll('[data-trip-type]').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('[data-trip-type]').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            state.activeFilter = e.target.getAttribute('data-trip-type');
            renderTrips();
        });
    });

    if (elements.favoritesButton) {
        elements.favoritesButton.addEventListener('click', filterFavorites);
    }
}

// Inicialização Geral da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    elements = getElements();
    updateFavoriteBadge();
    initEventListeners();
    renderFeaturedDestination();
    renderTrips();
    setupDestinationCards();
});
