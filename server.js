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
        return res.redirect('/limite-excedido');
    }

    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    if (isUserPaid(req) || canDownloadToday(req)) {
        const format = req.body.format;
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const newFilePath = path.join(__dirname, 'uploads', `planilha-convertida.${format}`);

        if (['csv', 'xls', 'xlsx', 'ods', 'xlsb', 'xlsm'].includes(format)) {
            xlsx.writeFile(workbook, newFilePath, { bookType: format });
        } else {
            return res.status(400).send('Formato inválido.');
        }

        if (!isUserPaid(req)) {
            res.cookie('lastDownload', new Date().toISOString().slice(0, 10), { maxAge: 24 * 60 * 60 * 1000 });
        }

        res.download(newFilePath, `planilha-convertida.${format}`, () => {
            fs.unlinkSync(filePath);
            fs.unlinkSync(newFilePath);
            res.cookie("downloaded", "true", { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            res.redirect("/limite-excedido");
        });
    } else {
        res.redirect('/limite-excedido');
    }
});

app.get('/limite-excedido', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Limite Excedido</title>
            <script>
                window.onload = function() {
                    document.getElementById('pagamento').scrollIntoView({ behavior: 'smooth' });
                }
            </script>
        </head>
        <body>
            <h2>Limite Excedido!</h2>
            <p>Para baixar mais de 1 arquivo por dia, assine o plano vitalício.</p>
            <a id="pagamento" href="/pagar" style="display:block; padding:10px; background:blue; color:white; text-align:center; width:200px;">Assine o Plano Vitalício</a>
        </body>
        </html>
    `);
});

app.get('/pagar', (req, res) => {
    res.cookie('isPaid', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.send('Você agora tem acesso vitalício para baixar arquivos!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
