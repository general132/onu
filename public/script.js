// Dados dos participantes
const participantsData = [
    {
        id: 1,
        name: "Luísa Lima",
        role: "Secretária-Geral",
        room: "SECRETARIADO-GERAL",
        avatar: "luisa.png"
    },
    {
        id: 2,
        name: "Allan Victor",
        role: "Vice-Secretário Geral",
        room: "SECRETARIADO-GERAL",
        avatar: "allan.png"
    },
    {
        id: 3,
        name: "Maria Eduarda",
        role: "Chair",
        room: "Conselho de Segurança",
        avatar: "vieira.png"
    },
    {
        id: 4,
        name: "Maria Elisa Laveli",
        role: "Vice-Chair",
        room: "Conselho de Segurança",
        avatar: "elisa.png"
    },
    {
        id: 5,
        name: "Heloisa Violante",
        role: "Rapporteur",
        room: "Conselho de Segurança",
        avatar: "heloisa.png"
    },
    {
        id: 9,
        name: "Matheus Bezerra",
        role: "Presidente",
        room: "C1 - Inteligência Artificial",
        avatar: "matheus.png"
    },
    {
        id: 10,
        name: "Antony Haro",
        role: "Vice-Presidente",
        room: "C1 - Inteligência Artificial",
        avatar: "antony.png"
    },
    {
        id: 11,
        name: "Cassio Bomfim",
        role: "Redator",
        room: "C1 - Inteligência Artificial",
        avatar: "cassio.png"
    },
    {
        id: 6,
        name: "Olívia Freitas",
        role: "Presidente",
        room: "C2 - Deslocamentos Climáticos",
        avatar: "olivia.png"
    },
    {
        id: 7,
        name: "Bryan Rodrigues",
        role: "Vice-Presidente",
        room: "C2 - Deslocamentos Climáticos",
        avatar: "bryan.png"
    },
    {
        id: 8,
        name: "Nicolas Porto",
        role: "Redator",
        room: "C2 - Deslocamentos Climáticos",
        avatar: "nicolas.png"
    },
];

// URL base da API do servidor
const API_URL = window.location.origin + '/api';

// Função para buscar notícias da API
async function fetchNewsFromAPI() {
    try {
        console.log(`Buscando notícias de: ${API_URL}/news`);
        const response = await fetch(`${API_URL}/news`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const news = await response.json();
        console.log(`Notícias recebidas da API: ${news.length}`);
        return news;
    } catch (error) {
        console.error('Erro ao buscar notícias da API:', error);
        return [];
    }
}

// Função para buscar entrevistas da API
async function fetchInterviewsFromAPI() {
    try {
        console.log(`Buscando entrevistas de: ${API_URL}/interviews`);
        const response = await fetch(`${API_URL}/interviews`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const interviews = await response.json();
        console.log(`Entrevistas recebidas da API: ${interviews.length}`);
        return interviews;
    } catch (error) {
        console.error('Erro ao buscar entrevistas da API:', error);
        return [];
    }
}

// Função para verificar status da API
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Função para obter imagem padrão
function getDefaultImage(committee) {
    const imageMap = {
        'Inteligência Artificial': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'Deslocamentos Climáticos': 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'Conselho de Segurança': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    };
    return imageMap[committee] || 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
}

// Função para carregar notícias na página
async function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;
    
    // Mostrar loader
    newsGrid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Carregando notícias...</div>';
    
    try {
        // Buscar notícias da API
        const allNews = await fetchNewsFromAPI();
        
        if (allNews.length === 0) {
            newsGrid.innerHTML = `
                <div class="no-content">
                    <i class="fas fa-newspaper"></i>
                    <p>Nenhuma notícia publicada ainda.</p>
                    <small>Seja o primeiro a publicar uma notícia!</small>
                </div>
            `;
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        allNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        newsGrid.innerHTML = '';
        
        allNews.forEach((news, index) => {
            const newsCard = document.createElement('article');
            newsCard.className = `news-card ${index === 0 ? 'featured' : ''}`;
            newsCard.setAttribute('data-committee', news.committee);
            
            const newsId = news.id || `news-${index}`;
            const imageSrc = news.image || getDefaultImage(news.committee);
            
            newsCard.innerHTML = `
                <div class="news-image">
                    <img src="${imageSrc}" alt="${news.title}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'">
                </div>
                <div class="news-content">
                    <span class="news-category">${news.committee}</span>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-meta">
                        <span class="news-date">${news.date}</span>
                        <span class="news-journal">${news.journalName || news.journal || 'ONU Legends'}</span>
                        <a href="#" class="news-read-more" data-news-id="${news.id}">Ler mais →</a>
                    </div>
                </div>
            `;
            
            newsGrid.appendChild(newsCard);
        });
        
        // Adicionar eventos aos botões "Ler mais"
        setupReadMoreButtons();
        
        // Adicionar funcionalidade aos filtros de notícias
        setupNewsFilters();
        
        console.log(`✅ ${allNews.length} notícias carregadas com sucesso`);
        
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        newsGrid.innerHTML = `
            <div class="no-content error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar notícias</p>
                <small>Verifique sua conexão com a internet</small>
            </div>
        `;
    }
}

// Função para configurar botões "Ler mais"
function setupReadMoreButtons() {
    document.querySelectorAll('.news-read-more').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const newsId = this.getAttribute('data-news-id');
            await openNewsModal(newsId);
        });
    });
}

