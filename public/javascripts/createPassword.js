
import { validateForm } from './validationModule.js';
import { getCookie } from './cookieUtils.js';

(function() {
    document.addEventListener('DOMContentLoaded', function () {

        const createPasswordForm = document.getElementById("createPasswordForm");

        createPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission to allow validation

            if (validateForm("createPasswordForm")) {
                createPasswordForm.submit(); // Submit the form if validation is successful
            }
        });
    });
})();