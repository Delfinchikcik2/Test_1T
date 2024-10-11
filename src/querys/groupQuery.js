import {gql} from 'graphql-tag'
export const GET_GROUP_WITH_SUBJECT = gql`
query getGroup($id: String!){
  get_group(id:$id){
    id 
    author_id,
		type_id
		name
		description
		icon
		system
		parent {
			object{
    id
        }
      
		},
		subject {
			object{
        user_id
        email{
          email
        }
        fullname{
          first_name
          last_name
        }
        group{
          object{
            name
          }
        }
      } 
		},
		group{
			object{
        id
        name
      } 
		},
    created_at
    updated_at
  }
  }
`

export const GET_EXECUTOR = gql`
query getGroup{
  get_group(id: "903288632941026841"){
    id 
		type_id
		name
		parent {
			object{
    id
        }
      
		},
		subject {
			object{
      id
        user_id
        email{
          email
        }
        fullname{
          first_name
          last_name
        }
        group{
          object{
            name
          }
        }
      } 
		}
  }
  }
`

export const GET_RESPONSIBLES = gql`
query getGroup{
  get_group(id: "7329570140695640028"){
    id 
		type_id
		name
		parent {
			object{
    id
        }
      
		},
		subject {
			object{
      id
        user_id
        email{
          email
        }
        fullname{
          first_name
          last_name
        }
        group{
          object{
            name
          }
        }
      } 
		}
  }
  }
`