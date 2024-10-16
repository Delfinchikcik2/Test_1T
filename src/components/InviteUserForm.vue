<template>
    <q-dialog v-model="invitePopUpDialog" :position="position" class="float-center">
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
              val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Введите корректрный email' ]" />
  
            <div class="q-mt-md">
              <q-btn label="пригласить" type="submit" color="primary" />
              <q-btn label="Очистить поля" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </div>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, watch} from 'vue';
  import { useMutation } from '@vue/apollo-composable';
  import { INVITE_USER_IN_GROUP } from 'src/querys/mutations';
  import { useQuasar } from 'quasar';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const $q = useQuasar();

  const emit = defineEmits(['invite-success', 'reset', 'update:invitePopUp']);

  const props = defineProps({
  invitePopUp: Boolean,
});
const invitePopUpDialog = ref(props.invitePopUp)
watch(() => props.invitePopUp, (newVal) => {
  invitePopUpDialog.value = newVal;
});
  const position = ref("standard");
  const name = ref('');
  const surname = ref('');
  const email = ref('');
  
  const { mutate: inviteUser } = useMutation(INVITE_USER_IN_GROUP);
  
  const onReset = () => {
    name.value = '';
    surname.value = '';
    email.value = '';
    emit('reset');  
  };
  
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
      emit('update:invitePopUp', false); 
      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'assignment_turned_in',
        message: 'Пользователь добавлен'
      });
      emit('invite-success');
    } catch (error) {
      console.error('Error inviting user:', error.message);
    }
  };
  </script>
  