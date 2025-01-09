

import { validateForm } from './validationModule.js';


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
                setCookie('userInfo', userData, 30); // Cookie lasts 30 seconds

                registerForm.submit(); // Submit the form if validation is successful
            }
        });

        insertDataFromCookie();

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

        const setCookie = function(cname, cvalue, seconds){
                    const d = new Date(Date.now() + seconds * 1000); // Convert seconds to milliseconds
                    document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/`;
                };

        const  getCookie = function getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                else return null;
            }



    });


    // document.addEventListener('DOMContentLoaded', function () {
    //
    //     document.getElementById("registerForm").addEventListener('submit', (event) =>{
    //
    //         event.preventDefault();
    //         // Get values from form inputs and trim spaces
    //         const email = document.getElementById('emailAddress').value.trim();
    //         const name = document.getElementById('firstName').value.trim();
    //         const lastName = document.getElementById('lastName').value.trim();
    //
    //         // Combine all values into a single object
    //         const userData = JSON.stringify({ email, name, lastName });
    //
    //         // Save the combined data in a single cookie
    //         setCookie('userInfo', userData, 30); // Cookie lasts 30 seconds
    //
    //     });
    //
    //
    //     const setCookie = (cname, cvalue, seconds) => {
    //         const d = new Date(Date.now() + seconds * 1000); // Convert seconds to milliseconds
    //         document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/`;
    //     };
    //
    //     function getCookie(name) {
    //         const value = `; ${document.cookie}`;
    //         const parts = value.split(`; ${name}=`);
    //         if (parts.length === 2) return parts.pop().split(';').shift();
    //         else return null;
    //     }
    //
    //
    // });

})();