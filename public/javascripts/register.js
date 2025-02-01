

import { validateForm } from './validationModule.js';
import { setCookie, getCookie } from './cookieUtils.js';

// ----------------------------------- consts ----------------------------------
const COOKIE_EXPIRATION_TIME= 30;

//------------------------------------------------------------------------------


(function() {

    document.addEventListener('DOMContentLoaded', function () {

        const registerForm = document.getElementById("registerForm");

        registerForm.addEventListener('submit', function (event) {

            // Prevent form submission to allow validation
            event.preventDefault();

            if (validateForm("registerForm")) {

                // Get values from form inputs and trim spaces
                const email = document.getElementById('emailAddress').value.trim();
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();

                // Combine all values into a single object
                const userData = JSON.stringify({ email, firstName, lastName });

                // Save the combined data in a single cookie
                setCookie('userInfo', userData, COOKIE_EXPIRATION_TIME ); // Cookie lasts 30 seconds

                registerForm.submit(); // Submit the form since validation was successful
            }
        });


        /**
         * This function retrieves user data from a cookie and populates the form inputs with the retrieved values.
         * It ensures that the data is displayed as long as the cookie exists, even when navigating between pages.
         */
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