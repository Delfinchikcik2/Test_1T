<template>
  <q-page>
    <table class="styled-table">
      <thead>
        <tr>
          <th class="fio-header">
            <div class="fio-header-content">
              ФИО
              <q-btn icon="add_circle_outline" class="add-user-btn" @click="invitePopUp = !invitePopUp" flat round size="sm" />
            </div>
          </th>
          <th>Email</th>
          <th>Группы</th>
        </tr>
      </thead>
      <div v-if="groupLoading" class="loading">Загрузка...</div>
      <div v-else-if="groupError" class="error">Ошибка загрузки данных: {{ groupError.message }}</div>
      <tbody v-else-if="groupSubject">
        <tr v-for="subject in groupSubject" :key="subject.user_id">
          <td>{{ subject.name }} {{ subject.surname }}</td>
          <td>{{ subject.email }}</td>
          <td>
            <ul class="group-list">
              <li v-for="group in subject.goups" :key="group.name">{{ group.name }}</li>
            </ul>
          </td>
        </tr>
      </tbody>
      <div v-else class="no-data">Нет данных для отображения.</div>
    </table>
    <invite-user-form v-model:invitePopUp="invitePopUp" @invite-success="onInviteSuccess" @reset="onReset" />
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue';
import { GET_GROUP_WITH_SUBJECT } from 'src/querys/groupQuery';
import { useQuery} from '@vue/apollo-composable';
import { useRoute } from 'vue-router';
import InviteUserForm from 'src/components/InviteUserForm.vue';

const route = useRoute()
let variable = ref({
  id: route.params.id
})
watch(() => route.params.id, (newId) => {
  variable.value.id = newId
  refetch()
})

const groupSubject = ref()
const invitePopUp = ref(false)

const { result: groupResult, loading: groupLoading, error: groupError, refetch } = useQuery(GET_GROUP_WITH_SUBJECT, variable, {
  fetchPolicy: 'no-cache'
});

watch(groupLoading, (isgroupLoading) => {
  if (isgroupLoading) return;
  loadGroupSybject();
});

const loadGroupSybject = () => {
  groupSubject.value = groupResult.value.get_group.subject.map(item => ({
    user_id: item.object.user_id,
    email: item.object.email?.email,
    name: item.object.fullname?.first_name,
    surname: item.object.fullname?.last_name,
    goups: item.object.group?.map(item => ({
      name: item.object?.name
    }))
  }))
}
const onInviteSuccess = () => {
  refetch();
};

const onReset = () => {
  console.log("Form reset");
};
</script>