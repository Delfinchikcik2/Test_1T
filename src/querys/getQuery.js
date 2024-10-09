import { gql } from 'graphql-tag';

export const GET_ROOT_PAGE = gql `
query ($perPage: Int, $page: Int, $orderBy: PaginatorOrderBy) {
  rootPages(perPage: $perPage, page: $page, orderBy: $orderBy) {
    data {
      id
      author_id
      parent_id
      page_type
      title
      icon
      position
      hasChild
      level
      config
      tags
      is_group
      object {
        type_id
        id
        __typename
      }
      is_favorite
      is_group
      __typename
    }
    __typename
  }
}
`;
export const GET_CHILD_PAGE = gql `
query ($where: PaginatorWhere){
  pages(perPage: 10, page: 1, where: $where) { 
    data {
        id
        parent_id
        page_type
        title
        content
        icon
        level
        is_public
				is_block
        position
        is_group
        config
        	object{
          id
          __typename
        }
        created_at
        updated_at
    }
  }
}
`;

export const GET_SPACES = gql`
query userMy {
  userMy {
      spaces
  }
}
`

export const GET_CURENT_SPACE_ID = gql`
      query userMy {
  userMy {
      current_space_id
  }
}
`

export const GET_GROUPS = gql`
{
  paginate_group(
    page: 1
    perPage: 100
  ) {
    data {
      id
      type_id
      author_id
      level
      position
      created_at
      updated_at
      name
         group {
        object {
          id
          name
        }
      }
    }
    paginatorInfo {
      perPage
      currentPage
      lastPage
      total
      count
      from
      to
      hasMorePages
    }
  }
}

`

export const GET_TYPES = gql`
{
    types(
        perPage: 1
        page: 1
    ) {
        data {
            id
            name
            label
            description
            system
            searchable
            id_ai
            author_id
            meta {
                headline
                icon
            }
            created_at
            updated_at
        }
				paginatorInfo {
	        perPage
	        currentPage
	        lastPage
	        total
	        count
	        from
	        to
	        hasMorePages
	    }
    }
}
`
export const GET_PAGE_BY_ID = gql`
query($id: String!) {
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
		is_block
		created_at
		updated_at
	}
}
`
export const PAGINATE_SUBJECT = gql`
query PaginateSubject{
  paginate_subject(
    page: 1
    perPage: 100
  ) {
    data {
        id
        type_id 
          fullname{
            first_name
            last_name
          }
        }

  }
  }
`