//

import { validateForm } from './validationModule.js';
import { getCookie } from './cookieUtils.js';

(function() {
    document.addEventListener('DOMContentLoaded', function () {

        // Monitor the cookie expiration periodically
       // monitorCookie();

        const createPasswordForm = document.getElementById("createPasswordForm");

        createPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission to allow validation

            if (validateForm("createPasswordForm")) {
                createPasswordForm.submit(); // Submit the form if validation is successful
            }
        });

        // Monitor the cookie periodically to check if it's expired
        function monitorCookie() {
            const userInfo = getCookie('userInfo');
            if (!userInfo) {
                // If the cookie is not found (i.e., expired), redirect to registration
                window.location.href = '/register';
            }
        }

        // Set interval to monitor the cookie expiration periodically
        setInterval(monitorCookie, 5000); // check every 5 seconds

    });
})();


//
// import { validateForm } from './validationModule.js';
// import { getCookie } from './cookieUtils.js';
//
//
// (function() {
//
//     document.addEventListener('DOMContentLoaded', function () {
//
//         // Monitor the cookie periodically
//         monitorCookie();
//
//         const createPasswordForm = document.getElementById("createPasswordForm");
//
//         createPasswordForm.addEventListener('submit', function (event) {
//             event.preventDefault(); // Prevent form submission to allow validation
//
//             if (validateForm("createPasswordForm")) {
//                 createPasswordForm.submit(); // Submit the form if validation is successful
//             }
//         });
//
//         function monitorCookie() {
//             setInterval(() => {
//                 const userInfo = getCookie('userInfo');
//                 if (!userInfo) {
//                     window.location.href = '/register';
//                 }
//             }, 5000); // Check every 5 seconds
//         }
//
//
//
//         });
//
//
// })();
//
//
