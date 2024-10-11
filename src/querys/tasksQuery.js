import gql from "graphql-tag";

export const PAGINATE_TASKS = gql`
query PaginateTasks($where: ObjectPaginatorWhere){
  paginate_type2(
    page: 1
    perPage: 100
    where: $where
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
      task_status
      executor{
          object{
          id
          user_id
          fullname{
            first_name
            last_name
          }
        }
      }
      module{
        object{
          id
          name
        }
      }
      description

  }
  }
}
`
export const TASK_STATUS_PROPERTI = gql`
query {
  property (id: "1024929884927544213 ") {
    id
    type_id
    name
    label
    default
    meta
  }
}
`

export const CREATE_TASK = gql`
mutation CreateTask($input: create_type2_input!) {
  create_type2 (input: $input) {
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
      task_status
      executor{
          object{
          id
          user_id
          fullname{
            first_name
            last_name
          }
        }
      }
      module{
        object{
          id
          name
          responsible_id{
          object{
          id
          }
          }
        }
      }
      description
  
    }
  }
}
`
export const UPDATE_TASK = gql`
mutation UpdateTask($id: String! $input: update_type2_input!) {
  update_type2 (id: $id input: $input) {
    status
    recordId

  }
}
`
