

import { validateForm } from './validationModule.js';
import { setCookie, getCookie } from './cookieUtils.js';

const REGISTER = 60;

(function() {

    document.addEventListener('DOMContentLoaded', function () {

        const registerForm = document.getElementById("registerForm");
        // Register form submission
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission to allow validation

            if (validateForm("registerForm")) {

                // Get values from form inputs and trim spaces
                const email = document.getElementById('emailAddress').value.trim();
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();

                // Combine all values into a single object
                const userData = JSON.stringify({ email, firstName, lastName });

                // Save the combined data in a single cookie
                setCookie('userInfo', userData, REGISTER); // Cookie lasts 30 seconds

                registerForm.submit(); // Submit the form if validation is successful
            }
        });

        function insertDataFromCookie() {

            const cookieData = getCookie('userInfo');
            if (cookieData) {
                // Parse the cookie data as JSON
                const userData = JSON.parse(cookieData);

                // Populate form inputs
                document.getElementById("emailAddress").value = userData.email || "";
                document.getElementById("firstName").value = userData.firstName || "";
                document.getElementById("lastName").value = userData.lastName || "";
            }
        }

        insertDataFromCookie();
    });


})();