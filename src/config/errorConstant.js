exports.errorName = {
    NOTFOUND: 'NOTFOUND',
    ALREADYEXISTS: 'ALREADYEXISTS',
    INSUFFICIENTFUNDS: 'INSUFFICIENTFUNDS'
}

exports.errorType = {
    NOTFOUND: {
        message: 'Requested record not found',
        statusCode: 404
    }, 
    ALREADYEXISTS: {
        message: 'Customer already exists',
        statusCode: 400
    },
    INSUFFICIENTFUNDS: {
        message: 'Insufficient funds!',
        statusCode: 400
    }
}