// Função para configurar filtros de notícias
function setupNewsFilters() {
    const newsFilterButtons = document.querySelectorAll('.news-filter .filter-btn');
    newsFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            newsFilterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterNews(filter);
        });
    });
}

// Função para filtrar notícias
function filterNews(filter) {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-committee') === filter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Função para abrir modal de entrevista
function openInterviewModal(interview) {
    // Determinar o conteúdo do vídeo
    let videoContent = '';
    
    if (interview.videoData && interview.videoData.type === 'youtube' && interview.videoData.id) {
        videoContent = `
            <iframe src="https://www.youtube.com/embed/${interview.videoData.id}" 
                    title="${interview.title}" 
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        `;
    } else if (interview.videoData && interview.videoData.type === 'local' && interview.videoData.url) {
        videoContent = `
            <video controls style="width:100%;max-height:400px;">
                <source src="${interview.videoData.url}" type="video/mp4">
                Seu navegador não suporta o vídeo.
            </video>
        `;
    } else {
        videoContent = `
            <div style="height:200px;background:#000;display:flex;align-items:center;justify-content:center;color:#777;border-radius:8px;">
                <p style="color:white;">Vídeo não disponível</p>
            </div>
        `;
    }

    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'interview-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <span class="modal-category">${interview.committee}</span>
                <h2 class="modal-title">${interview.title}</h2>
                <div class="modal-meta">
                    <span class="modal-date">${interview.date}</span>
                    <span class="modal-journal">Publicado por: <strong>${interview.journal || interview.journalName || 'ONU Legends'}</strong></span>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-video">
                    ${videoContent}
                </div>
                <div class="modal-transcription">
                    <h3><i class="fas fa-file-alt"></i> Transcrição</h3>
                    <div class="transcription-content">
                        ${interview.transcription || interview.description || 'Transcrição não disponível.'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn" onclick="closeInterviewModal()">Fechar</button>
                <button class="modal-btn share-btn" onclick="shareInterview('${interview.title.replace(/'/g, "\\'")}', '${(interview.journal || interview.journalName || 'ONU Legends').replace(/'/g, "\\'")}')">
                    <i class="fas fa-share-alt"></i> Compartilhar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar eventos
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeInterviewModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeInterviewModal();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeInterviewModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    // Mostrar modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Impedir scroll
    document.body.style.overflow = 'hidden';
}

