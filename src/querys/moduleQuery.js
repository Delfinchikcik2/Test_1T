import {gql} from 'graphql-tag'

export const PAGINATE_MODULE = gql`
query PaginateModule{
  paginate_type1(
    page: 1
    perPage: 100
  ) {
    data {
        id
    	name
      end_date
      start_date
      responsible_id{
        object{
          id
          user_id
          fullname{
            first_name
            last_name
          }
        }
      }
    responsible{
        object{
          id
          task_status
        }
      }
        level
        position
        created_at
        updated_at

    }
  }
}
`

export const PAGINATE_MODULE_WITH_STATUS = gql`
query PaginateModule{
  paginate_type1(
    page: 1
    perPage: 100
  ) {
    data {
        id
    	name
      end_date
      start_date
      responsible_id{
        object{
          id
          user_id
          fullname{
            first_name
            last_name
          }
        }
      }
    responsible{
        object{
          id
        }
      }
        level
        position
        created_at
        updated_at

    }
  }
}
`

export const CREATE_MODULE = gql`
mutation CreateModule($input: create_type1_input!) {
  create_type1 (input: $input) {
    status
    recordId
    record {
        id
        type_id
        author_id
        level
        position
        created_at
        updated_at
      name
      start_date
      end_date
      responsible_id{
      	object{
          	id
          	user_id
          	fullname{
           	 first_name
           	 last_name
          	}
      }
      
  
    }
  }
}
}
`
export const UPDATE_MODULE = gql`
mutation UpdateModule($id: String! $input: update_type1_input!) {
  update_type1 (id: $id input: $input) {
    status
    recordId

  }
}
`