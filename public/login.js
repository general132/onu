// login.js - Sistema de login (usando auth.js compartilhado)
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const journalSelect = document.getElementById('journal');
    const rememberMeCheckbox = document.getElementById('remember-me');
    
    // Se já estiver logado, redireciona para admin
    if (checkLogin() && window.location.pathname.includes('login.html')) {
        window.location.href = 'admin.html';
    }
    
    // Configurar placeholder de exemplo quando o jornal é selecionado
    if (journalSelect) {
        journalSelect.addEventListener('change', function() {
            const selectedJournal = this.value;
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (selectedJournal && journalCredentials[selectedJournal]) {
                const cred = journalCredentials[selectedJournal];
                // Não mostrar as credenciais reais, apenas exemplos
                emailInput.placeholder = "exemplo@" + cred.displayName.toLowerCase().replace(/\s+/g, '') + ".org";
                passwordInput.placeholder = "••••••••";
            } else {
                // Voltar ao placeholder padrão
                emailInput.placeholder = "Digite seu e-mail";
                passwordInput.placeholder = "Digite sua senha";
            }
        });
        
        // Configurar mensagem de instrução genérica
        const loginInfo = document.querySelector('.login-info');
        if (loginInfo) {
            loginInfo.innerHTML = `
                <p><i class="fas fa-info-circle"></i> Use as credenciais fornecidas pela organização da ONU Legends</p>
                <p>Se não tem credenciais, entre em contato com o suporte.</p>
            `;
        }
        
        // Tentar restaurar dados de login salvos
        restoreLoginData();
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const journal = document.getElementById('journal').value;
            const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
            
            // Validar se um jornal foi selecionado
            if (!journal) {
                showMessage('Por favor, selecione um jornal.', 'error');
                return;
            }
            
            // Verificar se o jornal existe nas credenciais
            if (!journalCredentials[journal]) {
                showMessage('Jornal selecionado não encontrado.', 'error');
                return;
            }
            
            const journalCred = journalCredentials[journal];
            
            // Verificar credenciais
            if (email === journalCred.email && password === journalCred.password) {
                // Login bem-sucedido
                showMessage(`Login realizado com sucesso! Bem-vindo(a), ${journalCred.displayName}!`, 'success');
                
                // Salvar dados da sessão
                saveLoginData(email, journal, remember);
                
                // Redirecionar após 1.5 segundos
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                // Login falhou - mensagem genérica por segurança
                showMessage('Credenciais inválidas. Por favor, verifique seu e-mail e senha.', 'error');
            }
        });
    }
    
    // Função para mostrar mensagens
    function showMessage(message, type) {
        // Remover mensagens anteriores
        const existingMessage = document.querySelector('.login-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        
        // Adicionar antes do formulário
        const loginHeader = document.querySelector('.login-header');
        if (loginHeader && loginHeader.nextElementSibling) {
            loginHeader.parentNode.insertBefore(messageDiv, loginHeader.nextElementSibling);
        }
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // Configurar menu mobile
    setupMobileMenu();
    
    // Atualizar ano no rodapé
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('#current-year-login, .current-year');
    yearElements.forEach(element => {
        if (element) {
            element.textContent = currentYear;
        }
    });
});

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