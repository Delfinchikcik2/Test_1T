import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { setContext } from '@apollo/client/link/context';
import { useUserStore } from 'src/stores/user-info';

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('acsess_token');
  const context = {headers:{...headers}};
  if (token) {
    context.headers.Authorization = `Bearer ${token}`
    }
    if (headers?.space === -1 || headers?.space == null || headers?.space === ''){
      delete context.headers.space;
    }
    else if(!headers?.space){
      context.headers.space = useUserStore().getSpaceId()
    }

  return context
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

export default ({ app }) => {
  app.provide(DefaultApolloClient, apolloClient);
};