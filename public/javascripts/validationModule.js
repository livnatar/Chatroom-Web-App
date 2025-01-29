


function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

// Validate Name (only a-z characters)
function validateName(name) {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(name);
}

// Validate Password (8-32 characters, at least one letter and one number)
function validatePassword(password) {
    return validateLength(password, 3,32);
}

// Validate Length (between min and max)
function validateLength(input, minLength, maxLength) {
    return input.length >= minLength && input.length <= maxLength;
}

// Validate all form fields and return a result object
function validateField(fieldId, value) {
    let isValid = true;
    let message = '';

    // Trim the value before validation
    value = value.trim();

    // Apply length validation for all fields
    if (!validateLength(value, 3, 32)) {
        isValid = false;
        message = 'Input must be between 3 and 32 characters.';
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
                message = 'Password must be 8-32 characters, including at least one letter and one number.';
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

// Function to display validation error message
function showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('is-invalid');
    const errorMessage = input.nextElementSibling;
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

// Function to clear validation error message
function clearValidationError(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('is-invalid');
    const errorMessage = input.nextElementSibling;
    if (errorMessage) {
        errorMessage.textContent = '';
    }
}

// Validate all fields in the form
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
