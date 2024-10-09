import {gql} from "graphql-tag"

export const LOGIN = gql`
mutation UserSignIn($input: UserSignInInput!) {
  userSignIn(input: $input) {
		recordId
		record {
			token_type
			expires_in
			access_token
			refresh_token
		}
		status
  }
}
`

export const CREATE_SPACE = gql`
mutation createSpace($input: SpaceCreateInput!) {
  spaceCreate(input: $input) {
    recordId
    status
    __typename
  }
}
`
export const INVITE_USER_IN_GROUP = gql`
mutation spaceInviteUser($input: SpaceInviteUserInput!) {
  spaceInviteUser(input: $input) {
      status
  }
}
`