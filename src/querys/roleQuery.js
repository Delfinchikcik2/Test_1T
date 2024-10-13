import gql from "graphql-tag";

export const GET_SUBJECT = gql`
query PaginateSubject($where: ObjectPaginatorWhere){
  paginate_subject(
    page: 1
    perPage: 100
    where: $where
  ) {
    data {
        id
      user_id
        type_id 
          fullname{
            first_name
            last_name
          }
      email{
        email
      }
      group{
        object{
          id
        }
      
      }
        }

  }
  }
`
export const GET_GROUP = gql`
query getGroup($id:String!){
  get_group(id: $id){
    id 
		type_id
		name
  }
  }
`
