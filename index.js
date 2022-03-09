const {ApolloServer} = require("apollo-server")
const typeDefs = require("./graphql/typeDefs")
const resolvers = require("./graphql/resolvers")
const { PORT } = require("./config")
const connectToDB = require("./utils/db")


connectToDB()
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: (context) => context,
})

server.listen(PORT , () => console.log("Server is listening on port : ", PORT))