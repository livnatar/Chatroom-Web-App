
import { validateForm } from './validationModule.js';

(function() {

    document.addEventListener('DOMContentLoaded', function () {
        const loginForm = document.getElementById("loginForm");

        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission to allow validation

            if (validateForm("loginForm")) {
                loginForm.submit(); // Submit the form if validation is successful
            }
        });
    });

})();
