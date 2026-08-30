// State Management
const state = {
    allTrips: [],
    filteredTrips: [],
    favorites: JSON.parse(localStorage.getItem('freetravel_favorites') || '[]'),
    activeFilter: 'Todos',
    maxBudget: 5000,
    travelPayoutsMarker: '771005' // Substitua pelo seu ID de afiliado do Travelpayouts
};

// Mock Data - Ofertas de Viagem com Códigos IATA
const mockTrips = [
    {
        id: '1',
        title: 'São Paulo → Rio de Janeiro',
        originCode: 'GRU',
        originName: 'São Paulo (GRU)',
        destinationCode: 'GIG',
        destinationName: 'Rio de Janeiro (GIG)',
        category: 'Praia',
        price: 380,
        days: 3,
        image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
        badge: 'Mais Vendido',
        departureDate: '2026-10-15',
        returnDate: '2026-10-18'
    },
    {
        id: '2',
        title: 'São Paulo → Buenos Aires',
        originCode: 'GRU',
        originName: 'São Paulo (GRU)',
        destinationCode: 'EZE',
        destinationName: 'Buenos Aires (EZE)',
        category: 'Cidade',
        price: 1250,
        days: 5,
        image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
        badge: 'Oferta Especial',
        departureDate: '2026-11-05',
        returnDate: '2026-11-10'
    },
    {
        id: '3',
        title: 'Rio de Janeiro → Bariloche',
        originCode: 'GIG',
        originName: 'Rio de Janeiro (GIG)',
        destinationCode: 'BRC',
        destinationName: 'Bariloche (BRC)',
        category: 'Natureza',
        price: 2400,
        days: 7,
        image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=800&q=80',
        badge: 'Inverno & Neve',
        departureDate: '2026-09-12',
        returnDate: '2026-09-19'
    },
    {
        id: '4',
        title: 'São Paulo → Madrid',
        originCode: 'GRU',
        originName: 'São Paulo (GRU)',
        destinationCode: 'MAD',
        destinationName: 'Madrid (MAD)',
        category: 'Cidade',
        price: 3890,
        days: 10,
        image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
        badge: 'Internacional',
        departureDate: '2026-11-20',
        returnDate: '2026-11-30'
    },
    {
        id: '5',
        title: 'São Paulo → Salvador',
        originCode: 'GRU',
        originName: 'São Paulo (GRU)',
        destinationCode: 'SSA',
        destinationName: 'Salvador (SSA)',
        category: 'Praia',
        price: 650,
        days: 4,
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
        badge: 'Nordeste',
        departureDate: '2026-10-01',
        returnDate: '2026-10-05'
    },
    {
        id: '6',
        title: 'São Paulo → Paris',
        originCode: 'GRU',
        originName: 'São Paulo (GRU)',
        destinationCode: 'CDG',
        destinationName: 'Paris (CDG)',
        category: 'Cidade',
        price: 4600,
        days: 8,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        badge: 'Europa',
        departureDate: '2026-12-01',
        returnDate: '2026-12-09'
    }
];

// DOM Elements
const elements = {
    tripGrid: document.getElementById('tripGrid'),
    resultCount: document.getElementById('resultCount'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    budgetSlider: document.getElementById('budgetSlider'),
    budgetValue: document.getElementById('budgetValue'),
    searchForm: document.getElementById('searchForm'),
    originInput: document.getElementById('origin'),
    destinationInput: document.getElementById('destination'),
    departureInput: document.getElementById('departure'),
    returnInput: document.getElementById('return'),
    passengersSelect: document.getElementById('passengers'),
    typeRoundTrip: document.getElementById('typeRoundTrip'),
    typeOneWay: document.getElementById('typeOneWay'),
    returnField: document.getElementById('returnField'),
    menuToggle: document.querySelector('[data-menu-toggle]'),
    mainNav: document.getElementById('mainNav'),
    favoriteCountBadge: document.querySelector('[data-favorite-count]')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    state.allTrips = [...mockTrips];
    initEventListeners();
    updateFavoritesBadge();
    renderTrips();
});

