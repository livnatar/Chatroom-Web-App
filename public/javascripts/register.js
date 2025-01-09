import { validateForm } from './validationModule.js';


(function() {

    document.addEventListener('DOMContentLoaded', function () {

        const registerForm = document.getElementById("registerForm");

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

        const insertDataFromCookie = function(){

            const cookieData = getCookie('userInfo');
            if(cookieData){

                document.getElementById("emailAddress").value = cookieData.email;
                document.getElementById("firstName").value = cookieData.firstName ;
                document.getElementById("lastName").value = cookieData.lastName ;

            }



        };

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