const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser()); // Adiciona o middleware de cookies
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.post('/upload', (req, res) => {
    const lastDownloadDate = req.cookies.lastDownloadDate;
    const isVitalicio = req.cookies.vitalicio;

    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const file = req.files.file;
    const extension = req.body.format; // Formato escolhido pelo usuário
    const uploadPath = path.join(uploadDir, file.name);

    const formatosValidos = ['csv', 'xls', 'xlsx', 'ods', 'xlsb', 'xlsm'];
    if (!formatosValidos.includes(extension)) {
        return res.status(400).json({ error: "Formato inválido." });
    }

    // Verifica se o usuário já fez o download hoje
    const today = new Date().toISOString().split('T')[0]; // Data atual no formato 'YYYY-MM-DD'
    if (!isVitalicio && lastDownloadDate === today) {
        return res.status(400).json({ error: "Você só pode baixar uma vez por dia. Acesse o plano vitalício para baixar mais vezes." });
    }

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao salvar o arquivo." });
        }

        // Definindo o nome fixo para o arquivo convertido
        const fixedFileName = `arquivo_convertido.${extension}`;
        const convertedFilePath = path.join(uploadDir, fixedFileName);

        // Simulando conversão (apenas copiando o arquivo por enquanto)
        fs.copyFile(uploadPath, convertedFilePath, (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao converter o arquivo." });
            }

            // Atualiza o cookie de data do download
            res.cookie('lastDownloadDate', today, { maxAge: 86400000 }); // 24 horas
            res.json({ fileName: fixedFileName });
        });
    });
});

// Rota de download
app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath, fileName, (err) => {
            if (err) {
                res.status(500).send("Erro ao baixar o arquivo.");
            }
        });
    } else {
        res.status(404).send("Arquivo não encontrado.");
    }
});

// Rota de compra do plano vitalício
app.get('/comprar-plano', (req, res) => {
    res.cookie('vitalicio', true, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // Cookie vitalício para 1 ano
    res.send('Plano vitalício ativado. Agora você pode baixar ilimitadamente!');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000 🚀');
});
