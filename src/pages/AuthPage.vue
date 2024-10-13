<template>
    <div class="q-pa-md q-mx-auto q-my-auto" style="max-width: 400px">
        <q-card>
            <q-card-section>
                <div class="text-h4 text-center q-py-md">
                    Авторизация
                </div>
            </q-card-section>
            <q-form prevent @submit.prevent="onSubmit" @reset="onReset" class="q-gutter-md">
                <q-input filled type="email" v-model="email" label="Your email *" hint="email" lazy-rules
                    :rules="[val => val && val.length > 0 || 'Please type something']" />
                <q-input filled type="password" v-model="password" label="Your password" lazy-rules
                    :rules="[val => val !== null && val !== '' || 'Please type your password']" />
                <q-toggle v-model="accept" label="I accept the license and terms" />
                <div>
                    <q-btn v-if="loading" color="primary"><q-circular-progress class="text-center" color="white" indeterminate rounded/></q-btn>
                    <q-btn v-else label="Войти" type="submit" color="primary" />
                    <q-btn label="Сброс" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
            </q-form>
        </q-card>
    </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import { LOGIN } from 'src/querys/mutations';
import { useUserStore } from 'src/stores/user-info';
import { useRouter } from 'vue-router';
import { GET_GROUP, GET_SUBJECT } from 'src/querys/roleQuery';
const $q = useQuasar()

const email = ref(null)
const password = ref(null)
const accept = ref(false)
let role = ''


const data = ref({})
const router = useRouter();

const { setUserId, setToken, setUserRole, setSubjectId } = useUserStore()

const { mutate: login, loading } = useMutation(LOGIN);
const { load: loadSubject } = useLazyQuery(GET_SUBJECT, {}, { fetchPolicy: 'no-cache' });
const { load: loadsubjectGroup } = useLazyQuery(GET_GROUP, {}, { fetchPolicy: 'no-cache' });


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
        if (user_id != "9053154177139198689") {
            if (token) {
                await subjectLoad(user_id)
            }
        } else {
            role = 'owner';
            setUserRole(role)
        }
        $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Пользователь авторизован`
        });
        router.push('/')
    } catch (e) {
        $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'error',
            message: 'Ошибка: ' + e.message
        });
    }
}

const subjectLoad = async (id) => {
    const variable = {
        where: {
            column: "6631417272309988419",
            operator: "EQ",
            value: id
        }
    }
    console.log(variable);

    try {
        const data = await loadSubject(GET_SUBJECT, variable)
        if (data) {
            console.log("subject result ",data);
            setSubjectId(data.paginate_subject?.data[0]?.id)
            const groupId = data.paginate_subject?.data[0]?.group[0]?.object?.id
            if (!groupId) return
            await getRole(groupId)
        }

    } catch (error) {
        console.log("subject load error ", error)
    }
}

const getRole = async (id) => {
    const variable = {
        id: id
    }
    try {
        const groupName = await loadsubjectGroup(GET_GROUP, variable)
        console.log(groupName);
        const name = groupName.get_group.name
        console.log(name);

        if (name) {
            if (name == "Ответственные") role = 'responsible'
            else if (name == "Исполнители") role = 'executor'
            else role = 'user'
        }
        setUserRole(role)
    } catch (error) {
        console.log("get role error ", error)
    }
}

const onReset = () => {
    email.value = null;
    password.value = null;
    accept.value = false;
}
</script>
