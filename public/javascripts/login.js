
import { validateForm } from './validationModule.js';


(function() {

    document.addEventListener('DOMContentLoaded', function () {
        const loginForm = document.getElementById("loginForm");

        loginForm.addEventListener('submit', function (event) {
            // Prevent form submission to allow validation
            event.preventDefault();

            if (validateForm("loginForm")) {
                loginForm.submit(); // Submit the form if validation is successful
            }
        });
    });
})();
