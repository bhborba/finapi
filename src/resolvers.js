const { GraphQLScalarType, Kind } = require("graphql");
const { v4: uuidv4 } = require("uuid");
const { errorName } = require("./config/errorConstant");
const { verifyIfExistsAccountCPF, getBalance } = require("./customerFunctions");

const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
      return new Date(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
      }
      return null; // Invalid hard-coded value (not an integer)
    },
});

const customers = [];

module.exports = {
    Date: dateScalar,

    Query: {
        customer(_, args) {
            const { cpf } = args;

            return customers.find(item => item.cpf === cpf);
        },

        customers() {
            return customers;
        },
    
        statements(_, args){
            const { cpf } = args;
            const customer = verifyIfExistsAccountCPF(cpf, customers);
            
            return customer.statements;
        },

        statementsByDate(_, args){
            const { cpf, date } = args;

            const customer = verifyIfExistsAccountCPF(cpf, customers);

            const dateFormat = new Date(date + " 00:00");

            const statements = customer.statements.filter((statement) => 
                statement.created_at.toDateString() === new Date(dateFormat).toDateString()
            )
            return statements;
        },
        
        balance(_, args){
            const { cpf } = args;
            const customer = verifyIfExistsAccountCPF(cpf, customers);

            const balance = getBalance(customer.statements);

            return balance;
        }
    },

    Mutation: {
        createCustomer(_, args) {
            const { name, cpf } = args;
            const customer = {
            id: uuidv4(),
            name,
            cpf,
            created_at: new Date(),
            statements: []
            };
      
            const customerAlreadyExists = customers.some(
                (customerArr) => customerArr.cpf === customer.cpf
            );
    
            if (customerAlreadyExists) {
                throw new Error(errorName.ALREADYEXISTS);
            }
    
            customers.push(customer);
            return customer;
        },

        deleteCustomer(_, args){
            const { cpf } = args;

            const customer = verifyIfExistsAccountCPF(cpf, customers);
    
            customers.splice(customer, 1);
    
            return customer;
        },

        updateCustomer(_, args){
            const { cpf, name } = args;
            const customer = verifyIfExistsAccountCPF(cpf, customers);
    
            customer.name = name;
    
            return customer;
        },

        createDeposit(_, args){
            const { cpf, description,  amount} = args;

            const customer = verifyIfExistsAccountCPF(cpf, customers);
            
            const statementOperation = {
                description,
                amount,
                created_at: new Date(),
                type: "credit"
            }
    
            customer.statements.push(statementOperation);
            return statementOperation;
        },

        createWithdraw(_, args){
            const { cpf, amount } = args;

            const customer = verifyIfExistsAccountCPF(cpf, customers);
    
            const balance = getBalance(customer.statements);
    
            if(balance < amount) {
                throw new Error(errorName.INSUFFICIENTFUNDS);
            }
    
            const statementOperation = {
                amount,
                created_at: new Date(),
                type: "debit"
            };
        
            customer.statements.push(statementOperation);
            return statementOperation;
        },
    },
}