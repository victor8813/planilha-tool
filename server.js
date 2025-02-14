const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota para upload e conversão da planilha
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

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

    // Enviar o arquivo convertido para o cliente
    res.download(newFilePath, `planilha-convertida.${format}`, () => {
        fs.unlinkSync(filePath); // Apagar o arquivo original
        fs.unlinkSync(newFilePath); // Apagar o arquivo convertido
    });
});

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
