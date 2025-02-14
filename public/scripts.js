document.addEventListener("DOMContentLoaded", function() {
    const warningMessage = document.querySelector('.warning');
    
    // Simulando o limite de downloads
    let downloadCount = localStorage.getItem('downloadCount') || 0;
    
    if (downloadCount >= 1) {
        warningMessage.style.display = 'block';
        document.querySelector('.upload-section').style.display = 'none'; // Esconde a área de upload
    }

    // Manipulando clique no link de assinatura
    document.querySelector('.button').addEventListener('click', function() {
        // Redefine o contador de downloads se o usuário comprar o plano
        localStorage.setItem('downloadCount', 0);
        alert('Você agora tem acesso vitalício!');
    });
});
