export const ErrorHandlingMiddleWare = (err,req,res,next) =>{
    const {statusCode,message} = err;
    res.status(statusCode || 500).json({
        status: "error",
        statusCode,
        message
    });
}