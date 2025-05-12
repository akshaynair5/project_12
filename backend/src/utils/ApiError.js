class ApiError extends Error {
    constructor(
        message = 'Something went wrong',
        stack,
        errors = [],
        statusCode
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.errors = errors
        this.success = false

        if(stack){
            this.status = statusCode
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

export default ApiError