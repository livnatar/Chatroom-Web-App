
/**
 * This function sets a cookie with a specified name, value, and expiration time in seconds.
 *
 * @param {string} cname - The name of the cookie.
 * @param {string} cvalue - The value to store in the cookie.
 * @param {number} seconds - The duration (in seconds) for which the cookie will be valid.
 */
const setCookie = function(cname, cvalue, seconds) {
    const now = new Date(); // Get the current time
    const expires = new Date(now.getTime() + seconds * 1000); // Add seconds to the current time

    // Set the cookie with the expiration time
    document.cookie = `${cname}=${cvalue}; expires=${expires.toUTCString()}; path=/`;
};

/**
 * This function retrieves the value of a specified cookie by name.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {null|string} - Returns the value of the cookie if found, otherwise null.
 */
const  getCookie = function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    else return null;
};


export {setCookie,getCookie};