// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
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
    activeTab: 'flights',
    maxBudget: 10000,
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
    'Tóquio': 'TYO',
    'Miami': 'MIA',
    'Roma': 'FCO',
    'Cairo': 'CAI',
    'São Paulo': 'GRU'
};

// ==========================================
// ELEMENTOS DO DOM
// ==========================================
function getElements() {
    const originInput = document.getElementById('origin');
    return {
        searchForm: document.getElementById('searchForm'),
        originInput: originInput,
        destinationInput: document.getElementById('destination'),
        departureInput: document.getElementById('departure'),
        returnInput: document.getElementById('return'),
        passengersSelect: document.getElementById('passengers'),
        returnField: document.getElementById('returnField'),
        originField: document.getElementById('originField') || (originInput ? originInput.closest('.search-field') : null),
        typeRoundTrip: document.getElementById('typeRoundTrip'),
        typeOneWay: document.getElementById('typeOneWay'),
        tripGrid: document.getElementById('tripGrid'),
        resultCount: document.getElementById('resultCount'),
        budgetSlider: document.getElementById('budgetSlider'),
        budgetValue: document.getElementById('budgetValue'),
        favoriteCountBadge: document.querySelector('[data-favorite-count]'),
        favoritesButton: document.querySelector('[data-action="show-favorites"]'),
        showAllBtn: document.querySelector('[data-action="show-all"]'),
        goSearchBtn: document.querySelector('[data-action="go-search"]'),
        featuredContainer: document.getElementById('featuredDestinationContainer'),
        menuToggle: document.querySelector('[data-menu-toggle]'),
        mainNav: document.getElementById('mainNav'),
        loginBtn: document.querySelector('.login-btn'),
        searchTabs: document.querySelectorAll('.search-tab')
    };
}

let elements = getElements();

// Helper para selecionar o container dos Radio Buttons de Tipo de Viagem
function getTripTypesWrapper() {
    return document.querySelector('.trip-types') || 
           (elements.typeRoundTrip ? elements.typeRoundTrip.closest('div') : null);
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function extractIataCode(inputString) {
    if (!inputString) return '';
    
    const match = inputString.match(/\(([^)]+)\)/);
    if (match && match[1].length === 3) return match[1].toUpperCase();

    const iataMatch = inputString.match(/\b[A-Z]{3}\b/i);
    if (iataMatch) return iataMatch[0].toUpperCase();

    const cleanName = inputString.trim();
    if (iataMap[cleanName]) return iataMap[cleanName];

    return cleanName.substring(0, 3).toUpperCase();
}

function getFutureDateString(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
}

function formatDateForUrl(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}${month}`;
}

function showToast(message) {
    let toast = document.getElementById('ftToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ftToast';
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; font-size: 0.9rem; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0; transition: opacity 0.3s ease; font-family: sans-serif;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3200);
}

function updatePassengersSelectOptions(unitTextSingular, unitTextPlural) {
    if (!elements.passengersSelect) return;
    const select = elements.passengersSelect;
    const currentVal = select.value;
    
    Array.from(select.options).forEach(opt => {
        const val = parseInt(opt.value, 10);
        const label = val === 1 ? unitTextSingular : unitTextPlural;
        opt.textContent = `${val} ${label}`;
    });
    
    select.value = currentVal;
}

function setupDateLimits() {
    elements = getElements();
    const today = getFutureDateString(0);
    
    if (elements.departureInput) {
        elements.departureInput.min = today;
        elements.departureInput.addEventListener('change', () => {
            if (elements.returnInput) {
                elements.returnInput.min = elements.departureInput.value || today;
                if (elements.returnInput.value && elements.returnInput.value < elements.departureInput.value) {
                    elements.returnInput.value = elements.departureInput.value;
                }
            }
        });
    }
    if (elements.returnInput) {
        elements.returnInput.min = today;
    }
}

// ==========================================
// GERADORES DE URL AFILIADA
// ==========================================
function generateTravelpayoutsUrl(origin, destination, departureDate, returnDate, passengers = 1) {
    const originIata = extractIataCode(origin) || 'GRU';
    const destinationIata = extractIataCode(destination) || 'GIG';
    const isOneWay = elements.typeOneWay && elements.typeOneWay.checked;

    const depDate = departureDate || getFutureDateString(30);
    const formattedDep = formatDateForUrl(depDate);

    let formattedRet = '';
    if (!isOneWay && state.activeTab !== 'hotels') {
        const retDate = returnDate || getFutureDateString(37);
        formattedRet = formatDateForUrl(retDate);
    }

    const routePath = `${originIata}${formattedDep}${destinationIata}${formattedRet}${passengers}`;
    return `https://www.aviasales.com/search/${routePath}?marker=${state.travelPayoutsMarker}&currency=BRL`;
}

