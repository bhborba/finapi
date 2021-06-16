const { errorName } = require("./config/errorConstant");

exports.verifyIfExistsAccountCPF = function (customer, customers){
    const {cpf} = customer;

    const customerFound = customers.find(customerObj => customerObj.cpf === cpf);

    if(!customerFound) {
        throw new Error(errorName.NOTFOUND);
    }
}

exports.getBalance = function(statement){
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}
