document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('uploadForm');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio do formulário padrão

        const formData = new FormData(form);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then((response) => response.blob())  // Usando 'response.blob()' para capturar o arquivo
        .then((data) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(data);
            link.download = "planilha-convertida.xlsx"; // Nome padrão, pode ser alterado
            link.click();

            // Verificar o status de download e exibir o pop-up se necessário
            fetch('/check-download-status')  // Endpoint para verificar o status de download
                .then((res) => res.json())
                .then((json) => {
                    if (json.error) {
                        popup.style.display = 'block'; // Exibir o pop-up
                    }
                });
        })
        .catch((error) => {
            alert('Erro ao converter a planilha. Tente novamente.');
        });
    });

    // Fechar o pop-up
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });
});
