

const {validation} = require("../models/validation")

let userList = [];

function findIfEmailExists(emailAddress) {
    return userList.some(user => user.email === emailAddress);
}

function findUserByEmail(emailAddress) {
    return userList.find(user => user.email === emailAddress);
}

function printList() {
    console.log(`${userList}`);
}

class User {
    constructor(email,password,firstName,lastName, id) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
    }

    addUser() {

        // //check if the email exist in the userList
        // if(findIfEmailExists(this.email)) {
        //     //throw new Error("Email already exists, try again");
        // }
        //
        // //check validation for each field and throw error
        // else if(validation.nameValidation(this.firstName) &&
        //         validation.nameValidation(this.lastName)  &&
        //         validation.validatePassword(this.password) &&
        //         validation.emailValidation(this.email)){
        //
        //     userList.push(this);
        // }
        // else{
        //    // throw new Error("Invalid input")
        // }
    }

    checkIfEqualsToPassword(password) {
        return this.password === password;
    }

    static fetchAll() {
        return userList;
    }

    static getLength() {
        return userList.length;
    }

}

module.exports = {User, findUserByEmail, printList, findIfEmailExists};