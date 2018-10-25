const { GraphQLServer } = require('graphql-yoga')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const db = require('./db')

// create graphql-yoga server

function createServer() {
  return new GraphQLServer({
    typeDefs: 'schema.graphql',
    resolver: {
      Mutation,
      Query
    },
    resolverValidationOptions: {
      requireResolversForResolverType: false
    },
    context: req => ({ ...req, db })
  })
}

module.exports = createServer
