document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');

    // Verifica se o cookie de "downloaded" está presente
    const downloaded = getCookie('downloaded');

    // Se o cookie de "downloaded" estiver presente, exibe o pop-up
    if (downloaded === 'true') {
        popup.style.display = 'block';
    }

    // Fecha o pop-up
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });
});

// Função para obter um cookie pelo nome
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
