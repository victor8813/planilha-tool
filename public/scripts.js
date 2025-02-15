document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");

    uploadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(uploadForm);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showPopup(data.message);
            } else {
                alert("Arquivo convertido com sucesso! O download será iniciado.");
                window.location.reload();
            }
        })
        .catch(error => console.error("Erro ao enviar arquivo:", error));
    });
});

// Função para exibir o popup
function showPopup(message) {
    const popup = document.getElementById("popup");
    popup.style.display = "block";
    popup.querySelector("p").innerText = message;
}

// Função para fechar o popup
function closePopup() {
    document.getElementById("popup").style.display = "none";
}
