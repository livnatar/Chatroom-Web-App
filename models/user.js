
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
    constructor(email) {
        this.email = email;
        this.password = null;
    }

    addUser() {
        userList.push(this);
    }

    addPassword(password) {
        this.password = password;
    }

    checkIfEqualsToPassword(password) {
        return this.password === password;
    }

    static fetchAll() {
        return userList;
    }
}

module.exports = {User, findUserByEmail, printList, findIfEmailExists};