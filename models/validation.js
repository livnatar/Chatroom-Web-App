

module.exports = (function(){

    // const emailValidation = function(email){
    //
    // };

    const nameValidation = function(name){
        const nameRegex = /^[a-zA-Z]+$/;
        const matches = name.match(nameRegex); // Returns an array if it matches, null otherwise
        return matches !== null && inputLengthValidation(name);
    };

    const inputLengthValidation = function(input){

        return input.length >= 3 && input.length <= 32;
    };

    return{
        //emailValidation,
        nameValidation,
        inputLengthValidation
    }

})();