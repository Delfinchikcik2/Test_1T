import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: 'https://app.stud.druid.1t.ru/graphql',
  headers: {
    // 'Authorization': 'Bearer', 
    'Content-Type': 'application/json', 
  },
})

// Cache implementation
const cache = new InMemoryCache()

// Create the Apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

export default ({ app }) => {
  // Provide Apollo Client globally
  app.provide(DefaultApolloClient, apolloClient)
}
