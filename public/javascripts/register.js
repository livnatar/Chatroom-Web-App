

(function() {

    const validation = require('/models/validation.js');

    document.addEventListener('DOMContentLoaded', function () {

        document.getElementById("registerForm").addEventListener('submit', (event) =>{

            event.preventDefault();
            // Get values from form inputs and trim spaces
            const email = document.getElementById('email').value.trim();
            const name = document.getElementById('name').value.trim();
            const lastName = document.getElementById('lastName').value.trim();

            // Combine all values into a single object
            const userData = JSON.stringify({ email, name, lastName });

            // Save the combined data in a single cookie
            setCookie('userInfo', userData, 30); // Cookie lasts 30 seconds

        });


        const setCookie = (cname, cvalue, seconds) => {
            const d = new Date(Date.now() + seconds * 1000); // Convert seconds to milliseconds
            document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/`;
        };

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            else return null;
        }


    });

})();