// Função para fechar modal de entrevista
function closeInterviewModal() {
    const modal = document.querySelector('.interview-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Parar vídeos ao fechar
    const videos = document.querySelectorAll('video, iframe');
    videos.forEach(video => {
        if (video.tagName === 'VIDEO') {
            video.pause();
        } else if (video.tagName === 'IFRAME') {
            const src = video.src;
            video.src = ''; // Reset para parar vídeo do YouTube
            video.src = src; // Restaurar src
        }
    });
    
    document.body.style.overflow = '';
}

// Função para compartilhar entrevista
function shareInterview(title, journal) {
    const shareText = `${title} - Entrevista publicada por ${journal} na ONU Legends`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: window.location.href
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText} - ${window.location.href}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copiado para a área de transferência!');
    }
}

// Função para carregar entrevistas
async function loadInterviews() {
    const interviewGrid = document.getElementById('interview-grid');
    if (!interviewGrid) return;
    
    // Mostrar loader
    interviewGrid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Carregando entrevistas...</div>';
    
    try {
        // Buscar entrevistas da API
        const allInterviews = await fetchInterviewsFromAPI();
        
        if (allInterviews.length === 0) {
            interviewGrid.innerHTML = `
                <div class="no-content">
                    <i class="fas fa-video"></i>
                    <p>Nenhuma entrevista publicada ainda.</p>
                    <small>Seja o primeiro a publicar uma entrevista!</small>
                </div>
            `;
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        allInterviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        interviewGrid.innerHTML = '';
        
        allInterviews.forEach(interview => {
            const interviewCard = document.createElement('div');
            interviewCard.className = 'interview-card';
            interviewCard.setAttribute('data-committee', interview.committee);
            
            // Determinar o tipo de vídeo para preview
            let videoPreview = '';
            
            if (interview.videoData && interview.videoData.type === 'youtube' && interview.videoData.id) {
                videoPreview = `
                    <img src="https://img.youtube.com/vi/${interview.videoData.id}/hqdefault.jpg" 
                         alt="${interview.title}"
                         style="width:100%;height:200px;object-fit:cover;">
                `;
            } else if (interview.videoData && interview.videoData.type === 'local' && interview.videoData.url) {
                // CARREGAR O VÍDEO DIRETAMENTE, SEM IMAGEM AZUL
                videoPreview = `
                    <video style="width:100%;height:200px;object-fit:cover;" preload="metadata" muted>
                        <source src="${interview.videoData.url}" type="video/mp4">
                    </video>
                `;
            } else {
                // Se não tem vídeo, criar uma thumbnail baseada no comitê
                let gradient = 'linear-gradient(135deg, #0065b3, #0099cc)';
                let icon = 'fa-microphone-alt';
                
                if (interview.committee.includes('Inteligência Artificial')) {
                    gradient = 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
                    icon = 'fa-robot';
                } else if (interview.committee.includes('Deslocamentos Climáticos')) {
                    gradient = 'linear-gradient(135deg, #4CAF50, #8BC34A)';
                    icon = 'fa-cloud-sun';
                } else if (interview.committee.includes('Conselho de Segurança')) {
                    gradient = 'linear-gradient(135deg, #9C27B0, #673AB7)';
                    icon = 'fa-shield-alt';
                }
                
                videoPreview = `
                    <div style="height:200px;background:${gradient};display:flex;align-items:center;justify-content:center;color:white;">
                        <i class="fas ${icon}" style="font-size:3rem;"></i>
                    </div>
                `;
            }
            
            interviewCard.innerHTML = `
                <div class="interview-video">
                    ${videoPreview}
                    <div class="play-overlay">
                        <i class="fas fa-play play-icon"></i>
                    </div>
                </div>
                <div class="interview-info">
                    <span class="interview-journal">${interview.journal || interview.journalName || 'ONU Legends'}</span>
                    <h3 class="interview-title">${interview.title}</h3>
                    <div class="interview-meta">
                        <span class="interview-date">${interview.date}</span>
                        <span class="interview-committee">${interview.committee}</span>
                    </div>
                </div>
            `;
            
            // ADICIONAR EVENTO DE CLIQUE PARA ABRIR MODAL
            interviewCard.addEventListener('click', () => {
                openInterviewModal(interview);
            });
            
            interviewGrid.appendChild(interviewCard);
        });
        
        // Adicionar funcionalidade aos filtros de entrevistas
        setupInterviewFilters();
        
        console.log(`✅ ${allInterviews.length} entrevistas carregadas com sucesso`);
        
    } catch (error) {
        console.error('Erro ao carregar entrevistas:', error);
        interviewGrid.innerHTML = `
            <div class="no-content error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar entrevistas</p>
                <small>Verifique sua conexão com a internet</small>
            </div>
        `;
    }
}

// Função para configurar filtros de entrevistas
function setupInterviewFilters() {
    const interviewFilterButtons = document.querySelectorAll('.interview-filter .filter-btn');
    interviewFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            interviewFilterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterInterviews(filter);
        });
    });
}