// Event Listeners Initialization
function initEventListeners() {
    // 1. GERENCIAMENTO DE LINKS E ROLAGEM SUAVE
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 2. ALTERNÂNCIA IDA E VOLTA / SOMENTE IDA
    if (elements.typeOneWay && elements.typeRoundTrip && elements.returnInput) {
        function toggleReturnField() {
            if (elements.typeOneWay.checked) {
                elements.returnInput.disabled = true;
                elements.returnInput.required = false;
                elements.returnInput.value = '';
                elements.returnInput.classList.add('disabled-input');
            } else {
                elements.returnInput.disabled = false;
                elements.returnInput.required = true;
                elements.returnInput.classList.remove('disabled-input');
            }
        }

        elements.typeOneWay.addEventListener('change', toggleReturnField);
        elements.typeRoundTrip.addEventListener('change', toggleReturnField);
    }

    // 3. MENU MOBILE
    if (elements.menuToggle && elements.mainNav) {
        elements.menuToggle.addEventListener('click', () => {
            const isExpanded = elements.menuToggle.getAttribute('aria-expanded') === 'true';
            elements.menuToggle.setAttribute('aria-expanded', !isExpanded);
            elements.mainNav.classList.toggle('open');
        });
    }

    // 4. FILTROS DE CATEGORIA
    if (elements.filterBtns) {
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeFilter = btn.getAttribute('data-trip-type') || 'Todos';
                renderTrips();
            });
        });
    }

    // 5. SLIDER DE ORÇAMENTO
    if (elements.budgetSlider && elements.budgetValue) {
        elements.budgetSlider.addEventListener('input', (e) => {
            state.maxBudget = Number(e.target.value);
            elements.budgetValue.textContent = `R$ ${state.maxBudget.toLocaleString('pt-BR')}`;
            renderTrips();
        });
    }

    // 6. SUBMIT DO FORMULÁRIO (REDIRECIONAMENTO TRAVELPAYOUTS)
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearchSubmit();
        });
    }

    // 7. CARDS RÁPIDOS DE DESTINO
    document.querySelectorAll('.destination-card').forEach(card => {
        card.addEventListener('click', () => {
            const destName = card.getAttribute('data-destination');
            if (elements.destinationInput) {
                elements.destinationInput.value = destName;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                elements.destinationInput.focus();
            }
        });
    });

    // 8. BOTÕES DE IR PARA BUSCA
    document.querySelectorAll('[data-action="go-search"]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 9. EXIBIR FAVORITOS
    const favLink = document.querySelector('[data-action="show-favorites"]');
    if (favLink) {
        favLink.addEventListener('click', () => {
            filterFavorites();
        });
    }
}

