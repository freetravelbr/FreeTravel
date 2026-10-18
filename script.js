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

const ASSIST365_CONFIG = {
    affiliateUrl: "https://assist-365.com/ar/?utm_medium=affiliate&utm_source=web&voucher=FREETRAVELBR"
};

// Helpers Utilitários
function goToAssist365() {
    window.open(ASSIST365_CONFIG.affiliateUrl, '_blank');
}

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
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}${parts[1]}`;
    }
    return '';
}

function showToast(message) {
    let toast = document.getElementById('ftToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ftToast';
        toast.className = 'ft-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3200);
}

// ==========================================
// GERADORES DE URL AFILIADA
// ==========================================
function generateTravelpayoutsUrl(origin, destination, departureDate, returnDate, passengers = 1) {
    const typeOneWay = document.getElementById('typeOneWay');
    const isOneWay = typeOneWay && typeOneWay.checked;

    const originIata = extractIataCode(origin) || 'GRU';
    const destinationIata = extractIataCode(destination) || 'GIG';

    const depDate = departureDate || getFutureDateString(30);
    const formattedDep = formatDateForUrl(depDate);

    let formattedRet = '';
    if (!isOneWay) {
        const retDate = returnDate || getFutureDateString(37);
        formattedRet = formatDateForUrl(retDate);
    }

    const routePath = `${originIata}${formattedDep}${destinationIata}${formattedRet}${passengers}`;
    return `https://www.aviasales.com/search/${routePath}?marker=${state.travelPayoutsMarker}&currency=BRL`;
}

function generateHotellookUrl(destinationInput, checkInDate, checkOutDate, guests = 2) {
    const cleanDestination = destinationInput ? destinationInput.replace(/\s*\([A-Z]{3}\)/i, '').trim() : 'São Paulo';
    const expediaCamref = '1101l6tMJb';

    const checkIn = checkInDate || getFutureDateString(30);
    const checkOut = checkOutDate || getFutureDateString(35);

    return `https://hoteis.com/Hotel-Search?destination=${encodeURIComponent(cleanDestination)}&startDate=${checkIn}&endDate=${checkOut}&rooms=1&adults=${guests}&camref=${expediaCamref}`;
}

// ==========================================
// RENDERIZAÇÃO DE COMPONENTES
// ==========================================
function renderFeaturedDestination() {
    const featuredContainer = document.getElementById('featuredDestinationContainer');
    if (!featuredContainer) return;

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

    featuredContainer.innerHTML = `
      <section style="position: relative; border-radius: 20px; overflow: hidden; background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 100%), url('${featuredData.image}') center/cover no-repeat; color: #ffffff; padding: 60px 40px; min-height: 380px; display: flex; align-items: center; box-shadow: 0 14px 40px rgba(0,0,0,0.12); margin: 40px 0;">
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
    const tripGrid = document.getElementById('tripGrid');
    const resultCount = document.getElementById('resultCount');
    if (!tripGrid) return;

    state.filteredTrips = state.allTrips.filter(trip => {
        const matchesCategory = state.activeFilter === 'Todos' || trip.category === state.activeFilter;
        const matchesBudget = trip.price <= state.maxBudget;
        const matchesFavorites = state.showOnlyFavorites ? state.favorites.includes(trip.id) : true;
        return matchesCategory && matchesBudget && matchesFavorites;
    });

    if (resultCount) {
        resultCount.textContent = `${state.filteredTrips.length} oferta(s) encontrada(s)`;
    }

    if (state.filteredTrips.length === 0) {
        tripGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">Nenhuma oferta encontrada.</p>
                <small>Tente alterar os filtros de categoria ou ajuste o orçamento.</small>
            </div>`;
        return;
    }

    tripGrid.innerHTML = state.filteredTrips.map(trip => {
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

// Renderizar Posts do Blog
function renderBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid || typeof blogPosts === 'undefined') return;

    blogGrid.innerHTML = blogPosts.map(post => `
        <article style="background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 180px; object-fit: cover;">
                <div style="padding: 20px;">
                    <small style="color: #888; font-size: 0.8rem;">${post.date} • ${post.author}</small>
                    <h3 style="font-size: 1.15rem; margin: 8px 0; color: #111;">${post.title}</h3>
                    <p style="color: #666; font-size: 0.9rem; line-height: 1.4;">${post.snippet}</p>
                </div>
            </div>
            <div style="padding: 0 20px 20px 20px;">
                <button onclick="openPostModal('${post.id}')" style="background: #f5c400; color: #111; border: none; padding: 10px 16px; font-weight: 700; border-radius: 6px; cursor: pointer; width: 100%;">Ler Artigo Completo</button>
            </div>
        </article>
    `).join('');
}

window.openPostModal = function(postId) {
    const postModal = document.getElementById('postModal');
    const postContent = document.getElementById('postContent');
    const post = blogPosts.find(p => p.id === postId);
    if (!post || !postModal || !postContent) return;

    postContent.innerHTML = `
        <h2 style="font-size: 1.8rem; color: #111; margin-bottom: 10px;">${post.title}</h2>
        <p style="color: #888; font-size: 0.85rem; margin-bottom: 20px;">Publicado em ${post.date} por ${post.author}</p>
        <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 350px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
        <div style="color: #333; line-height: 1.6; font-size: 1rem;">${post.content}</div>
    `;

    postModal.style.display = 'block';
    document.body.classList.add('modal-open');
};

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
    const favoriteCountBadge = document.querySelector('[data-favorite-count]');
    if (favoriteCountBadge) {
        const count = state.favorites.length;
        favoriteCountBadge.textContent = count;
        favoriteCountBadge.hidden = count === 0;
    }
}

