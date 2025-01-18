

// const setCookie = function(cname, cvalue, seconds){
//     const d = new Date(Date.now() + seconds * 1000); // Convert seconds to milliseconds
//     console.log(`expiresIn = ${d.toUTCString()}`);
//     document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/`;
// };

const setCookie = function(cname, cvalue, seconds) {
    const now = new Date(); // Get the current time
    const expires = new Date(now.getTime() + seconds * 1000); // Add seconds to the current time

    // Set the cookie with the expiration time
    document.cookie = `${cname}=${cvalue}; expires=${expires.toUTCString()}; path=/`;
};

const  getCookie = function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    else return null;
};

export {setCookie,getCookie};