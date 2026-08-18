

class apiResponse {
    constructor(statusCode, data, message = "Success", extra = null) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        if (extra) {
            this.extra = extra;
        }
    }
}

export default apiResponse;
