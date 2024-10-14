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
export const GET_PAGE = gql`
query getPage
  ($id: String!){
    page(id: $id) {
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
      object{
        id
        type_id
      }
		is_block
		created_at
		updated_at
    }
}
`

export const GET_PAGE_FOR_MODULE = gql`
query Pages($where: PaginatorWhere){
  pages(perPage: 15, page: 1, where: $where) { 
    data {
        id
      object {
        id
        type_id
      }
    }
  }
}
`