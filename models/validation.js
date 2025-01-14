

module.exports = (function(){

    const inputLengthValidation = function(input){
        return input.length >= 3 && input.length <= 32;
    };

    const nameValidation = function(name){
        const regex = /^[a-zA-Z]+$/;
        let matches = regex.test(name);
        return matches !== null && inputLengthValidation(name) ;
    };

    const emailValidation = function(email){
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email) && inputLengthValidation(email);
    };

    const validatePassword = function(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/;
        return regex.test(password) && inputLengthValidation(password);
    }

    return{
        emailValidation,
        nameValidation,
        inputLengthValidation,
        validatePassword
    }

})();