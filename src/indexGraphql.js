const express = require("express");
const { v4: uuidv4 } = require("uuid");
const expressGraphql = require('express-graphql').graphqlHTTP
const { buildSchema, GraphQLScalarType, Kind } = require("graphql");
const { verifyIfExistsAccountCPF, getBalance } = require("./customerFunctions");
const { errorName } = require("./config/errorConstant");
const getErrorCode = require("./config/getErrorCode");
const app = express();

const customers = [];

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

const schema = buildSchema(`
    scalar Date

    type Statement {
        description: String
        amount: Float
        created_at: Date
        type: String
    }

    type Customer {
        cpf: Int
        name: String
        id: ID
        created_at: Date
        statements: [Statement]
    }

    type Query {
        customer(id: ID!): Customer
        customers: [Customer]
    }

    type Mutation {
        createCustomer(name: String!, cpf: Int!): Customer
        deleteCustomer(cpf: Int!): Customer
        updateCustomer(cpf: Int!, name: String!): Customer
        createDeposit(cpf: Int!, description: String!, amount: Float!): Statement
    }
`);

const resolvers = {
    Date: dateScalar,
    customer({ id }) {
        return customers.find(item => item.id === id);
    },
    customers() {
        return customers;
    },
    createCustomer({ name, cpf }) {
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
    deleteCustomer({cpf}){
        const customer = verifyIfExistsAccountCPF(cpf, customers);

        customers.splice(customer, 1);

        return customer;
    },
    updateCustomer({cpf, name}){
        const customer = verifyIfExistsAccountCPF(cpf, customers);

        customer.name = name;

        return customer;
    },
    createDeposit({cpf, description, amount}){
        const customer = verifyIfExistsAccountCPF(cpf, customers);
        
        const statementOperation = {
            description,
            amount,
            created_at: new Date(),
            type: "credit"
        }

        customer.statements.push(statementOperation);
        return statementOperation;
    }
  };

  app.use(
    "/graphql",
    expressGraphql({
      schema,
      rootValue: resolvers,
      graphiql: true,
      customFormatErrorFn: (err) => {
          const error = getErrorCode(err.message)
          return ({ message: error.message, statusCode: error.statusCode })
      }
    })
  );

  app.listen(3333);