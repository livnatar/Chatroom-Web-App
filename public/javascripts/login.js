
import { validateForm } from './validationModule.js';


(function() {

    document.addEventListener('DOMContentLoaded', function () {
        const loginForm = document.getElementById("loginForm");

        /**
         * Handles form submission for login.
         * Prevents default submission, runs validation, and submits if valid.
         */
        loginForm.addEventListener('submit', function (event) {
            // Prevent form submission to allow validation
            event.preventDefault();

            if (validateForm("loginForm")) {
                loginForm.submit(); // Submit the form if validation is successful
            }
        });

        /**
         * Toggles password visibility when the eye icon is clicked.
         * Switches between 'password' (hidden) and 'text' (visible) input types.
         * Updates the icon to either 'bi-eye' (visible) or 'bi-eye-slash' (hidden).
         */
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordField = document.getElementById('password');
            const icon = this.querySelector('i'); // Get the icon inside the span

            // Toggle password visibility
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });
})();
