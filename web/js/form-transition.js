document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const formContainer = document.querySelector('.form-container');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Set initial height of form container to match login form
    formContainer.style.height = `${loginForm.offsetHeight}px`;

    // Function to switch to register form
    function showRegister() {
        // First, update the height of the container to match the register form
        formContainer.style.height = `${registerForm.offsetHeight}px`;
        
        // Add animation classes
        loginForm.classList.remove('active');
        loginForm.classList.add('hidden');
        
        // Small delay to ensure smooth animation
        setTimeout(() => {
            registerForm.classList.remove('hidden');
            registerForm.classList.add('active');
        }, 50);
    }

    // Function to switch to login form
    function showLogin() {
        // First, update the height of the container to match the login form
        formContainer.style.height = `${loginForm.offsetHeight}px`;
        
        // Add animation classes
        registerForm.classList.remove('active');
        registerForm.classList.add('hidden');
        
        // Small delay to ensure smooth animation
        setTimeout(() => {
            loginForm.classList.remove('hidden');
            loginForm.classList.add('active');
        }, 50);
    }

    // Event listeners
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });

    // Handle window resize to adjust form container height
    window.addEventListener('resize', function() {
        if (loginForm.classList.contains('active')) {
            formContainer.style.height = `${loginForm.offsetHeight}px`;
        } else {
            formContainer.style.height = `${registerForm.offsetHeight}px`;
        }
    });
});