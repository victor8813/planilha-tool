document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    const popup = document.getElementById("popup");
    const closePopup = document.getElementById("closePopup");

    uploadForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (response.status === 403) {
                popup.style.display = "flex";
                throw new Error("Limite de downloads atingido.");
            } else if (!response.ok) {
                throw new Error("Erro ao converter a planilha.");
            }
            return response.blob();
        })
        .then(blob => {
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "planilha-convertida.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        })
        .catch(error => console.error(error.message));
    });

    closePopup.addEventListener("click", function () {
        popup.style.display = "none";
    });
});