// ==========================================
// INICIALIZAÇÃO E EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mainNav = document.getElementById('mainNav');
    const searchTabs = document.querySelectorAll('.search-tab');
    const typeOneWay = document.getElementById('typeOneWay');
    const typeRoundTrip = document.getElementById('typeRoundTrip');
    const returnField = document.getElementById('returnField');
    const returnInput = document.getElementById('return');
    const originField = document.getElementById('originField');
    const destinationInput = document.getElementById('destination');
    const departureInput = document.getElementById('departure');
    const passengersSelect = document.getElementById('passengers');
    const originInput = document.getElementById('origin');
    const tripTypeContainer = document.querySelector('.trip-type-container');
    const searchForm = document.getElementById('searchForm');
    const showAllBtn = document.querySelector('[data-action="show-all"]');
    const favoritesButton = document.querySelector('[data-action="show-favorites"]');
    const closePostBtn = document.getElementById('closePostBtn');
    const postModal = document.getElementById('postModal');

    const departureLabel = departureInput ? departureInput.closest('.search-field')?.querySelector('label') : null;
    const returnLabel = returnInput ? returnInput.closest('.search-field')?.querySelector('label') : null;
    const passengersLabel = passengersSelect ? passengersSelect.closest('.search-field')?.querySelector('label') : null;

    // Menu Mobile
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Controle de Abas (Voos vs Hotéis)
    if (searchTabs) {
        searchTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                searchTabs.forEach(t => t.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                state.activeTab = target.getAttribute('data-tab');

                if (state.activeTab === 'hotels') {
                    if (originField) originField.style.display = 'none';
                    if (tripTypeContainer) tripTypeContainer.style.display = 'none';

                    if (destinationInput) destinationInput.placeholder = "Cidade ou Hotel (Ex: Rio de Janeiro)";
                    if (departureLabel) departureLabel.textContent = "Check-in";
                    if (returnLabel) returnLabel.textContent = "Check-out";
                    if (passengersLabel) passengersLabel.textContent = "Hóspedes";

                    if (returnField) returnField.classList.remove('disabled-input');
                    if (returnInput) returnInput.required = true;
                } else {
                    if (originField) originField.style.display = 'block';
                    if (tripTypeContainer) tripTypeContainer.style.display = 'flex';

                    if (destinationInput) destinationInput.placeholder = "Cidade ou Aeroporto (Ex: GIG, EZE, MIA)";
                    if (departureLabel) departureLabel.textContent = "Ida";
                    if (returnLabel) returnLabel.textContent = "Volta";
                    if (passengersLabel) passengersLabel.textContent = "Passageiros";

                    if (typeOneWay && typeOneWay.checked && returnField) {
                        returnField.classList.add('disabled-input');
                        if (returnInput) returnInput.required = false;
                    }
                }
            });
        });
    }

    // Tipo de Viagem (Ida e Volta / Somente Ida)
    if (typeOneWay && typeRoundTrip && returnField) {
        typeOneWay.addEventListener('change', () => {
            if (state.activeTab === 'flights') {
                returnField.classList.add('disabled-input');
                if (returnInput) returnInput.required = false;
            }
        });

        typeRoundTrip.addEventListener('change', () => {
            if (state.activeTab === 'flights') {
                returnField.classList.remove('disabled-input');
                if (returnInput) returnInput.required = true;
            }
        });
    }

    // Eventos nos Cards de Destinos
    document.querySelectorAll('[data-destination]').forEach(card => {
        card.addEventListener('click', (e) => {
            const destinationName = e.currentTarget.getAttribute('data-destination');
            const destIata = iataMap[destinationName] || 'GIG';
            const redirectUrl = generateTravelpayoutsUrl('GRU', destIata, '', '');
            window.open(redirectUrl, '_blank');
        });
    });

    // Botão "Ver todas"
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            state.activeFilter = 'Todos';
            state.showOnlyFavorites = false;
            document.querySelectorAll('[data-trip-type]').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-trip-type') === 'Todos');
            });
            renderTrips();
        });
    }

    // Botão Favoritos
    if (favoritesButton) {
        favoritesButton.addEventListener('click', () => {
            if (state.favorites.length === 0 && !state.showOnlyFavorites) {
                showToast("Você ainda não salvou nenhuma oferta nos favoritos!");
                return;
            }
            state.showOnlyFavorites = !state.showOnlyFavorites;
            renderTrips();
        });
    }

    // Filtros de Categoria
    document.querySelectorAll('[data-trip-type]').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('[data-trip-type]').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            state.activeFilter = e.target.getAttribute('data-trip-type');
            renderTrips();
        });
    });

    // Submissão do Formulário de Busca (CORRIGIDA)
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const destVal = destinationInput ? destinationInput.value : '';
            const depVal = departureInput ? departureInput.value : '';
            const retVal = returnInput ? returnInput.value : '';
            const passVal = passengersSelect ? passengersSelect.value : 1;
            const origVal = originInput ? originInput.value : '';

            if (!destVal.trim()) {
                showToast("Por favor, informe o destino.");
                return;
            }

            let redirectUrl = '';
            if (state.activeTab === 'hotels') {
                redirectUrl = generateHotellookUrl(destVal, depVal, retVal, passVal);
            } else {
                redirectUrl = generateTravelpayoutsUrl(origVal, destVal, depVal, retVal, passVal);
            }

            window.open(redirectUrl, '_blank');
        });
    }

    // Modal do Blog - Fechar
    if (closePostBtn && postModal) {
        closePostBtn.addEventListener('click', () => {
            postModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('click', (e) => {
            if (e.target === postModal) {
                postModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Inicialização
    updateFavoriteBadge();
    renderFeaturedDestination();
    renderTrips();
    renderBlogPosts();
});
