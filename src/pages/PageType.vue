<template>
  <q-page>
    <table class="styled-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Ответственный</th>
          <th>Дата начала</th>
          <th>Дата окончания</th>
          <th>Статус</th>
        </tr>
      </thead>
      <div v-if="moduleLoading" class="loading">Загрузка...</div>
      <div v-else-if="moduleError" class="error">Ошибка загрузки данных: {{ moduleError.message }}</div>
      <tbody v-else-if="moduleResult">
        <tr v-for="module in modules" :key="module.id" class="module-row">
          <td>
            <q-btn class="edit-btn-cell" dense flat icon="edit" @click="editModule(module)" />
            {{ module.name }}
          </td>
          <td>{{ module.fullname }}</td>
          <td>{{ module.start_date }}</td>
          <td>{{ module.end_date }}</td>
          <td>
            Назначено задач: {{ module.statusCount.assigned }}<br>
            Выполнено задач: {{ module.statusCount.completed }}<br>
            Завершено задач: {{ module.statusCount.closed }}
          </td>
        </tr>
        <tr v-if="newModule">
          <td>
            <q-input v-model="newModule.name" label="Название" />
          </td>
          <td>
            <q-select v-model="newModule.responseble_id" :options="subjectOptions" option-value="id"
              option-label="fullname" label="Ответственный" />
          </td>
          <td>
            <q-input v-model="newModule.start_date" label="Дата начала" type="date" />
          </td>
          <td>
            <q-input v-model="newModule.end_date" label="Дата окончания" type="date" />
          </td>
          <td>
          </td>
        </tr>
      </tbody>
      <div v-else class="no-data">Нет данных для отображения.</div>
    </table>
    <div v-if="createBtn" class="create-module-btn">
      <q-btn label="Создать модуль" color="secondary" @click="addNewModuleRow" />
    </div>
    <div v-if="saveBtn" class="save-module-btn">
      <q-btn class="btnSpaces" label="Сохранить модуль" color="green" @click="createModule" />
      <q-btn class="btnSpaces" label="Отмена" color="red" @click="resetSave" />
    </div>
    <div v-if="updateBtn" class="save-module-btn">
      <q-btn class="btnSpaces" label="Обновить модуль" color="green" @click="updateModule" />
      <q-btn class="btnSpaces" label="Отмена" color="red" @click="resetSave" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { CREATE_MODULE, PAGINATE_MODULE, UPDATE_MODULE } from 'src/querys/moduleQuery';
import { PAGINATE_SUBJECT } from 'src/querys/getQuery';
import { useMutation, useQuery } from '@vue/apollo-composable';
import { useQuasar } from 'quasar';
import { CREATE_PAGE } from 'src/querys/pageQuery';
import { useRoute } from 'vue-router';
import { CREATE_PREMISSION } from 'src/querys/premissionQuery';

const $q = useQuasar()
const route = useRoute()
const createBtn = ref(false);
const saveBtn = ref(false)
const updateBtn = ref(false)
const modules = ref([]);
const newModule = ref(null);
const subjects = ref([])
const subjectOptions = ref([])

const { result: subjectResult, loading: subjectLoading, error: subjectError } = useQuery(PAGINATE_SUBJECT, {}, {
  fetchPolicy: 'no-cache'
});
const { result: moduleResult, loading: moduleLoading, error: moduleError, refetch: refetchModule } = useQuery(PAGINATE_MODULE, {}, {
  fetchPolicy: 'no-cache'
});

const statusMapping = {
  "4641784570903815283": "Назначена",
  "6701794464592581049": "Выполнена",
  "7297881024668946688": "Завершена"
};

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await refetchModule()
    setSubject()
  }
})

watch([moduleLoading, subjectLoading], ([isModuleLoading, isSubjectLoading]) => {
  if (isModuleLoading) return;
  loadModule();
  if (isSubjectLoading) return
  setSubject()
});

const setSubject = () => {
  subjects.value = subjectResult.value.paginate_subject.data.map(subject => ({
    id: subject?.id,
    type_id: subject?.type_id,
    name: subject?.fullname?.first_name,
    last_name: subject?.fullname?.last_name
  }))
  subjectOptions.value = subjects.value.map(item => ({
    id: item.id,
    fullname: `${item.name} ${item.last_name}`
  }))
}

const loadModule = () => {
  modules.value = moduleResult.value.paginate_type1.data.map(module => {
    const statusCount = {
      assigned: 0,
      completed: 0,
      closed: 0
    };

    const tasks = module?.responsible?.map(task => {
      const taskStatusId = task?.object?.task_status;
      if (taskStatusId === "4641784570903815283") {
        statusCount.assigned++;
      } else if (taskStatusId === "6701794464592581049") {
        statusCount.completed++;
      } else if (taskStatusId === "7297881024668946688") {
        statusCount.closed++;
      }

      return {
        id: task?.object?.id,
        name: task?.object?.name,
        status: statusMapping[taskStatusId] || "Неизвестен"
      };
    });

    return {
      name: module?.name,
      id: module?.id,
      start_date: module?.start_date,
      end_date: module?.end_date,
      fullname: `${module?.responsible_id?.object?.fullname?.first_name}  ${module?.responsible_id?.object?.fullname?.last_name}`,
      tasks: tasks,
      statusCount: statusCount
    };
  });

  createBtn.value = true
};

