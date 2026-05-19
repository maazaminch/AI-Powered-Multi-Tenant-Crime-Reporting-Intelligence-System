


class apiError extends Error{
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode;
    }
}

export default apiError;
