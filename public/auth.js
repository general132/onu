// auth.js - Sistema de autenticação compartilhado entre login.html e admin.html

// Credenciais por jornal
const journalCredentials = {
    'newyork': {
        name: 'The New York Times',
        email: 'nyt.journalist@onu.org',
        password: 'NYT2025$',
        displayName: 'The New York Times',
        color: '#1a1a1a',
        logo: '📰'
    },
    'estadao': {
        name: 'Estadão',
        email: 'estadao.jornalista@onu.org',
        password: 'EstadaoBR2025',
        displayName: 'Estadão',
        color: '#0055a5',
        logo: '🇧🇷'
    },
    'diario': {
        name: 'Diário do Povo',
        email: 'diario.jornal@onu.org',
        password: 'DiarioCN2025',
        displayName: 'Diário do Povo',
        color: '#cc0000',
        logo: '🇨🇳'
    },
    'monde': {
        name: 'Le Monde',
        email: 'lemonde.journaliste@onu.org',
        password: 'Monde$2025',
        displayName: 'Le Monde',
        color: '#003366',
        logo: '🇫🇷'
    }
};

// Verificar se está logado (verifica ambos localStorage e sessionStorage)
function checkLogin() {
    // Primeiro verifica se está no localStorage (manter conectado)
    if (localStorage.getItem('journalistLoggedIn') === 'true') {
        return true;
    }
    // Se não, verifica sessionStorage (sessão atual)
    return sessionStorage.getItem('journalistLoggedIn') === 'true';
}

// Função de logout (limpa TUDO)
function logoutJournalist() {
    // Limpar sessionStorage
    sessionStorage.removeItem('journalistLoggedIn');
    sessionStorage.removeItem('journalistEmail');
    sessionStorage.removeItem('journal');
    sessionStorage.removeItem('journalName');
    sessionStorage.removeItem('journalLogo');
    sessionStorage.removeItem('journalColor');
    sessionStorage.removeItem('rememberMe');
    
    // Limpar localStorage
    localStorage.removeItem('journalistLoggedIn');
    localStorage.removeItem('journalistEmail');
    localStorage.removeItem('journal');
    localStorage.removeItem('journalName');
    localStorage.removeItem('journalLogo');
    localStorage.removeItem('journalColor');
    localStorage.removeItem('rememberMe');
    
    // Redirecionar para login
    window.location.href = 'login.html';
}

// Salvar dados de login
function saveLoginData(email, journal, remember) {
    const cred = journalCredentials[journal];
    
    if (remember) {
        // Salvar no localStorage (permanente)
        localStorage.setItem('journalistLoggedIn', 'true');
        localStorage.setItem('journalistEmail', email);
        localStorage.setItem('journal', journal);
        localStorage.setItem('journalName', cred.displayName);
        localStorage.setItem('journalLogo', cred.logo);
        localStorage.setItem('journalColor', cred.color);
        localStorage.setItem('rememberMe', 'true');
        
        // Limpar sessionStorage
        sessionStorage.removeItem('journalistLoggedIn');
        sessionStorage.removeItem('journalistEmail');
        sessionStorage.removeItem('journal');
        sessionStorage.removeItem('journalName');
        sessionStorage.removeItem('journalLogo');
        sessionStorage.removeItem('journalColor');
        sessionStorage.removeItem('rememberMe');
    } else {
        // Salvar apenas na sessão
        sessionStorage.setItem('journalistLoggedIn', 'true');
        sessionStorage.setItem('journalistEmail', email);
        sessionStorage.setItem('journal', journal);
        sessionStorage.setItem('journalName', cred.displayName);
        sessionStorage.setItem('journalLogo', cred.logo);
        sessionStorage.setItem('journalColor', cred.color);
        sessionStorage.setItem('rememberMe', 'false');
        
        // Limpar localStorage
        localStorage.removeItem('journalistLoggedIn');
        localStorage.removeItem('journalistEmail');
        localStorage.removeItem('journal');
        localStorage.removeItem('journalName');
        localStorage.removeItem('journalLogo');
        localStorage.removeItem('journalColor');
        localStorage.removeItem('rememberMe');
    }
}

// Obter dados do jornalista logado
function getJournalistData() {
    // Verifica se está no localStorage primeiro
    if (localStorage.getItem('rememberMe') === 'true') {
        return {
            email: localStorage.getItem('journalistEmail'),
            journal: localStorage.getItem('journal'),
            journalName: localStorage.getItem('journalName'),
            journalLogo: localStorage.getItem('journalLogo'),
            journalColor: localStorage.getItem('journalColor')
        };
    } else {
        return {
            email: sessionStorage.getItem('journalistEmail'),
            journal: sessionStorage.getItem('journal'),
            journalName: sessionStorage.getItem('journalName'),
            journalLogo: sessionStorage.getItem('journalLogo'),
            journalColor: sessionStorage.getItem('journalColor')
        };
    }
}

// Exibir informações do jornalista na página
function displayJournalistInfo() {
    const journalistInfo = document.getElementById('journalist-info');
    if (!journalistInfo) return;
    
    const data = getJournalistData();
    
    if (data.journalName) {
        journalistInfo.innerHTML = `
            <div class="journalist-badge" style="background-color: ${data.journalColor || '#0065b3'}">
                <span class="journalist-logo">${data.journalLogo || '📰'}</span>
                <span class="journalist-name">${data.journalName}</span>
            </div>
            <button onclick="logoutJournalist()" class="btn-logout">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button>
        `;
    }
}

// Verificar e redirecionar se não estiver logado
function checkAndRedirect() {
    if (!checkLogin()) {
        window.location.href = 'login.html';
    }
}

// Função para restaurar dados no login (preencher formulário automaticamente)
function restoreLoginData() {
    if (localStorage.getItem('rememberMe') === 'true') {
        const email = localStorage.getItem('journalistEmail');
        const journal = localStorage.getItem('journal');
        
        if (email && journal) {
            const emailInput = document.getElementById('email');
            const journalSelect = document.getElementById('journal');
            const rememberCheckbox = document.getElementById('remember-me');
            
            if (emailInput && journalSelect && rememberCheckbox) {
                emailInput.value = email;
                journalSelect.value = journal;
                rememberCheckbox.checked = true;
                
                // Atualizar placeholder
                if (journalCredentials[journal]) {
                    const cred = journalCredentials[journal];
                    emailInput.placeholder = "exemplo@" + cred.displayName.toLowerCase().replace(/\s+/g, '') + ".org";
                }
            }
        }
    }
}

// Tornar as funções disponíveis globalmente
window.checkLogin = checkLogin;
window.logoutJournalist = logoutJournalist;
window.saveLoginData = saveLoginData;
window.getJournalistData = getJournalistData;
window.displayJournalistInfo = displayJournalistInfo;
window.checkAndRedirect = checkAndRedirect;
window.restoreLoginData = restoreLoginData;