function generateHotellookUrl(destinationInput, checkInDate, checkOutDate, guests = 2) {
    const cleanDestination = destinationInput ? destinationInput.replace(/\s*\([A-Z]{3}\)/i, '').trim() : 'São Paulo';
    const checkIn = checkInDate || getFutureDateString(30);
    const checkOut = checkOutDate || getFutureDateString(35);
    const labelMarker = `affnetTP_hotel_${state.travelPayoutsMarker}`;

    return `https://sp.booking.com/searchresults.pt-br.html?ss=${encodeURIComponent(cleanDestination)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}&label=${labelMarker}&selected_currency=BRL&lang=pt-br`;
}

// ==========================================
// RENDERIZAÇÃO DE COMPONENTES
// ==========================================
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
                <small>Tente alterar os filtros de categoria ou ajuste o orçamento.</small>
            </div>`;
        return;
    }

    elements.tripGrid.innerHTML = state.filteredTrips.map(trip => {
        const isFav = state.favorites.includes(trip.id);
        const affiliateUrl = generateTravelpayoutsUrl(trip.originCode, trip.destinationCode, trip.departureDate, trip.returnDate);

        return `
            <article class="trip-card" data-id="${trip.id}" style="background: #ffffff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.08); min-height: 380px;">
                <div style="position: relative; width: 100%; height: 200px; overflow: hidden; background-color: #e0e0e0; flex-shrink: 0;">
                    <img src="${trip.image}" alt="${trip.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block; border: 0;">
                    ${trip.badge ? `<span style="position: absolute; top: 12px; left: 12px; background: #111111; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; z-index: 2;">${trip.badge}</span>` : ''}
                    <button type="button" onclick="toggleFavorite('${trip.id}')" aria-label="Favoritar oferta" style="position: absolute; top: 12px; right: 12px; background: #ffffff; border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2); font-size: 1.1rem; color: ${isFav ? '#e63946' : '#777777'}; z-index: 2;" title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
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

// ==========================================
// GERENCIAMENTO DE FAVORITOS
// ==========================================
window.toggleFavorite = function(tripId) {
    const index = state.favorites.indexOf(tripId);
    if (index === -1) {
        state.favorites.push(tripId);
        showToast("Adicionado aos favoritos!");
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
        elements.favoriteCountBadge.style.display = count === 0 ? 'none' : 'inline-flex';
    }
}

function filterFavorites() {
    if (state.favorites.length === 0 && !state.showOnlyFavorites) {
        showToast('Você ainda não possui ofertas salvas nos favoritos.');
        return;
    }
    state.showOnlyFavorites = !state.showOnlyFavorites;
    if (elements.favoritesButton) {
        elements.favoritesButton.classList.toggle('active', state.showOnlyFavorites);
    }
    renderTrips();
}

// ==========================================
// SELEÇÃO DE DESTINOS
// ==========================================
function selectDestinationInForm(destinationName, destinationIata) {
    elements = getElements();
    if (elements.destinationInput) {
        elements.destinationInput.value = `${destinationName} (${destinationIata})`;
    }
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
        if (elements.departureInput) elements.departureInput.focus();
    }, 400);
}

function setupDestinationCards() {
    document.querySelectorAll('[data-destination]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const cityName = button.getAttribute('data-destination');
            const iataCode = iataMap[cityName] || extractIataCode(cityName) || 'GIG';
            selectDestinationInForm(cityName, iataCode);
        });
    });
}

