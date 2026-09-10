// Estado da Aplicação
const state = {
    allTrips: [
        {
            id: 'trip-1',
            title: 'Rio de Janeiro saindo de São Paulo',
            category: 'Praia',
            price: 450,
            days: 5,
            originCode: 'GRU',
            destinationCode: 'GIG',
            departureDate: '2026-10-15',
            returnDate: '2026-10-20',
            image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80',
            badge: 'Imperdível'
        },
        {
            id: 'trip-2',
            title: 'Buenos Aires saindo de São Paulo',
            category: 'Cidade',
            price: 1200,
            days: 7,
            originCode: 'GRU',
            destinationCode: 'EZE',
            departureDate: '2026-11-01',
            returnDate: '2026-11-08',
            image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=600&q=80',
            badge: 'Mais Vendido'
        },
        {
            id: 'trip-3',
            title: 'Bariloche saindo de Buenos Aires',
            category: 'Natureza',
            price: 1800,
            days: 6,
            originCode: 'EZE',
            destinationCode: 'BRC',
            departureDate: '2026-12-05',
            returnDate: '2026-12-11',
            image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=600&q=80',
            badge: null
        },
        {
            id: 'trip-4',
            title: 'Miami saindo de São Paulo',
            category: 'Praia',
            price: 2850,
            days: 7,
            originCode: 'GRU',
            destinationCode: 'MIA',
            departureDate: '2026-11-10',
            returnDate: '2026-11-17',
            image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
            badge: 'Popular'
        },
        {
            id: 'trip-5',
            title: 'Roma saindo de São Paulo',
            category: 'Cidade',
            price: 3400,
            days: 8,
            originCode: 'GRU',
            destinationCode: 'FCO',
            departureDate: '2026-11-15',
            returnDate: '2026-11-23',
            image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
            badge: 'Destaque'
        },
        {
            id: 'trip-6',
            title: 'Cairo (Egito) saindo de São Paulo',
            category: 'Natureza',
            price: 4200,
            days: 10,
            originCode: 'GRU',
            destinationCode: 'CAI',
            departureDate: '2026-12-01',
            returnDate: '2026-12-11',
            image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
            badge: 'Exótico'
        }
    ],
    filteredTrips: [],
    favorites: JSON.parse(localStorage.getItem('freetravel_favorites') || '[]'),
    activeFilter: 'Todos',
    maxBudget: 5000,
    showOnlyFavorites: false,
    travelPayoutsMarker: '771005'
};

// Mapeamento dos Elementos do DOM
const elements = {
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
    favoritesButton: document.querySelector('[data-action="show-favorites"]')
};

// Utilitários de Formatação
function extractIataCode(inputString) {
    if (!inputString) return '';
    const match = inputString.match(/\b[A-Z]{3}\b/i);
    return match ? match[0].toUpperCase() : inputString.trim().substring(0, 3).toUpperCase();
}

function formatDateForUrl(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}${month}`;
}

// Gerador de URL de Afiliado (Travelpayouts / Aviasales)
function generateTravelpayoutsUrl(origin, destination, departureDate, returnDate, passengers = 1) {
    const originIata = extractIataCode(origin) || 'GRU';
    const destinationIata = extractIataCode(destination) || 'GIG';
    const formattedDep = formatDateForUrl(departureDate);
    const formattedRet = formatDateForUrl(returnDate);
    const isOneWay = elements.typeOneWay && elements.typeOneWay.checked;

    let routePath = `${originIata}${formattedDep}${destinationIata}`;
    
    if (formattedRet && !isOneWay) {
        routePath += `${formattedRet}`;
    }
    
    routePath += `${passengers}`;

    return `https://www.aviasales.com/search/${routePath}?marker=${state.travelPayoutsMarker}&currency=BRL`;
}

// Renderização dos Cards (Ajustado para CSS nativo)
function renderTrips() {
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
                <div class="trip-card-image">
                    <img src="${trip.image}" alt="${trip.title}" loading="lazy">
                    ${trip.badge ? `<span class="trip-badge">${trip.badge}</span>` : ''}
                    <button 
                        type="button" 
                        class="favorite-toggle-btn ${isFav ? 'active' : ''}" 
                        onclick="toggleFavorite('${trip.id}')"
                        title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                    >
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
                <div class="trip-card-body">
                    <div class="trip-card-header">
                        <span class="trip-category">${trip.category}</span>
                        <span class="trip-duration">${trip.days} dias</span>
                    </div>
                    <h3 class="trip-title" style="color: #1a1a1a; font-size: 1.1rem; margin: 8px 0 12px 0;">${trip.title}</h3>
                    <div class="trip-card-footer">
                        <div class="trip-price">
                            <small>A partir de</small>
                            <strong>R$ ${trip.price.toLocaleString('pt-BR')}</strong>
                        </div>
                        <a 
                            href="${affiliateUrl}" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            class="search-button"
                        >
                            Ver Oferta →
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Gerenciamento de Favoritos
function toggleFavorite(tripId) {
    const index = state.favorites.indexOf(tripId);
    if (index === -1) {
        state.favorites.push(tripId);
    } else {
        state.favorites.splice(index, 1);
    }
    
    localStorage.setItem('freetravel_favorites', JSON.stringify(state.favorites));
    updateFavoriteBadge();
    renderTrips();
}

function updateFavoriteBadge() {
    if (elements.favoriteCountBadge) {
        const count = state.favorites.length;
        elements.favoriteCountBadge.textContent = count;
        elements.favoriteCountBadge.hidden = count === 0;
    }
}

function filterFavorites() {
    if (state.favorites.length === 0 && !state.showOnlyFavorites) {
        alert('Você ainda não tem ofertas salvas nos favoritos!');
        return;
    }
    state.showOnlyFavorites = !state.showOnlyFavorites;
    
    if (elements.favoritesButton) {
        elements.favoritesButton.classList.toggle('active', state.showOnlyFavorites);
    }
    
    renderTrips();
}

// Inicialização de Eventos
function initEventListeners() {
    if (elements.typeOneWay && elements.typeRoundTrip && elements.returnField) {
        elements.typeOneWay.addEventListener('change', () => {
            elements.returnField.style.display = 'none';
            elements.returnInput.required = false;
        });
        elements.typeRoundTrip.addEventListener('change', () => {
            elements.returnField.style.display = 'block';
            elements.returnInput.required = true;
        });
    }

    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const origin = elements.originInput.value;
            const destination = elements.destinationInput.value;
            const departure = elements.departureInput.value;
            const returnDate = elements.returnInput.value;
            const passengers = elements.passengersSelect.value;

            const url = generateTravelpayoutsUrl(origin, destination, departure, returnDate, passengers);
            window.open(url, '_blank');
        });
    }

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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateFavoriteBadge();
    initEventListeners();
    renderTrips();
});