// Render Trips to Grid
function renderTrips() {
    if (!elements.tripGrid) return;

    state.filteredTrips = state.allTrips.filter(trip => {
        const matchesCategory = state.activeFilter === 'Todos' || trip.category === state.activeFilter;
        const matchesBudget = trip.price <= state.maxBudget;
        return matchesCategory && matchesBudget;
    });

    if (elements.resultCount) {
        elements.resultCount.textContent = `${state.filteredTrips.length} oferta(s) encontrada(s)`;
    }

    if (state.filteredTrips.length === 0) {
        elements.tripGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #a0a0a0;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">Nenhuma oferta encontrada para os filtros selecionados.</p>
                <small>Tente aumentar o valor do orçamento no controle acima.</small>
            </div>
        `;
        return;
    }

    elements.tripGrid.innerHTML = state.filteredTrips.map(trip => {
        const isFav = state.favorites.includes(trip.id);
        const affiliateUrl = generateTravelpayoutsUrl(
            trip.originCode,
            trip.destinationCode,
            trip.departureDate,
            trip.returnDate
        );

        return `
            <article class="trip-card" data-id="${trip.id}">
                <div class="trip-card-image" style="position: relative;">
                    <img src="${trip.image}" alt="${trip.title}" loading="lazy">
                    ${trip.badge ? `<span class="trip-badge" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: bold;">${trip.badge}</span>` : ''}
                    <button 
                        type="button" 
                        class="favorite-toggle-btn ${isFav ? 'active' : ''}" 
                        onclick="toggleFavorite('${trip.id}')"
                        style="position: absolute; top: 12px; right: 12px; background: #fff; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-size: 1.1rem; color: ${isFav ? '#e63946' : '#666'};"
                        title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                    >
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
                <div class="trip-card-body" style="padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.8rem; color: #f2bc07; font-weight: bold; text-transform: uppercase;">${trip.category}</span>
                        <span style="font-size: 0.8rem; color: #888;">${trip.days} dias</span>
                    </div>
                    <h3 style="font-size: 1.1rem; margin: 0 0 12px 0; color: #fff;">${trip.title}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px;">
                        <div>
                            <small style="display: block; color: #aaa; font-size: 0.75rem;">A partir de</small>
                            <strong style="font-size: 1.3rem; color: #2ec4b6;">R$ ${trip.price.toLocaleString('pt-BR')}</strong>
                        </div>
                        <a 
                            href="${affiliateUrl}" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            class="search-button" 
                            style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; text-align: center; border-radius: 6px;"
                        >
                            Ver Oferta →
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Alternar Favorito
window.toggleFavorite = function(id) {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push(id);
    }
    localStorage.setItem('freetravel_favorites', JSON.stringify(state.favorites));
    updateFavoritesBadge();
    renderTrips();
};

// Filtrar Apenas Favoritos
function filterFavorites() {
    if (state.favorites.length === 0) {
        alert('Você ainda não tem ofertas salvas nos favoritos!');
        return;
    }
    state.filteredTrips = state.allTrips.filter(t => state.favorites.includes(t.id));
    if (elements.resultCount) {
        elements.resultCount.textContent = `Exibindo ${state.filteredTrips.length} favorito(s)`;
    }
    renderTrips();
}

// Atualizar Contador no Header
function updateFavoritesBadge() {
    if (elements.favoriteCountBadge) {
        const count = state.favorites.length;
        elements.favoriteCountBadge.textContent = count;
        elements.favoriteCountBadge.hidden = count === 0;
    }
}

// Processar Envio do Formulário de Busca
function handleSearchSubmit() {
    const origin = elements.originInput ? elements.originInput.value.trim().toUpperCase() : '';
    const destination = elements.destinationInput ? elements.destinationInput.value.trim().toUpperCase() : '';
    const departure = elements.departureInput ? elements.departureInput.value : '';
    const returnDate = elements.returnInput ? elements.returnInput.value : '';

    if (!origin || !destination) {
        alert('Por favor, preencha os campos de origem e destino.');
        return;
    }

    const searchUrl = generateTravelpayoutsUrl(origin, destination, departure, returnDate);
    window.open(searchUrl, '_blank');
}

// Gerar URL de Afiliado (Travelpayouts / Aviasales em PT-BR e R$)
function generateTravelpayoutsUrl(origin, destination, departureDate, returnDate) {
    const originIata = extractIataCode(origin) || 'GRU';
    const destinationIata = extractIataCode(destination) || 'GIG';

    const formattedDep = formatDateForUrl(departureDate);
    const formattedRet = formatDateForUrl(returnDate);

    let routePath = `${originIata}${formattedDep}${destinationIata}`;
    if (formattedRet && (!elements.typeOneWay || !elements.typeOneWay.checked)) {
        routePath += `${formattedRet}`;
    }
    routePath += '1'; // 1 Passageiro

    return `https://www.aviasales.com/search/${routePath}?marker=${state.travelPayoutsMarker}&currency=BRL`;
}

// Extrair Código IATA (3 Letras)
function extractIataCode(str) {
    if (!str) return '';
    const match = str.match(/\b[A-Z]{3}\b/);
    if (match) return match[0];
    if (str.length === 3) return str.toUpperCase();
    return str.substring(0, 3).toUpperCase();
}

// Formatar Data (YYYY-MM-DD para DDMM)
function formatDateForUrl(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}${parts[1]}`;
}
