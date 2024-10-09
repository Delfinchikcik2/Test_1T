import gql from "graphql-tag";

export const CREATE_PAGE = gql`
mutation ($input: PageCreateInput!) {
  pageCreate(input: $input) {
    recordId
    status
    record {
        id
        parent_id
        page_type
        title
        content
        icon
        level
        is_public
        position
        config
        created_at
        updated_at
    }
  }
}
`