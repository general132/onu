// api.js - Cliente API para ONU Legends

// Configuração dinâmica da URL da API
function getApiBaseUrl() {
    // Se estiver no Render, usa a URL do domínio
    if (window.location.hostname.includes('onrender.com')) {
        // Pega a URL base atual e adiciona /api
        return window.location.origin + '/api';
    }
    // Para desenvolvimento local
    return 'http://localhost:3000/api';
}

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API URL configurada:', API_BASE_URL);

// Cache para melhor performance
let newsCache = null;
let interviewsCache = null;
let lastFetch = { news: 0, interviews: 0 };
const CACHE_DURATION = 30000; // 30 segundos

// Funções para comunicação com a API
async function fetchNews(forceRefresh = false) {
    const now = Date.now();
    
    // Usar cache se disponível e não expirado
    if (!forceRefresh && newsCache && (now - lastFetch.news < CACHE_DURATION)) {
        console.log('📦 Usando cache de notícias');
        return newsCache;
    }
    
    try {
        console.log('📡 Buscando notícias da API:', `${API_BASE_URL}/news`);
        const response = await fetch(`${API_BASE_URL}/news`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        newsCache = await response.json();
        lastFetch.news = now;
        console.log('✅ Notícias carregadas da API:', newsCache.length);
        return newsCache;
    } catch (error) {
        console.error('❌ Erro ao buscar notícias da API:', error.message);
        
        // Fallback para localStorage
        const localNews = loadLocalNews();
        if (localNews.length > 0) {
            console.log('💾 Usando notícias do localStorage:', localNews.length);
            return localNews;
        }
        
        return [];
    }
}

async function fetchInterviews(forceRefresh = false) {
    const now = Date.now();
    
    // Usar cache se disponível e não expirado
    if (!forceRefresh && interviewsCache && (now - lastFetch.interviews < CACHE_DURATION)) {
        console.log('📦 Usando cache de entrevistas');
        return interviewsCache;
    }
    
    try {
        console.log('📡 Buscando entrevistas da API:', `${API_BASE_URL}/interviews`);
        const response = await fetch(`${API_BASE_URL}/interviews`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        interviewsCache = await response.json();
        lastFetch.interviews = now;
        console.log('✅ Entrevistas carregadas da API:', interviewsCache.length);
        return interviewsCache;
    } catch (error) {
        console.error('❌ Erro ao buscar entrevistas da API:', error.message);
        
        // Fallback para localStorage
        const localInterviews = loadLocalInterviews();
        if (localInterviews.length > 0) {
            console.log('💾 Usando entrevistas do localStorage:', localInterviews.length);
            return localInterviews;
        }
        
        return [];
    }
}

async function publishNews(newsData, imageFile = null) {
    try {
        const formData = new FormData();
        formData.append('title', newsData.title);
        formData.append('committee', newsData.committee);
        formData.append('excerpt', newsData.excerpt);
        formData.append('content', newsData.content);
        formData.append('journalName', newsData.journalName);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        console.log('📤 Publicando notícia na API:', `${API_BASE_URL}/news`);
        const response = await fetch(`${API_BASE_URL}/news`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Notícia publicada com sucesso:', result);
        
        // Limpar cache para forçar recarga
        newsCache = null;
        lastFetch.news = 0;
        
        // Também salva localmente como fallback
        if (result.news) {
            saveNewsLocally(result.news);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Erro ao publicar notícia:', error.message);
        
        // Fallback: salva localmente
        const localNews = {
            ...newsData,
            id: `local-news-${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }),
            image: imageFile ? URL.createObjectURL(imageFile) : getDefaultImage(newsData.committee),
            isUserPublished: true,
            createdAt: new Date().toISOString(),
            isLocal: true
        };
        
        saveNewsLocally(localNews);
        
        return { 
            success: true, 
            message: 'Notícia salva localmente (modo offline)',
            news: localNews 
        };
    }
}

async function publishInterview(interviewData, videoFile = null) {
    try {
        const formData = new FormData();
        formData.append('title', interviewData.title);
        formData.append('committee', interviewData.committee);
        formData.append('description', interviewData.description);
        formData.append('youtubeLink', interviewData.youtubeLink || '');
        formData.append('journalName', interviewData.journalName);
        
        if (videoFile) {
            formData.append('video', videoFile);
        }
        
        console.log('📤 Publicando entrevista na API:', `${API_BASE_URL}/interviews`);
        const response = await fetch(`${API_BASE_URL}/interviews`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Entrevista publicada com sucesso:', result);
        
        // Limpar cache para forçar recarga
        interviewsCache = null;
        lastFetch.interviews = 0;
        
        // Também salva localmente como fallback
        if (result.interview) {
            saveInterviewLocally(result.interview);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Erro ao publicar entrevista:', error.message);
        
        // Fallback: salva localmente
        const localInterview = {
            ...interviewData,
            id: `local-interview-${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }),
            videoData: {
                type: 'youtube',
                id: 'dQw4w9WgXcQ' // ID padrão
            },
            isUserPublished: true,
            createdAt: new Date().toISOString(),
            isLocal: true
        };
        
        saveInterviewLocally(localInterview);
        
        return { 
            success: true, 
            message: 'Entrevista salva localmente (modo offline)',
            interview: localInterview 
        };
    }
}

async function login(email, password, journal) {
    try {
        console.log('🔑 Tentando login na API:', `${API_BASE_URL}/login`);
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, journal })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Login realizado com sucesso');
        return result;
    } catch (error) {
        console.error('❌ Erro no login via API:', error.message);
        return { 
            success: false, 
            error: 'Erro de conexão com o servidor',
            fallback: true 
        };
    }
}

async function deleteNews(newsId) {
    try {
        console.log('🗑️ Excluindo notícia:', `${API_BASE_URL}/news/${newsId}`);
        const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Limpar cache
        newsCache = null;
        lastFetch.news = 0;
        
        // Remover localmente também
        removeNewsLocally(newsId);
        
        const result = await response.json();
        console.log('✅ Notícia excluída com sucesso');
        return result;
    } catch (error) {
        console.error('❌ Erro ao excluir notícia:', error.message);
        
        // Fallback: remove localmente
        removeNewsLocally(newsId);
        
        return { 
            success: true, 
            message: 'Notícia removida localmente (modo offline)'
        };
    }
}

async function deleteInterview(interviewId) {
    try {
        console.log('🗑️ Excluindo entrevista:', `${API_BASE_URL}/interviews/${interviewId}`);
        const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Limpar cache
        interviewsCache = null;
        lastFetch.interviews = 0;
        
        // Remover localmente também
        removeInterviewLocally(interviewId);
        
        const result = await response.json();
        console.log('✅ Entrevista excluída com sucesso');
        return result;
    } catch (error) {
        console.error('❌ Erro ao excluir entrevista:', error.message);
        
        // Fallback: remove localmente
        removeInterviewLocally(interviewId);
        
        return { 
            success: true, 
            message: 'Entrevista removida localmente (modo offline)'
        };
    }
}

// Funções auxiliares para localStorage
function loadLocalNews() {
    try {
        const news = localStorage.getItem('onuLegendsNews');
        return news ? JSON.parse(news) : [];
    } catch (error) {
        console.error('❌ Erro ao ler notícias do localStorage:', error);
        return [];
    }
}

function loadLocalInterviews() {
    try {
        const interviews = localStorage.getItem('onuLegendsInterviews');
        return interviews ? JSON.parse(interviews) : [];
    } catch (error) {
        console.error('❌ Erro ao ler entrevistas do localStorage:', error);
        return [];
    }
}

function saveNewsLocally(news) {
    try {
        const existingNews = loadLocalNews();
        existingNews.push(news);
        localStorage.setItem('onuLegendsNews', JSON.stringify(existingNews));
        console.log('💾 Notícia salva localmente');
    } catch (error) {
        console.error('❌ Erro ao salvar notícia no localStorage:', error);
    }
}

function saveInterviewLocally(interview) {
    try {
        const existingInterviews = loadLocalInterviews();
        existingInterviews.push(interview);
        localStorage.setItem('onuLegendsInterviews', JSON.stringify(existingInterviews));
        console.log('💾 Entrevista salva localmente');
    } catch (error) {
        console.error('❌ Erro ao salvar entrevista no localStorage:', error);
    }
}

function removeNewsLocally(newsId) {
    try {
        const existingNews = loadLocalNews();
        const updatedNews = existingNews.filter(news => news.id !== newsId);
        localStorage.setItem('onuLegendsNews', JSON.stringify(updatedNews));
        console.log('🗑️ Notícia removida localmente');
    } catch (error) {
        console.error('❌ Erro ao remover notícia do localStorage:', error);
    }
}

function removeInterviewLocally(interviewId) {
    try {
        const existingInterviews = loadLocalInterviews();
        const updatedInterviews = existingInterviews.filter(interview => interview.id !== interviewId);
        localStorage.setItem('onuLegendsInterviews', JSON.stringify(updatedInterviews));
        console.log('🗑️ Entrevista removida localmente');
    } catch (error) {
        console.error('❌ Erro ao remover entrevista do localStorage:', error);
    }
}

function getDefaultImage(committee) {
    const imageMap = {
        'Inteligência Artificial': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'Deslocamentos Climáticos': 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'Conselho de Segurança': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    };
    return imageMap[committee] || 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
}

// Verificar status da API
async function checkApiStatus() {
    try {
        console.log('🔍 Verificando status da API:', `${API_BASE_URL}/status`);
        const response = await fetch(`${API_BASE_URL}/status`);
        return response.ok;
    } catch (error) {
        console.log('⚠️ API offline, usando modo local');
        return false;
    }
}

// Exportar funções
window.ONUApi = {
    fetchNews,
    fetchInterviews,
    publishNews,
    publishInterview,
    login,
    deleteNews,
    deleteInterview,
    checkApiStatus,
    loadLocalNews,
    loadLocalInterviews
};

// Adicionar função de debug para testar conexão
window.testApiConnection = async function() {
    console.log('🔍 Testando conexão com a API...');
    console.log('📡 URL da API:', API_BASE_URL);
    
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexão bem-sucedida:', data);
            return true;
        } else {
            console.error('❌ API respondeu com erro:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro de conexão:', error.message);
        return false;
    }
};

// Testar conexão automaticamente ao carregar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 ONU Legends API Client iniciado');
    console.log('🌐 Domínio atual:', window.location.hostname);
    console.log('🔗 URL completa:', window.location.href);
    
    // Testar conexão (opcional)
    // await testApiConnection();
});