// Função para filtrar entrevistas
function filterInterviews(filter) {
    const interviewCards = document.querySelectorAll('.interview-card');
    
    interviewCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-committee') === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Função para carregar participantes
function loadParticipants() {
    const participantsGrid = document.getElementById('participants-grid');
    if (!participantsGrid) return;
    
    participantsGrid.innerHTML = '';
    
    participantsData.forEach(participant => {
        const participantCard = document.createElement('div');
        participantCard.className = 'participant-card';
        
        participantCard.innerHTML = `
            <div class="participant-avatar">
                <img src="${participant.avatar}" alt="${participant.name}" onerror="this.src='https://via.placeholder.com/100/0065b3/ffffff?text=${participant.name.charAt(0)}'">
            </div>
            <h3 class="participant-name">${participant.name}</h3>
            <p class="participant-role">${participant.role}</p>
            <p class="participant-room">${participant.room}</p>
        `;
        
        participantsGrid.appendChild(participantCard);
    });
}

// Função para abrir modal de notícia
async function openNewsModal(newsId) {
    try {
        // Buscar todas as notícias primeiro
        const allNews = await fetchNewsFromAPI();
        
        let news;
        if (newsId && allNews.length > 0) {
            news = allNews.find(n => n.id === newsId);
        }
        
        if (!news && allNews.length > 0) {
            news = allNews[0];
        }
        
        if (!news) {
            alert('Notícia não encontrada');
            return;
        }
        
        // Obter o nome do jornal correto
        let journalName = news.journal || news.journalName || 'ONU Legends';
        
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close"><i class="fas fa-times"></i></button>
                <div class="modal-header">
                    <span class="modal-category">${news.committee}</span>
                    <h2 class="modal-title">${news.title}</h2>
                    <div class="modal-meta">
                        <span class="modal-date">${news.date}</span>
                        <span class="modal-author">Publicado por: <strong>${journalName}</strong></span>
                    </div>
                </div>
                <div class="modal-body">
                    ${news.image ? `<div class="modal-image">
                        <img src="${news.image}" alt="${news.title}">
                    </div>` : ''}
                    <div class="modal-text">
                        ${news.fullText || news.content || news.excerpt}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" onclick="closeNewsModal()">Fechar</button>
                    <button class="modal-btn share-btn" onclick="shareNews('${news.title.replace(/'/g, "\\'")}', '${journalName.replace(/'/g, "\\'")}')">
                        <i class="fas fa-share-alt"></i> Compartilhar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento para fechar modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', closeNewsModal);
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNewsModal();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeNewsModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        // Adicionar classe para animação
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Impedir scroll no body
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        alert('Erro ao carregar notícia');
    }
}

// Função para fechar modal
function closeNewsModal() {
    const modal = document.querySelector('.news-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

// Função para compartilhar notícia
function shareNews(title, journal) {
    const shareText = `${title} - Publicado por ${journal} na ONU Legends`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: window.location.href
        });
    } else {
        // Copiar para área de transferência como fallback
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText} - ${window.location.href}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Feedback visual
        alert('Link copiado para a área de transferência!');
    }
}

// Função para menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// Função para navegação suave
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#inicio') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                e.preventDefault();
            } else if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    e.preventDefault();
                }
            }
        });
    });
}