// ==========================================
// EVENTOS E EVENT LISTENERS
// ==========================================
function initEventListeners() {
    elements = getElements();

    // Controle de Abas (Voos, Hotéis, Pacotes)
    if (elements.searchTabs.length > 0) {
        elements.searchTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                elements.searchTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const tabTypes = ['flights', 'hotels', 'packages'];
                state.activeTab = tabTypes[index] || 'flights';

                const originWrapper = elements.originField;
                const returnWrapper = elements.returnField;
                const submitBtn = elements.searchForm?.querySelector('.search-button');
                const tripTypesWrapper = getTripTypesWrapper();

                const depLabel = elements.departureInput?.closest('.search-field')?.querySelector('label');
                const retLabel = elements.returnInput?.closest('.search-field')?.querySelector('label');
                const passLabel = elements.passengersSelect?.closest('.search-field')?.querySelector('label');

                if (state.activeTab === 'hotels') {
                    // OCULTA ORIGEM E OS RADIO BUTTONS DE IDA/VOLTA
                    if (originWrapper) originWrapper.style.display = 'none';
                    if (tripTypesWrapper) tripTypesWrapper.style.display = 'none';

                    if (returnWrapper) returnWrapper.style.display = 'block';

                    if (depLabel) depLabel.textContent = 'CHECK-IN';
                    if (retLabel) retLabel.textContent = 'CHECK-OUT';
                    if (passLabel) passLabel.textContent = 'HÓSPEDES';

                    updatePassengersSelectOptions('hóspede', 'hóspedes');

                    if (elements.originInput) elements.originInput.removeAttribute('required');
                    if (elements.returnInput) elements.returnInput.setAttribute('required', 'required');

                    if (submitBtn) submitBtn.innerHTML = '<span class="search-button-icon">⌕</span> Buscar Hotéis';
                } else {
                    // EXIBE ORIGEM E OS RADIO BUTTONS DE IDA/VOLTA
                    if (originWrapper) originWrapper.style.display = 'block';
                    if (tripTypesWrapper) tripTypesWrapper.style.display = 'flex';

                    if (depLabel) depLabel.textContent = 'IDA';
                    if (retLabel) retLabel.textContent = 'VOLTA';
                    if (passLabel) passLabel.textContent = 'PASSAGEIROS';

                    updatePassengersSelectOptions('passageiro', 'passageiros');

                    if (elements.originInput) elements.originInput.setAttribute('required', 'required');

                    if (elements.typeOneWay?.checked) {
                        if (returnWrapper) returnWrapper.style.display = 'none';
                        if (elements.returnInput) elements.returnInput.removeAttribute('required');
                    } else {
                        if (returnWrapper) returnWrapper.style.display = 'block';
                        if (elements.returnInput) elements.returnInput.setAttribute('required', 'required');
                    }

                    if (submitBtn) submitBtn.innerHTML = '<span class="search-button-icon">⌕</span> Buscar Voos';
                }
            });
        });
    }

    // Controle de Slider de Orçamento
    if (elements.budgetSlider) {
        elements.budgetSlider.addEventListener('input', (e) => {
            state.maxBudget = Number(e.target.value);
            if (elements.budgetValue) {
                elements.budgetValue.textContent = `R$ ${state.maxBudget.toLocaleString('pt-BR')}`;
            }
            renderTrips();
        });
    }

    // Menu Mobile
    if (elements.menuToggle && elements.mainNav) {
        elements.menuToggle.addEventListener("click", () => {
            const expanded = elements.menuToggle.getAttribute('aria-expanded') === 'true';
            elements.menuToggle.setAttribute('aria-expanded', !expanded);
            elements.mainNav.classList.toggle("open");
        });
    }

    // Alternância Ida e Volta / Somente Ida
    if (elements.typeOneWay && elements.typeRoundTrip) {
        elements.typeOneWay.addEventListener('change', () => {
            if (elements.returnField) elements.returnField.style.display = 'none';
            if (elements.returnInput) {
                elements.returnInput.value = '';
                elements.returnInput.removeAttribute('required');
            }
        });
        elements.typeRoundTrip.addEventListener('change', () => {
            if (state.activeTab !== 'hotels') {
                if (elements.returnField) elements.returnField.style.display = 'block';
                if (elements.returnInput) elements.returnInput.setAttribute('required', 'required');
            }
        });
    }

    // Submissão do Formulário
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const destination = elements.destinationInput ? elements.destinationInput.value : '';
            const departure = elements.departureInput ? elements.departureInput.value : '';
            const returnDate = elements.returnInput ? elements.returnInput.value : '';
            const passengers = elements.passengersSelect ? elements.passengersSelect.value : 1;

            if (!destination.trim()) {
                showToast("Por favor, preencha o destino.");
                return;
            }

            let redirectUrl = '';

            if (state.activeTab === 'hotels') {
                showToast("Buscando os melhores hotéis...");
                redirectUrl = generateHotellookUrl(destination, departure, returnDate, passengers);
            } else {
                const origin = elements.originInput ? elements.originInput.value : '';
                if (!origin.trim()) {
                    showToast("Por favor, preencha a origem.");
                    return;
                }
                showToast("Buscando as melhores ofertas...");
                redirectUrl = generateTravelpayoutsUrl(origin, destination, departure, returnDate, passengers);
            }

            setTimeout(() => { window.open(redirectUrl, '_blank'); }, 400);
        });
    }

    // Filtros por Categoria
    document.querySelectorAll('[data-trip-type]').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('[data-trip-type]').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            state.activeFilter = e.target.getAttribute('data-trip-type');
            renderTrips();
        });
    });

    // Botão Ver Todas
    if (elements.showAllBtn) {
        elements.showAllBtn.addEventListener('click', () => {
            state.activeFilter = 'Todos';
            state.showOnlyFavorites = false;
            document.querySelectorAll('[data-trip-type]').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-trip-type') === 'Todos');
            });
            renderTrips();
        });
    }

    // Botão Ir Para Busca
    if (elements.goSearchBtn) {
        elements.goSearchBtn.addEventListener('click', () => {
            const homeSection = document.getElementById('home');
            if (homeSection) homeSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Favoritos no Header
    if (elements.favoritesButton) {
        elements.favoritesButton.addEventListener('click', filterFavorites);
    }
}
// ===================================================
// REDIRECIONAMENTO ASSIST 365 (SEGURO VIAGEM)
// ===================================================

const ASSIST365_CONFIG = {
    affiliateUrl: "https://assist-365.com/ar/?utm_medium=affiliate&utm_source=web&voucher=FREETRAVELBR"
};

function goToAssist365() {
    window.open(ASSIST365_CONFIG.affiliateUrl, '_blank');
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    elements = getElements();
    setupDateLimits();
    updateFavoriteBadge();
    initEventListeners();
    renderFeaturedDestination();
    renderTrips();
    setupDestinationCards();
});
