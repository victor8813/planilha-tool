const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cookieParser());
app.use(express.static('public'));

function isUserPaid(req) {
    return req.cookies.isPaid === 'true';
}

function canDownloadToday(req) {
    const today = new Date().toISOString().slice(0, 10);
    return req.cookies.lastDownload !== today;
}

app.post('/upload', upload.single('file'), (req, res) => {
    if (req.cookies && req.cookies.downloaded) {
        return res.status(403).json({ error: "Limite de downloads atingido" });
    }

    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    if (isUserPaid(req) || canDownloadToday(req)) {
        const format = req.body.format;
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const newFilePath = path.join(__dirname, 'uploads', `planilha-convertida.${format}`);

        try {
            xlsx.writeFile(workbook, newFilePath, { bookType: format });

            if (!isUserPaid(req)) {
                res.cookie('lastDownload', new Date().toISOString().slice(0, 10), { maxAge: 24 * 60 * 60 * 1000 });
            }

            res.cookie("downloaded", "true", { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

            return res.download(newFilePath, `planilha-convertida.${format}`, () => {
                fs.unlinkSync(filePath);
                fs.unlinkSync(newFilePath);
            });
        } catch (error) {
            return res.status(500).send('Erro ao converter o arquivo.');
        }
    } else {
        return res.status(403).json({ error: "Limite de downloads atingido" });
    }
});

app.get('/pagar', (req, res) => {
    res.cookie('isPaid', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.send('Você agora tem acesso vitalício para baixar arquivos!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});