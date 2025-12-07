// admin.js - Sistema de administração para jornalistas - USANDO FETCH DIRETO

// URL base da API
const API_URL = window.location.origin + '/api';

// Função para obter o jornal logado
function getCurrentJournal() {
    const data = getJournalistData();
    return {
        name: data.journalName || 'Jornal',
        id: data.journal || '',
        email: data.email || ''
    };
}

// VERIFICAÇÃO DE LOGIN NO INÍCIO
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está logado usando auth.js
    if (!checkLogin()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Exibir informações do jornalista
    displayJournalistInfo();
    
    // Configurar o restante da página admin
    setupAdminPage();
});

// Função para buscar notícias via fetch
async function fetchNewsFromAPI() {
    try {
        const response = await fetch(`${API_URL}/news`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        return [];
    }
}

// Função para buscar entrevistas via fetch
async function fetchInterviewsFromAPI() {
    try {
        const response = await fetch(`${API_URL}/interviews`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar entrevistas:', error);
        return [];
    }
}

// Função para publicar notícia via fetch
async function publishNewsViaAPI(newsData, imageFile) {
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
        
        const response = await fetch(`${API_URL}/news`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao publicar notícia:', error);
        throw error;
    }
}

// Função para publicar entrevista via fetch
async function publishInterviewViaAPI(interviewData, videoFile) {
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
        
        const response = await fetch(`${API_URL}/interviews`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao publicar entrevista:', error);
        throw error;
    }
}

// Função para deletar notícia
async function deleteNewsViaAPI(newsId) {
    try {
        const response = await fetch(`${API_URL}/news/${newsId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao excluir notícia:', error);
        throw error;
    }
}

// Função para deletar entrevista
async function deleteInterviewViaAPI(interviewId) {
    try {
        const response = await fetch(`${API_URL}/interviews/${interviewId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao excluir entrevista:', error);
        throw error;
    }
}

// Função para atualizar conteúdo publicado
async function updatePublishedContent() {
    const currentJournal = getCurrentJournal();
    
    const newsContainer = document.querySelector('.published-news');
    const interviewsContainer = document.querySelector('.published-interviews');
    
    if (newsContainer) {
        const title = newsContainer.querySelector('h3');
        const existingItems = newsContainer.querySelectorAll('.published-item');
        existingItems.forEach(item => item.remove());
        
        try {
            const allNews = await fetchNewsFromAPI();
            const journalNews = allNews.filter(item => 
                item.journalName === currentJournal.name || 
                item.journal === currentJournal.name
            );
            
            const recentNews = journalNews.slice(-5).reverse();
            
            if (recentNews.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-message';
                emptyMessage.innerHTML = `
                    <p><i class="fas fa-newspaper"></i> Você ainda não publicou nenhuma notícia.</p>
                    <p>Use o formulário acima para publicar sua primeira notícia!</p>
                `;
                title.insertAdjacentElement('afterend', emptyMessage);
            } else {
                recentNews.forEach((item) => {
                    const newsItem = document.createElement('div');
                    newsItem.className = 'published-item';
                    newsItem.innerHTML = `
                        <p><strong>${item.title}</strong></p>
                        <p><em>Comitê: ${item.committee} | Publicada em: ${item.date}</em></p>
                        <div class="published-actions">
                            <button class="action-btn delete-btn" data-id="${item.id}" data-type="news">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    `;
                    title.insertAdjacentElement('afterend', newsItem);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <p><i class="fas fa-exclamation-circle"></i> Erro ao carregar notícias.</p>
                <p>Verifique sua conexão com a internet.</p>
            `;
            title.insertAdjacentElement('afterend', emptyMessage);
        }
    }
    
    if (interviewsContainer) {
        const title = interviewsContainer.querySelector('h3');
        const existingItems = interviewsContainer.querySelectorAll('.published-item');
        existingItems.forEach(item => item.remove());
        
        try {
            const allInterviews = await fetchInterviewsFromAPI();
            const journalInterviews = allInterviews.filter(item => 
                item.journal === currentJournal.name || 
                item.journalName === currentJournal.name
            );
            
            const recentInterviews = journalInterviews.slice(-5).reverse();
            
            if (recentInterviews.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-message';
                emptyMessage.innerHTML = `
                    <p><i class="fas fa-video"></i> Você ainda não publicou nenhuma entrevista.</p>
                    <p>Use o formulário acima para publicar sua primeira entrevista!</p>
                `;
                title.insertAdjacentElement('afterend', emptyMessage);
            } else {
                recentInterviews.forEach((item) => {
                    const interviewItem = document.createElement('div');
                    interviewItem.className = 'published-item';
                    interviewItem.innerHTML = `
                        <p><strong>${item.title}</strong></p>
                        <p><em>Comitê: ${item.committee} | Publicada em: ${item.date}</em></p>
                        <div class="published-actions">
                            <button class="action-btn delete-btn" data-id="${item.id}" data-type="interview">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    `;
                    title.insertAdjacentElement('afterend', interviewItem);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar entrevistas:', error);
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <p><i class="fas fa-exclamation-circle"></i> Erro ao carregar entrevistas.</p>
                <p>Verifique sua conexão com a internet.</p>
            `;
            title.insertAdjacentElement('afterend', emptyMessage);
        }
    }
    
    setupPublishedActions();
}

// Configurar ações do conteúdo publicado
function setupPublishedActions() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            
            if (confirm(`Tem certeza que deseja excluir este ${type}?\nEsta ação não pode ser desfeita.`)) {
                const item = this.closest('.published-item');
                item.style.opacity = '0.5';
                
                try {
                    let result;
                    if (type === 'news') {
                        result = await deleteNewsViaAPI(id);
                    } else if (type === 'interview') {
                        result = await deleteInterviewViaAPI(id);
                    }
                    
                    if (result && result.success) {
                        setTimeout(() => {
                            item.remove();
                            alert(`${type === 'news' ? 'Notícia' : 'Entrevista'} excluída com sucesso!`);
                            updatePublishedContent();
                        }, 300);
                    } else {
                        item.style.opacity = '1';
                        alert(`❌ Erro ao excluir: ${result?.error || 'Erro desconhecido'}`);
                    }
                } catch (error) {
                    item.style.opacity = '1';
                    console.error('Erro ao excluir:', error);
                    alert('❌ Erro de conexão ao excluir. Verifique sua conexão.');
                }
            }
        });
    });
}

// Função para converter arquivo para Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Função para formatar data
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Configurar upload de arquivos
function setupFileUpload(uploadAreaId, fileInputId, previewId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files, preview);
    });
    
    function handleFiles(files, previewElement) {
        if (!files.length) return;
        
        const file = files[0];
        const fileSize = (file.size / (1024*1024)).toFixed(2);
        
        const maxSize = uploadAreaId === 'image-upload-area' ? 5 : 50;
        if (parseFloat(fileSize) > maxSize) {
            alert(`Arquivo muito grande. O tamanho máximo é ${maxSize}MB.`);
            fileInput.value = '';
            return;
        }
        
        previewElement.innerHTML = '';
        previewElement.classList.add('active');
        
        const fileType = file.type.split('/')[0];
        const iconClass = fileType === 'image' ? 'fas fa-image' : 'fas fa-video';
        
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        
        previewItem.innerHTML = `
            <div class="file-preview-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${fileSize} MB</div>
            </div>
            <button type="button" class="file-preview-remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const removeBtn = previewItem.querySelector('.file-preview-remove');
        removeBtn.addEventListener('click', function() {
            previewElement.innerHTML = '';
            previewElement.classList.remove('active');
            fileInput.value = '';
        });
        
        previewElement.appendChild(previewItem);
    }
}

// Pré-visualizar notícia
async function previewNews() {
    const title = document.getElementById('news-title').value;
    const committee = document.getElementById('news-committee').value;
    const excerpt = document.getElementById('news-excerpt').value;
    const content = document.getElementById('news-content').value;
    const imageFile = document.getElementById('news-image').files[0];
    const currentJournal = getCurrentJournal();
    const journalName = currentJournal.name;
    
    if (!title || !committee || !excerpt || !content) {
        alert('Por favor, preencha todos os campos obrigatórios antes de ver a prévia.');
        return;
    }
    
    const preview = document.getElementById('news-preview');
    
    if (imageFile) {
        const imageBase64 = await fileToBase64(imageFile);
        preview.innerHTML = `
            <div style="margin-bottom: 15px;">
                <span style="background-color: #e6f2ff; color: #0065b3; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${committee}</span>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 15px; color: #003c71;">${title}</h3>
            <p style="color: #777777; margin-bottom: 15px; font-style: italic;">${excerpt}</p>
            <div style="height: 150px; overflow: hidden; border-radius: 8px; margin-bottom: 15px;">
                <img src="${imageBase64}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="color: #555; line-height: 1.6; margin-bottom: 15px;">${content.substring(0, 200)}...</div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #f5f5f5; font-size: 0.9rem;">
                <span style="color: #777777;">${formatDate(new Date())}</span>
                <span style="color: #0065b3; font-weight: 600;">${journalName}</span>
            </div>
        `;
    } else {
        preview.innerHTML = `
            <div style="margin-bottom: 15px;">
                <span style="background-color: #e6f2ff; color: #0065b3; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${committee}</span>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 15px; color: #003c71;">${title}</h3>
            <p style="color: #777777; margin-bottom: 15px; font-style: italic;">${excerpt}</p>
            <div style="height: 150px; background: #f0f0f0; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-image" style="font-size: 3rem; color: #ccc;"></i>
            </div>
            <div style="color: #555; line-height: 1.6; margin-bottom: 15px;">${content.substring(0, 200)}...</div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #f5f5f5; font-size: 0.9rem;">
                <span style="color: #777777;">${formatDate(new Date())}</span>
                <span style="color: #0065b3; font-weight: 600;">${journalName}</span>
            </div>
        `;
    }
}

// Pré-visualizar entrevista
async function previewInterview() {
    const title = document.getElementById('interview-title').value;
    const committee = document.getElementById('interview-committee').value;
    const description = document.getElementById('interview-description').value;
    const videoFile = document.getElementById('interview-video').files[0];
    const youtubeLink = document.getElementById('interview-youtube').value.trim();
    
    if (!title || !committee || !description) {
        alert('Por favor, preencha todos os campos obrigatórios antes de ver a prévia.');
        return;
    }
    
    const currentJournal = getCurrentJournal();
    const journalName = currentJournal.name;
    const preview = document.getElementById('interview-preview');
    
    // Se tem vídeo local
    if (videoFile) {
        try {
            const videoBase64 = await fileToBase64(videoFile);
            preview.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <span style="background-color: #e6f2ff; color: #0065b3; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${committee}</span>
                </div>
                <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; color: #003c71;">${title}</h3>
                <div style="height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 15px;">
                    <video controls style="width: 100%; height: 100%; object-fit: cover;">
                        <source src="${videoBase64}" type="${videoFile.type}">
                        Seu navegador não suporta o elemento de vídeo.
                    </video>
                </div>
                <p style="color: #777777; font-size: 0.9rem; line-height: 1.5;">${description}</p>
                <p style="color: #777777; font-size: 0.9rem; margin-top: 10px;">${formatDate(new Date())} - ${journalName}</p>
            `;
            return;
        } catch (error) {
            console.error('Erro ao carregar vídeo local:', error);
        }
    }
    
    // Se tem link do YouTube
    if (youtubeLink) {
        let youtubeId = '';
        const patterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
            /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
            /youtu\.be\/([^"&?\/\s]{11})/
        ];
        
        for (const pattern of patterns) {
            const match = youtubeLink.match(pattern);
            if (match) {
                youtubeId = match[1];
                break;
            }
        }
        
        if (youtubeId) {
            preview.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <span style="background-color: #e6f2ff; color: #0065b3; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${committee}</span>
                </div>
                <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; color: #003c71;">${title}</h3>
                <div style="height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 15px; position: relative;">
                    <img src="https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 101, 179, 0.7); display: flex; justify-content: center; align-items: center;">
                        <i class="fas fa-play" style="color: white; font-size: 3rem;"></i>
                    </div>
                </div>
                <p style="color: #777777; font-size: 0.9rem; line-height: 1.5;">${description}</p>
                <p style="color: #777777; font-size: 0.9rem; margin-top: 10px;">${formatDate(new Date())} - ${journalName}</p>
            `;
            return;
        }
    }
    
    // Se não tem vídeo nem link válido
    preview.innerHTML = `
        <div style="margin-bottom: 15px;">
            <span style="background-color: #e6f2ff; color: #0065b3; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${committee}</span>
        </div>
        <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; color: #003c71;">${title}</h3>
        <div style="height: 200px; background: #f0f0f0; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: #777;">
            <div style="text-align: center;">
                <i class="fas fa-video-slash" style="font-size: 3rem; margin-bottom: 10px;"></i>
                <p>Insira um link do YouTube ou selecione um vídeo</p>
            </div>
        </div>
        <p style="color: #777777; font-size: 0.9rem; line-height: 1.5;">${description}</p>
        <p style="color: #777777; font-size: 0.9rem; margin-top: 10px;">${formatDate(new Date())} - ${journalName}</p>
    `;
}

// Publicar notícia
async function publishNews() {
    const title = document.getElementById('news-title').value.trim();
    const committee = document.getElementById('news-committee').value;
    const excerpt = document.getElementById('news-excerpt').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const imageFile = document.getElementById('news-image').files[0];
    const currentJournal = getCurrentJournal();
    const journalName = currentJournal.name;
    
    if (!title || !committee || !excerpt || !content) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Mostrar loader
    const submitBtn = document.querySelector('#publish-news-form .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    submitBtn.disabled = true;
    
    try {
        const result = await publishNewsViaAPI({
            title,
            committee,
            excerpt,
            content,
            journalName
        }, imageFile);
        
        if (result.success) {
            alert(`✅ Notícia "${title}" publicada com sucesso!\n\nPublicado por: ${journalName}\nA notícia agora aparecerá para TODOS os usuários.`);
            
            // Limpar formulário
            document.getElementById('publish-news-form').reset();
            document.getElementById('news-preview').innerHTML = '<p><em>O pré-visualização aparecerá aqui após preencher os campos acima.</em></p>';
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('image-preview').classList.remove('active');
            
            // Atualizar conteúdo publicado
            updatePublishedContent();
        } else {
            alert(`❌ Erro ao publicar notícia: ${result.error || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão com o servidor. Verifique sua conexão com a internet.');
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Publicar entrevista
async function publishInterview() {
    const title = document.getElementById('interview-title').value.trim();
    const committee = document.getElementById('interview-committee').value;
    const description = document.getElementById('interview-description').value.trim();
    const videoFile = document.getElementById('interview-video').files[0];
    const youtubeLink = document.getElementById('interview-youtube').value.trim();
    const currentJournal = getCurrentJournal();
    const journalName = currentJournal.name;
    
    if (!title || !committee || !description) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar link do YouTube se fornecido
    if (youtubeLink && youtubeLink !== '') {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(youtubeLink)) {
            alert('Por favor, insira um link válido do YouTube ou selecione um vídeo local.');
            return;
        }
    }
    
    if (!videoFile && (!youtubeLink || youtubeLink === '')) {
        alert('Por favor, selecione um vídeo local ou insira um link do YouTube.');
        return;
    }
    
    // Mostrar loader
    const submitBtn = document.querySelector('#publish-interview-form .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    submitBtn.disabled = true;
    
    try {
        const result = await publishInterviewViaAPI({
            title,
            committee,
            description,
            youtubeLink,
            journalName
        }, videoFile);
        
        if (result.success) {
            alert(`✅ Entrevista "${title}" publicada com sucesso!\n\nPublicado por: ${journalName}\nA entrevista agora aparecerá para TODOS os usuários.`);
            
            // Limpar formulário
            document.getElementById('publish-interview-form').reset();
            document.getElementById('interview-preview').innerHTML = '<p><em>O pré-visualização aparecerá aqui após preencher os campos acima.</em></p>';
            document.getElementById('video-preview').innerHTML = '';
            document.getElementById('video-preview').classList.remove('active');
            
            // Atualizar conteúdo publicado
            updatePublishedContent();
        } else {
            alert(`❌ Erro ao publicar entrevista: ${result.error || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        if (error.message.includes('Link do YouTube inválido')) {
            alert('❌ ' + error.message);
        } else {
            alert('❌ Erro de conexão com o servidor. Verifique sua conexão com a internet.');
        }
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Configurar menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Configurar a página admin
function setupAdminPage() {
    const journalistEmail = getJournalistData().email || 'jornalista@onu.org';
    
    document.getElementById('journalist-email').textContent = journalistEmail;
    
    const currentJournal = getCurrentJournal();
    document.getElementById('journal-name').textContent = currentJournal.name;
    
    // Configurar sistema de abas
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Configurar upload de arquivos
    setupFileUpload('image-upload-area', 'news-image', 'image-preview');
    setupFileUpload('video-upload-area', 'interview-video', 'video-preview');
    
    // Pré-visualizar notícia
    const previewNewsBtn = document.getElementById('preview-news');
    if (previewNewsBtn) {
        previewNewsBtn.addEventListener('click', function() {
            previewNews();
        });
    }
    
    // Pré-visualizar entrevista
    const previewInterviewBtn = document.getElementById('preview-interview');
    if (previewInterviewBtn) {
        previewInterviewBtn.addEventListener('click', function() {
            previewInterview();
        });
    }
    
    // Publicar notícia
    const publishNewsForm = document.getElementById('publish-news-form');
    if (publishNewsForm) {
        publishNewsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await publishNews();
        });
    }
    
    // Publicar entrevista
    const publishInterviewForm = document.getElementById('publish-interview-form');
    if (publishInterviewForm) {
        publishInterviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await publishInterview();
        });
    }
    
    // Logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Tem certeza que deseja sair?')) {
                logoutJournalist();
            }
        });
    }
    
    setupMobileMenu();
    updatePublishedContent();
    
    console.log('✅ Sistema de administração inicializado com sucesso!');
    console.log(`📡 API URL: ${API_URL}`);
}