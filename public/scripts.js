document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('file');
    const formatSelect = document.getElementById('format');
    const statusText = document.getElementById('status');

    if (!fileInput.files.length) {
        statusText.textContent = "Por favor, selecione um arquivo.";
        return;
    }

    statusText.textContent = "Enviando arquivo... ⏳";

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('format', formatSelect.value);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        const downloadUrl = `/download/${data.fileName}`;

        statusText.textContent = "Download iniciado... 📥";

        // Cria o link de download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = data.fileName; // Nome do arquivo convertido
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        statusText.textContent = "Erro ao enviar o arquivo!";
        console.error('Erro:', error);
    });
});
