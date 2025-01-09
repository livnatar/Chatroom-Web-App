

const setCookie = function(cname, cvalue, seconds){
    const d = new Date(Date.now() + seconds * 1000); // Convert seconds to milliseconds
    document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/`;
};

const  getCookie = function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    else return null;
};

export {setCookie,getCookie};