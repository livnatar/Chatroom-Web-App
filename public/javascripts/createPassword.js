
import { validateForm } from './validationModule.js';

(function() {
    document.addEventListener('DOMContentLoaded', function () {

        const createPasswordForm = document.getElementById("createPasswordForm");

        createPasswordForm.addEventListener('submit', function (event) {
            // Prevent form submission to allow validation
            event.preventDefault();

            if (validateForm("createPasswordForm")) {
                createPasswordForm.submit(); // Submit the form if validation is successful
            }
        });
    });
})();