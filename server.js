const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Criar diretórios se não existirem
async function createDirectories() {
    const directories = [
        DATA_DIR,
        UPLOADS_DIR,
        PUBLIC_DIR
    ];
    
    for (const dir of directories) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
            console.log(`📁 Diretório criado: ${dir}`);
        }
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

// Configuração do Multer para uploads (SIMPLIFICADA)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// ========== FUNÇÕES AUXILIARES ==========
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error(`Erro ao ler ${filePath}:`, error);
        return [];
    }
}

async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Erro ao escrever ${filePath}:`, error);
        return false;
    }
}

function getJournalName(journalId) {
    const journals = {
        'newyork': 'The New York Times',
        'estadao': 'Estadão',
        'diario': 'Diário do Povo',
        'monde': 'Le Monde'
    };
    return journals[journalId] || 'ONU Legends';
}

// ========== ROTAS DA API ==========

// 1. Carregar notícias
app.get('/api/news', async (req, res) => {
    try {
        const news = await readJSON(path.join(DATA_DIR, 'news.json'));
        news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(news);
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 2. Carregar entrevistas
app.get('/api/interviews', async (req, res) => {
    try {
        const interviews = await readJSON(path.join(DATA_DIR, 'interviews.json'));
        interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(interviews);
    } catch (error) {
        console.error('Erro ao carregar entrevistas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 3. Publicar notícia
app.post('/api/news', upload.single('image'), async (req, res) => {
    try {
        const { title, committee, excerpt, content, journalName } = req.body;
        
        console.log('Publicando notícia:', { title, committee, journalName });
        
        if (!title || !committee || !excerpt || !content) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
        }
        
        const news = await readJSON(path.join(DATA_DIR, 'news.json'));
        
        const newNews = {
            id: `news-${Date.now()}`,
            title,
            excerpt,
            fullText: content,
            date: new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }),
            committee,
            journal: journalName || 'ONU Legends',
            journalName: journalName || 'ONU Legends',
            image: req.file ? `/uploads/${req.file.filename}` : '',
            isUserPublished: true,
            createdAt: new Date().toISOString()
        };
        
        news.push(newNews);
        await writeJSON(path.join(DATA_DIR, 'news.json'), news);
        
        res.status(201).json({ 
            success: true, 
            message: 'Notícia publicada com sucesso!',
            news: newNews 
        });
    } catch (error) {
        console.error('Erro ao publicar notícia:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 4. Publicar entrevista (CORRIGIDA - sem fallback padrão)
app.post('/api/interviews', upload.single('video'), async (req, res) => {
    try {
        const { title, committee, description, youtubeLink, journalName } = req.body;
        
        console.log('Publicando entrevista:', { title, committee, journalName });
        console.log('Arquivo recebido:', req.file);
        console.log('YouTube Link:', youtubeLink);
        
        if (!title || !committee || !description) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
        }
        
        const interviews = await readJSON(path.join(DATA_DIR, 'interviews.json'));
        
        let videoData = {};
        
        if (req.file) {
            // Vídeo local
            videoData = {
                type: 'local',
                url: `/uploads/${req.file.filename}`,
                filename: req.file.filename,
                filetype: req.file.mimetype
            };
        } else if (youtubeLink && youtubeLink.trim() !== '') {
            // Verificar se é um link válido do YouTube
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
            
            if (!youtubeRegex.test(youtubeLink)) {
                return res.status(400).json({ error: 'Link do YouTube inválido' });
            }
            
            // Extrair ID do YouTube
            let videoId = '';
            const patterns = [
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
                /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
                /youtu\.be\/([^"&?\/\s]{11})/
            ];
            
            for (const pattern of patterns) {
                const match = youtubeLink.match(pattern);
                if (match) {
                    videoId = match[1];
                    break;
                }
            }
            
            if (!videoId) {
                return res.status(400).json({ error: 'Não foi possível extrair o ID do vídeo do YouTube' });
            }
            
            videoData = {
                type: 'youtube',
                id: videoId,
                url: youtubeLink
            };
        } else {
            return res.status(400).json({ error: 'É necessário fornecer um vídeo local ou um link do YouTube' });
        }
        
        const newInterview = {
            id: `interview-${Date.now()}`,
            title,
            journal: journalName || 'ONU Legends',
            journalName: journalName || 'ONU Legends',
            date: new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }),
            committee,
            description,
            videoData,
            isUserPublished: true,
            createdAt: new Date().toISOString()
        };
        
        console.log('Nova entrevista criada:', newInterview);
        
        interviews.push(newInterview);
        const success = await writeJSON(path.join(DATA_DIR, 'interviews.json'), interviews);
        
        if (success) {
            res.status(201).json({ 
                success: true, 
                message: 'Entrevista publicada com sucesso!',
                interview: newInterview 
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar entrevista no arquivo' });
        }
    } catch (error) {
        console.error('Erro ao publicar entrevista:', error);
        res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
    }
});

// 5. Login simplificado
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, journal } = req.body;
        
        // Verificação simples - aceita qualquer login
        if (email && password && journal) {
            const journalNames = {
                'newyork': 'The New York Times',
                'estadao': 'Estadão',
                'diario': 'Diário do Povo',
                'monde': 'Le Monde'
            };
            
            res.json({ 
                success: true, 
                user: {
                    email,
                    journalName: journalNames[journal] || 'ONU Legends',
                    journalId: journal
                }
            });
        } else {
            res.status(400).json({ error: 'Preencha todos os campos' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 6. Deletar notícia
app.delete('/api/news/:id', async (req, res) => {
    try {
        const newsId = req.params.id;
        const news = await readJSON(path.join(DATA_DIR, 'news.json'));
        
        const index = news.findIndex(n => n.id === newsId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Notícia não encontrada' });
        }
        
        news.splice(index, 1);
        await writeJSON(path.join(DATA_DIR, 'news.json'), news);
        
        res.json({ success: true, message: 'Notícia excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir notícia:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 7. Deletar entrevista
app.delete('/api/interviews/:id', async (req, res) => {
    try {
        const interviewId = req.params.id;
        const interviews = await readJSON(path.join(DATA_DIR, 'interviews.json'));
        
        const index = interviews.findIndex(i => i.id === interviewId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Entrevista não encontrada' });
        }
        
        interviews.splice(index, 1);
        await writeJSON(path.join(DATA_DIR, 'interviews.json'), interviews);
        
        res.json({ success: true, message: 'Entrevista excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir entrevista:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 8. Status da API
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Servidor ONU Legends funcionando',
        timestamp: new Date().toISOString()
    });
});

// 9. Buscar notícia por ID
app.get('/api/news/:id', async (req, res) => {
    try {
        const newsId = req.params.id;
        const news = await readJSON(path.join(DATA_DIR, 'news.json'));
        
        const newsItem = news.find(n => n.id === newsId);
        
        if (!newsItem) {
            return res.status(404).json({ error: 'Notícia não encontrada' });
        }
        
        res.json(newsItem);
    } catch (error) {
        console.error('Erro ao buscar notícia:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 10. Buscar entrevista por ID
app.get('/api/interviews/:id', async (req, res) => {
    try {
        const interviewId = req.params.id;
        const interviews = await readJSON(path.join(DATA_DIR, 'interviews.json'));
        
        const interviewItem = interviews.find(i => i.id === interviewId);
        
        if (!interviewItem) {
            return res.status(404).json({ error: 'Entrevista não encontrada' });
        }
        
        res.json(interviewItem);
    } catch (error) {
        console.error('Erro ao buscar entrevista:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========== ROTA CATCH-ALL ==========
app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ========== INICIAR SERVIDOR ==========
async function startServer() {
    await createDirectories();
    
    // Criar arquivos JSON se não existirem
    const files = [
        { path: path.join(DATA_DIR, 'news.json'), data: [] },
        { path: path.join(DATA_DIR, 'interviews.json'), data: [] }
    ];
    
    for (const file of files) {
        try {
            await fs.access(file.path);
        } catch {
            await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
            console.log(`📄 Arquivo criado: ${file.path}`);
        }
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor ONU Legends rodando na porta ${PORT}`);
        console.log(`📁 Dados: ${DATA_DIR}`);
        console.log(`📁 Uploads: ${UPLOADS_DIR}`);
        console.log(`📁 Público: ${PUBLIC_DIR}`);
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
        console.log(`🔗 API: http://localhost:${PORT}/api`);
    });
}

startServer().catch(error => {
    console.error('❌ Erro ao iniciar servidor:', error);
});