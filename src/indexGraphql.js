const express = require("express");

const expressGraphql = require('express-graphql').graphqlHTTP

const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");
const { join } = require("path");

const getErrorCode = require("./config/getErrorCode");
const resolvers = require("./resolvers");
const app = express();

const schema = loadSchemaSync(join(__dirname, 'schema.graphql'), { loaders: [new GraphQLFileLoader()] });
const schemaWithResolvers = addResolversToSchema({ 
    schema, 
    resolvers
});

app.use(
    "/graphql",
    expressGraphql({
        schema: schemaWithResolvers,
        graphiql: true,
        customFormatErrorFn: (err) => {
        const error = getErrorCode(err.message);
        return ({ message: error ? error.message : err.message, statusCode: error ? error.statusCode : 500 })
        }
    })
);

app.listen(3333);