const resetInputModule = () => {
  newModule.value = {
    id: '',
    name: '',
    responseble_id: null,
    start_date: '',
    end_date: '',
    tasks: [],
    statusCount: []
  };
}

const addNewModuleRow = () => {
  resetInputModule()
  createBtn.value = false
  saveBtn.value = true
};
const { mutate: queryCreate, onDone: doneCreate } = useMutation(CREATE_MODULE)
const { mutate: createPage, onDone: donePage } = useMutation(CREATE_PAGE)
const { mutate: createPremissionForModule, onDone: doneModulePremission } = useMutation(CREATE_PREMISSION)
const { mutate: createPremissionForPage, onDone: donePagePremission } = useMutation(CREATE_PREMISSION)

const createModule = async () => {
  const variable = {
    input: {
      name: newModule.value.name,
      responsible_id: {
        "6414058648113056419": {
          objectId: newModule.value.responseble_id.id
        }
      },
      start_date: formatDate(newModule.value.start_date),
      end_date: formatDate(newModule.value.end_date),
    }
  }
  if (newModule.value) {
    try {
      queryCreate(variable)
      doneCreate((resultModule) => {
        if (resultModule) {
          console.log("ResultModule ",resultModule.data);
          createModulePremission(resultModule.data)
        }
      })
    }
    catch (error) {
      console.error('Error create module:', error.message);
    }
  }
};

const createModulePremission = (resultModule) => {
  let modulePremissionVariable = {
    input: {
      model_type: "object",
      model_id: resultModule.create_type1.record.id,
      owner_type: "subject",
      owner_id: newModule.value.responseble_id.id,
      level: 6
    }
  }
  try{
    createPremissionForModule(modulePremissionVariable)
    doneModulePremission((resultPremission) => {
      if (resultPremission) {
        console.log("ResultPemission Module ",resultPremission.data);
        createModulePage(resultModule)
      }
    })
  } catch (error){
    console.log("Error create premission for module:", error.message);
    
  }
}

const createModulePage = (createResult) => {
  const pageVariable = {
    input: {
      parent_id: route.params?.id,
      page_type: 'table',
      title: newModule.value.name,
      object: {
        id: createResult.create_type1?.record?.id,
        type_id: "3820285012994084460"
      }
    }
  }
  try {
    createPage(pageVariable)
    donePage((pageResult) => {
      console.log("PageResult ", pageResult.data);
      createPagePremission(pageResult.data)
    })
  } catch (error) {
    console.log( "Error create page:", error.message);
  }
}

const createPagePremission = (pageResult) => {
  let pagePremissionVariable = {
    input: {
      model_type: "page",
      model_id: pageResult.pageCreate?.record.id,
      owner_type: "subject",
      owner_id: newModule.value.responseble_id?.id,
      level: 6
    }
  }
  try{
    createPremissionForPage(pagePremissionVariable)
    donePagePremission((resultPremission) => {
      if(resultPremission){
        console.log("ResultPremission Page", resultPremission);
        newModule.value = null;
        refetchModule()
        saveBtn.value = false
      }
    })
  } catch (error){
    console.log("Error create premission for page:", error.message);
  }
}

const resetSave = () => {
  newModule.value = null
  saveBtn.value = false
  createBtn.value = true
  updateBtn.value = false
}

const editModule = (item) => {
  console.log(item);

  newModule.value = {
    id: item.id,
    name: item.name,
    responseble_id: null,
    start_date: formatDateForInput(item.start_date),
    end_date: formatDateForInput(item.end_date),
    tasks: item.tasks,
    statusCount: item.statusCount
  };
  createBtn.value = false
  updateBtn.value = true
}
const { mutate: fetchUpdate } = useMutation(UPDATE_MODULE)
const updateModule = async () => {
  const variable = {
    input: {
      name: newModule.value.name,
      responsible_id: {
        "6414058648113056419": {
          objectId: newModule.value.responseble_id.id
        }
      },
      start_date: formatDate(newModule.value.start_date),
      end_date: formatDate(newModule.value.end_date),
    },
    id: newModule.value.id

  }
  console.log(variable);
  try {
    await fetchUpdate(variable)
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'assignment_turned_in',
      message: `Модуль "${variable.input.name}" обновлен `
    });
    await refetchModule()
    updateBtn.value = false
    newModule.value = null
  } catch (error) {
    console.log("Error update module", error);

  }
}

const formatDate = (date) => {
  const d = new Date(date);
  let day = '' + d.getDate();
  let month = '' + (d.getMonth() + 1);
  const year = d.getFullYear();

  if (day.length < 2) day = '0' + day;
  if (month.length < 2) month = '0' + month;

  return [day, month, year].join('.');
};
const formatDateForInput = (dateString) => {
  const [day, month, year] = dateString.split('.').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
</script>

<style>
.create-module-btn {
  margin: 30px 45%;
}

.save-module-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.btnSpaces {
  margin-top: 20px;
}

.module-row {
  position: relative;
}

.edit-btn-cell {
  position: absolute;
  top: 20%;
  left: -50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>