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
    <q-dialog v-model="invitePopUp" :position="position" class="float-center">
      <q-card class="q-mx-auto q-mt-xl">
        <div class="q-pa-md" style="max-width: 600px">
          <div class="inviteForm_title">Приглашение нового пользователя в группу</div>
          <q-form @submit="sendInvite" @reset="onReset" class="q-gutter-md">

            <q-input filled v-model="name" label="Имя" hint="Имя пользователя" lazy-rules
              :rules="[val => val && val.length > 0 || 'Вы ничего не ввели']" />
              
              <q-input filled v-model="surname" label="Фамилия" hint="Фамилия пользователя" lazy-rules
              :rules="[val => val && val.length > 0 || 'Вы ничего не ввели']" />

            <q-input filled type="email" v-model="email" label="E-mail" hint="Email пользователя" lazy-rules :rules="[
              val => val !== null && val !== '' || 'Введите что-то',
              val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Введите корректрный email'
            ]" />

            <div class="q-mt-md">
              <q-btn label="пригласить" type="submit" color="primary" />
              <q-btn label="Очистить поля" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>

        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue';
import { GET_GROUP_WITH_SUBJECT } from 'src/querys/groupQuery';
import { INVITE_USER_IN_GROUP } from 'src/querys/mutations';
import { useQuery,useMutation } from '@vue/apollo-composable';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar()
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
const position = ref("standard")
const name = ref('')
const surname = ref('')
const email = ref('')

const onReset= ()=>{
  name.value = ''
  surname.value = ''
  email.value = ''
}

const { result: groupResult, loading: groupLoading, error: groupError, refetch } = useQuery(GET_GROUP_WITH_SUBJECT, variable, {
  fetchPolicy: 'no-cache'
});
const { mutate: inviteUser} = useMutation(INVITE_USER_IN_GROUP);

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
const sendInvite = async () => {
  const inviteVariable = {
    input: {
      name: name.value,
      surname: surname.value,
      email: email.value,
      group_id: route.params.id,
    }
  };

  try {
    await inviteUser(inviteVariable);
    invitePopUp.value = false;
        $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'assignment_turned_in',
            message: 'Пользователь добавлен'
        });
        refetch({id: route.params.id})
  } catch (error) {
    console.error('Error inviting user:', error.message);
  }
};
</script>