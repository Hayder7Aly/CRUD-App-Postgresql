const { gql } = require("apollo-server");

const typeDefs = gql`

  type LoggedUser {
    username: String!
    token: String!
  }

  type Task {
    id: ID!
    title: String!
    body: String!
  }

  type User {
    id: ID!
    username: String!
    tasks: [Task]!
  }

  type InitUser {
    username: String!
    id: ID!
  }

  type InitTask{
      id: ID!
      title: String!
      body: String!
      user: InitUser!
  }

  type Query {
      getAllUsers : [User]!
      getUserTasks(id: ID!) : [Task]!
      getInitialTasks: [InitTask]!
  }

  input UserInput {
    username: String!
    password: String!
  }

  input TaskInput{
      title: String!,
      body: String!
  }

  type Mutation {
    registerUser(input: UserInput!): LoggedUser!
    login(input: UserInput!) : LoggedUser!
    addTask(input: TaskInput): Task!
    deleteTask(id: ID!): String!
  }
`;

module.exports = typeDefs;
