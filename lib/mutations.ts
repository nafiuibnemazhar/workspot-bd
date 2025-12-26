import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation LoginUser($username: String!, $password: String!) {
    login(input: { clientMutationId: "uniqueId", username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;