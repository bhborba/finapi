const express = require("express");
const { v4: uuidv4 } = require("uuid");
const expressGraphql = require('express-graphql').graphqlHTTP
const { buildSchema, GraphQLScalarType, Kind } = require("graphql");

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
        statement: []
      };
  
      customers.push(customer);
      return customer;
    }
  };


  app.use(
    "/graphql",
    expressGraphql({
      schema,
      rootValue: resolvers,
      graphiql: true
    })
  );

  app.listen(3333);