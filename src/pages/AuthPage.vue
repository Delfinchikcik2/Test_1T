<template>
    <div class="q-pa-md q-mx-auto" style="max-width: 400px">
        <q-card>
            <q-card-section>
                <div class="text-h4 text-center q-py-md">
                    Авторизация
                </div>
            </q-card-section>
            <q-form 
                prevent 
                @submit.prevent="onSubmit"
                @reset="onReset"
                class="q-gutter-md"
            >
                <q-input
                    filled
                    type="email"
                    v-model="email"
                    label="Your email *"
                    hint="email"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || 'Please type something']"
                />
                <q-input
                    filled
                    type="password"
                    v-model="password"
                    label="Your password"
                    lazy-rules
                    :rules="[val => val !== null && val !== '' || 'Please type your password']"
                />
                <q-toggle v-model="accept" label="I accept the license and terms" />
                <div>
                    <q-btn label="Submit" type="submit" color="primary"/>
                    <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
            </q-form>
        </q-card>
    </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable';
import { LOGIN } from 'src/querys/mutations';
import { useUserStore } from 'src/stores/user-info';
import { useRouter } from 'vue-router';
const $q = useQuasar()

const email = ref(null)
const password = ref(null)
const accept = ref(false)

const data = ref({})
const router = useRouter();

const {setUserId, setToken} = useUserStore()

const { mutate: login } = useMutation(LOGIN);

const onSubmit = async () => {
    if (accept.value !== true) {
        $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Вы должны принять условия лицензии и соглашения'
        });
        return; 
    }

    if (!email.value || !password.value) {
        $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Пожалуйста, введите логин и пароль'
        });
        return;
    }

    try {
        const variables = {
            input: {
                login: email.value,
                password: password.value
            }
        };

        data.value = await login(variables);
        console.log(data.value);
        const token = data.value.data.userSignIn.record.access_token;
        console.log("Access Token:", token);
        const user_id = data.value.data.userSignIn.recordId
        setUserId(user_id);
        setToken(token)
        
        $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Пользователь ${user_id} авторизован`
        });
        router.push('/index')
    } catch (e) {
        $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'error',
            message: 'Ошибка: ' + e.message
        });
    }
}

const onReset = () => {
    email.value = null;
    password.value = null;
    accept.value = false;
}
</script>
