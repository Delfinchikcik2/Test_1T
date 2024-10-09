import gql from "graphql-tag";

export const CREATE_PREMISSION = gql`
mutation permissionRuleCreate($input: PermissionRuleCreateInput!) {
	permissionRuleCreate(input: $input) {
		recordId
		status
		record {
			id
			author_id
			level
			model_type
			model_id
			config
			owner_id
			owner_type
			created_at
			updated_at
		}
	}
}
`

export const UPDATE_PREMISSION = gql`
mutation permissionRuleUpdate($input: PermissionRuleUpdateInput!) {
	permissionRuleUpdate(input: $input) {
		recordId
		status
		record {
			id
			author_id
			level
			model_type
			model_id
			config
			owner_id
			owner_type
			created_at
			updated_at
		}
	}
}
`