const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');  // Importando o cookie-parser

const app = express();
const upload = multer({ dest: 'uploads/' });

// Usar o cookie-parser para controlar os cookies
app.use(cookieParser());
app.use(express.static('public'));

// Função para verificar se o usuário pagou pelo plano vitalício
function isUserPaid(req) {
    return req.cookies.isPaid === 'true';
}

// Função para verificar se o usuário já fez o download hoje
function canDownloadToday(req) {
    const today = new Date().toISOString().slice(0, 10); // Data no formato "YYYY-MM-DD"
    return req.cookies.lastDownload !== today;
}

// Rota para upload e conversão da planilha
// Verifica se o usuário já baixou uma planilha hoje
if (req.cookies && req.cookies.downloaded) {
    return res.redirect('/upload'); // Redireciona para a página de limite excedido
}

    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    // Verificar se o usuário pagou ou se pode fazer o download hoje
    if (isUserPaid(req) || canDownloadToday(req)) {
        const format = req.body.format; // Formato escolhido pelo usuário
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);

        const newFilePath = path.join(__dirname, 'uploads', `planilha-convertida.${format}`);

        // Convertendo para o formato escolhido
        if (format === 'csv') {
            xlsx.writeFile(workbook, newFilePath, { bookType: 'csv' });
        } else if (format === 'xls') {
            xlsx.writeFile(workbook, newFilePath, { bookType: 'xls' });
        } else if (format === 'xlsx') {
            xlsx.writeFile(workbook, newFilePath, { bookType: 'xlsx' });
        } else if (format === 'ods') {
            xlsx.writeFile(workbook, newFilePath, { bookType: 'ods' });
        } else if (format === 'xlsb') {
            xlsx.writeFile(workbook, newFilePath, { bookType: 'xlsb' });
        } else if (format === 'xlsm') {
            xlsx.writeFile(workbook, newFilePath, { bookType: 'xlsm' });
        } else {
            return res.status(400).send('Formato inválido.');
        }

        // Se não for pago, registrar o último download
        if (!isUserPaid(req)) {
            res.cookie('lastDownload', new Date().toISOString().slice(0, 10), { maxAge: 24 * 60 * 60 * 1000 }); // 1 dia
        }

        // Enviar o arquivo convertido para o cliente
res.download(newFilePath, `planilha-convertida.${format}`, () => {
    fs.unlinkSync(filePath); // Apagar o arquivo original
    fs.unlinkSync(newFilePath); // Apagar o arquivo convertido

    // Salvar um cookie para lembrar que o usuário baixou uma planilha
    res.cookie("downloaded", "true", { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    // Redirecionar para a página de limite excedido
    res.redirect("/upload");
});

    } else {
        // Caso o limite de downloads tenha sido atingido
        res.send(`
            <h2>Limite Excedido!</h2>
            <p>Para baixar mais de 1 arquivo por dia, assine o plano vitalício.</p>
            <a href="/pagar">Assine o Plano Vitalício</a>
        `);
    }
});

// Rota para simular o pagamento e liberar acesso vitalício
app.get('/pagar', (req, res) => {
    res.cookie('isPaid', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 }); // Acesso vitalício
    res.send('Você agora tem acesso vitalício para baixar arquivos!');
});

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
