


class apiError extends Error{
    constructor(statusCode, message, data = null) {
        super(message)
        this.statusCode = statusCode;
        this.data = data;
    }
}

export default apiError;
