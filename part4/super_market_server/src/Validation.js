class Validation {


    static validateName(name) {
        const regex = /^[A-Za-z\s]+$/;
        return regex.test(name);
    }

    static validatePhone(phone) {
        const regex = /^(?:\+9725|05)(?:[0-9]{8})$/;
        return regex.test(phone);
    }

    static validatePassword(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

        return regex.test(password);
    }

    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

}

module.exports = Validation;