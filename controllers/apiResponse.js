const sendSuccess = (res, data = [], message = "", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message
    });
};

const sendError = (res, message = "Something went wrong", statusCode = 500, data = []) => {
    return res.status(statusCode).json({
        success: false,
        data,
        message
    });
};

module.exports = {
    sendError,
    sendSuccess
};