// Função para destacar link ativo na navegação
function setupActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar status da API
    const apiConnected = await checkApiStatus();
    showApiStatus(apiConnected);
    
    // Carregar conteúdo
    await loadNews();
    await loadInterviews();
    loadParticipants();
    
    // Configurar interações
    setupMobileMenu();
    setupSmoothScrolling();
    setupActiveNavLink();
    
    // Atualizar ano no rodapé
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('#current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
    
    console.log('ONU Legends carregado com sucesso!');
});

// Mostrar status da API
function showApiStatus(connected) {
    const statusElement = document.getElementById('api-status');
    if (!statusElement) {
        // Criar elemento se não existir
        const statusDiv = document.createElement('div');
        statusDiv.id = 'api-status';
        statusDiv.className = 'api-status';
        document.body.appendChild(statusDiv);
    }
    
    const element = document.getElementById('api-status');
    if (connected) {
        element.innerHTML = '<i class="fas fa-wifi"></i> Online';
        element.className = 'api-status online';
    } else {
        element.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Offline';
        element.className = 'api-status offline';
    }
}

// Adicionar CSS para status da API e modais
const apiStatusCSS = `
.api-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    animation: fadeIn 0.3s ease;
}

.api-status.online {
    background-color: #4CAF50;
    color: white;
}

.api-status.offline {
    background-color: #ff9800;
    color: white;
}

.loader {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
    grid-column: 1 / -1;
}

.loader i {
    margin-right: 10px;
    font-size: 1.5rem;
}

.no-content {
    text-align: center;
    padding: 60px 20px;
    color: #999;
    grid-column: 1 / -1;
}

.no-content i {
    font-size: 3rem;
    margin-bottom: 20px;
    color: #ddd;
}

.no-content p {
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.no-content small {
    font-size: 0.9rem;
}

.no-content.error i {
    color: #ff9800;
}

/* Modal de Entrevista */
.interview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
}

.interview-modal.show {
    opacity: 1;
    visibility: visible;
}

.interview-modal .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.interview-modal .modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.interview-modal .modal-close:hover {
    background: rgba(0, 0, 0, 0.8);
}

.interview-modal .modal-header {
    padding: 30px 30px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.interview-modal .modal-category {
    background: #0065b3;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 10px;
}

.interview-modal .modal-title {
    margin: 10px 0;
    color: #333;
    font-size: 1.8rem;
}

.interview-modal .modal-meta {
    display: flex;
    gap: 20px;
    color: #666;
    font-size: 14px;
    margin-top: 10px;
}

.interview-modal .modal-body {
    padding: 20px 30px;
}

.interview-modal .modal-video {
    margin-bottom: 30px;
    border-radius: 8px;
    overflow: hidden;
}

.interview-modal .modal-video iframe,
.interview-modal .modal-video video {
    width: 100%;
    height: 400px;
    border: none;
    border-radius: 8px;
}

.interview-modal .modal-transcription h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.interview-modal .modal-transcription h3 i {
    color: #0065b3;
}

.interview-modal .transcription-content {
    line-height: 1.6;
    color: #555;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 10px;
}

.interview-modal .modal-footer {
    padding: 20px 30px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: #f8f9fa;
}

.interview-modal .modal-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.interview-modal .modal-btn:first-child {
    background: #6c757d;
    color: white;
}

.interview-modal .modal-btn:first-child:hover {
    background: #5a6268;
}

.interview-modal .share-btn {
    background: #0065b3;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
}

.interview-modal .share-btn:hover {
    background: #0056a3;
}

/* Estilo para os cards de entrevista (interativo) */
.interview-card {
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.interview-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.interview-card .interview-video {
    position: relative;
}

.interview-card .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
    background: rgba(0, 101, 179, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.interview-card:hover .play-overlay {
    opacity: 1;
}

.interview-card .play-icon {
    color: white;
    font-size: 3rem;
}

/* Modal de Notícia (se necessário) */
.news-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
}

.news-modal.show {
    opacity: 1;
    visibility: visible;
}

.news-modal .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

// Adicionar CSS dinamicamente
const style = document.createElement('style');
style.textContent = apiStatusCSS;

document.head.appendChild(style);
