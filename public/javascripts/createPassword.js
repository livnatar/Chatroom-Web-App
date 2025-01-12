
import { validateForm } from './validationModule.js';
import { getCookie } from './cookieUtils.js';

(function() {
    document.addEventListener('DOMContentLoaded', function () {

        // Check for the cookie immediately when the page loads
        checkCookie();

        // Set interval to monitor the cookie expiration periodically
        setInterval(checkCookie, 5000); // Check every 5 seconds

        const createPasswordForm = document.getElementById("createPasswordForm");

        createPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission to allow validation

            if (validateForm("createPasswordForm")) {
                createPasswordForm.submit(); // Submit the form if validation is successful
            }
        });

        // Function to check the cookie
        function checkCookie() {
            const userInfo = getCookie('userInfo');
            if (!userInfo) {
                console.log('The cookie is missing or expired');
                // If the cookie is missing or expired, redirect to registration
                window.location.href = '/register';
            } else {
                console.log(`The cookie: ${userInfo}`);
            }
        }
    });
})();


// import { validateForm } from './validationModule.js';
// import { getCookie } from './cookieUtils.js';
//
// (function() {
//     document.addEventListener('DOMContentLoaded', function () {
//
//         // Monitor the cookie expiration periodically
//        // monitorCookie();
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
//         // Monitor the cookie periodically to check if it's expired
//         function monitorCookie() {
//             const userInfo = getCookie('userInfo');
//             if (!userInfo) {
//                 console.log('the cookie is empty');
//                 // If the cookie is not found (i.e., expired), redirect to registration
//                 window.location.href = '/register';
//             }
//             else{
//                 console.log(`the cookie : ${userInfo}`)
//             }
//         }
//
//         // Set interval to monitor the cookie expiration periodically
//         setInterval(monitorCookie, 5000); // check every 5 seconds
//
//     });
// })();

