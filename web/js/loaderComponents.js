// loaderComponents.js

// Función para cargar el header y el footer
function loadHeaderAndFooter() {
    // Cargar el header
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el header: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => console.error(error));

    // Cargar el footer
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el footer: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error(error));
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', loadHeaderAndFooter);