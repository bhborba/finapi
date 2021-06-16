exports.errorName = {
    NOTFOUND: 'NOTFOUND',
    ALREADYEXISTS: 'ALREADYEXISTS'
}

exports.errorType = {
    NOTFOUND: {
        message: 'Requested record not found',
        statusCode: 404
    }, 
    ALREADYEXISTS: {
        message: 'Customer already exists',
        statusCode: 400
    }
}