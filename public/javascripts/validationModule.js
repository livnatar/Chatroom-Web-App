
// ----------------------------------- consts ----------------------------------
const MIN_LENGTH = 3;
const MAX_LENGTH = 32;
const LENGTH_ERROR = 'Input length must range from 3 to 32 characters.';

//---------------------------------- functions ---------------------------------

/**
 * This function validates whether a given email address is in a proper format.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email is valid, otherwise false.
 */
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

/**
 * This function validates whether a given name contains only alphabetical characters (a-z, A-Z).
 *
 * @param {string} name - The name to validate.
 * @returns {boolean} - Returns true if the name contains only letters, otherwise false.
 */
function validateName(name) {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(name);
}

/**
 * This function validates whether a given password meets the required length constraints.
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} - Returns true if the password length is within the allowed range, otherwise false.
 */
function validatePassword(password) {
    return validateLength(password, MIN_LENGTH,MAX_LENGTH);
}

/**
 * This function checks whether the length of the given input falls within the specified range.
 *
 * @param {string} input - The input string to validate.
 * @param {number} minLength - The minimum allowed length.
 * @param {number} maxLength - The maximum allowed length.
 * @returns {boolean} - Returns true if the input length is within the specified range, otherwise false.
 */
function validateLength(input, minLength, maxLength) {
    return input.length >= minLength && input.length <= maxLength;
}

/**
 * This function validates a form field based on its ID and value, ensuring it meets the required criteria.
 *
 * @param {string} fieldId - The ID of the form field being validated.
 * @param {string} value - The input value to validate.
 * @returns {{isValid: boolean, message: string}} - An object containing validation status and an error message if invalid.
 */
function validateField(fieldId, value) {
    let isValid = true;
    let message = '';

    // Trim the value before validation
    value = value.trim();

    // Apply length validation for all fields
    if (!validateLength(value, MIN_LENGTH, MAX_LENGTH)) {
        isValid = false;
        message = LENGTH_ERROR;
    }

    switch (fieldId) {
        case 'emailAddress':
            if (!validateEmail(value)) {
                isValid = false;
                message = 'Please provide a valid email address.';
            }
            break;

        case 'lastName':
        case 'firstName':
            if (!validateName(value)) {
                isValid = false;
                message = 'Name must contain only letters.';
            }
            break;

        case 'password':
            if (!validatePassword(value)) {
                isValid = false;
                message = LENGTH_ERROR;
            }
            break;

        case 'confirmPassword':
            const passwordField = document.getElementById('password');
            if (passwordField && value !== passwordField.value.trim()) {
                isValid = false;
                message = 'Passwords do not match.';
            }
            break;

        default:
            break;
    }

    return { isValid, message };
}

/**
 * This function displays a validation error message for a specific input field.
 *
 * @param {string} inputId - The ID of the input field to display the error for.
 * @param {string} message - The error message to display.
 */
function showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('is-invalid');
    //const errorMessage = input.nextElementSibling;
    const errorMessage = input.closest('.mb-3').querySelector('.invalid-feedback');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

/**
 * This function clears the validation error message for a specific input field.
 *
 * @param {string} inputId - The ID of the input field to clear the error for.
 */
function clearValidationError(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('is-invalid');
    const errorMessage = input.closest('.mb-3').querySelector('.invalid-feedback');
        //input.nextElementSibling;
    if (errorMessage) {
        errorMessage.textContent = '';
    }
}

/**
 * This function validates all fields in the specified form.
 *
 * @param {string} formId - The ID of the form to validate.
 * @returns {boolean} - Returns true if all fields are valid, otherwise false.
 */
function validateForm(formId) {
    const form = document.getElementById(formId);
    let valid = true;

    form.querySelectorAll('input').forEach(input => {
        const { isValid, message } = validateField(input.id, input.value);

        if (!isValid) {
            valid = false;
            showValidationError(input.id, message);
        } else {
            clearValidationError(input.id);
        }
    });

    return valid;
}



export { validateForm };
