
const {chatroomUIModel} = require('./chatroomUI');
const {Messages} = require('../models/message');
const {User} = require("../../models/user");

(function() {

    document.addEventListener('DOMContentLoaded', function () {

        //fetch messages from database if there are any
        Manager.fetchAndDisplayMessages().catch(error => {console.log(error)});

        // display messages every 10 seconds
        setInterval(Manager.fetchAndDisplayMessages, 10000);

    });

})();


const Manager = (function (){

    const fetchAndDisplayMessages = async function () {
        const messages = await ChatroomAPI.fetchMessages();
        chatroomUIModel.displayMessages(messages);
    }

    /***
     This function is responsible for checking if there's an existing session
     ***/
    const checkSession = async function (msgId) {
        try {
            const response = await fetch('/check-session', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msgId})
            });

            // Validate the response status
            const validateResponse = await chatroomUIModel.status(response);

            // Parse the response and check if the session is authenticated
            const session = await response.json();
            return session.authenticated;
        }
        catch (error) {
            console.error('Error checking session:', error);
            return false;
        }
        
    }

    const handleEdit = async function (msgId){
        try {
            if (await checkSession(msgId)) {
                // means the session is valid
                chatroomUIModel.editMsg(msgId);
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleSave = async function (msgId){
        try {
            if (await checkSession(msgId)) {
                // means the session is valid
                chatroomUIModel.saveMsg(msgId);
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleCancel = async function (msgId){
        try {
            if (await checkSession(msgId)) {
                // means the session is valid
                chatroomUIModel.cancelMsg(msgId);
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleDelete = async function (msgId){
        try {
            if (await checkSession()) {

                // find and delete message from database
                const response = await fetch('/find-and-delete-msg', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({msgId})
                });
                const validateResponse = await chatroomUIModel.status(response);
                const message = await response.json();

                if (message.deleted) {
                    fetchAndDisplayMessages().catch(error => {console.log(error)});
                }
                else {
                    console.log("Failed to delete the message");
                }
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    return {
        fetchAndDisplayMessages,
        handleEdit,
        handleDelete,
        handleCancel,
        handleSave
    }

})


const ChatroomAPI = (function() {

    const fetchMessages = async function () {
        try {
            const response = await fetch('/existingMessages');
            const validResponse = await status(response);
            const messages = await response.json();
        }
        catch (error) {
            console.log(`Error fetching messages from database: ${error}`);
        }
    }

    function status(response) {

        if (response.status >= 200 && response.status < 300) {
            return response
        }
        else {
            window.location.href = '/error';
            return Promise.reject(new Error("Couldn't find any response"));
        }
    }


    return {
        fetchMessages,
        status
    }

})