import gql from "graphql-tag";

export const PREMISSION_TREE_SUBJECTS = gql`
query permissionTreeSubjects(
	$perPage: Int
	$page: Int
	$modelId: String!
	$modelType: String!
	$groupId: String!
) {
	permissionTreeSubjects(
		perPage: $perPage
		page: $page
		modelId: $modelId
		modelType: $modelType
		groupId: $groupId
	) {
		data {
			subject_id
			level
			permission_rule_id
            name
			surname
      config
		}
	}
}

`

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
export const MANY_PREMISSION_RULES = gql`
mutation manyPermissionRulesMutation($input: permissionRulesMutationInput) {
	manyPermissionRulesMutation(input: $input) {
		created {
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
		updated {
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
		status
	}
}

`
