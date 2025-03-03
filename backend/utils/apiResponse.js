// Success Response Class
class SuccessResponse {
    constructor(message, data = null, statusCode = 200) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }
}

// Error Response Class
class ErrorResponse {
    constructor(message, statusCode = 400) {
        this.success = false;
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = { SuccessResponse, ErrorResponse };
