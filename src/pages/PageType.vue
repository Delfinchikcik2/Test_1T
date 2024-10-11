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
      <tr v-if="moduleLoading">
          <td colspan="4" class="loading">Загрузка...</td>
        </tr>
        <tr v-else-if="moduleError">
          <td colspan="4" class="error">Ошибка загрузки данных: {{ moduleError.message }}</td>
        </tr>
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
import { ref, watch } from 'vue';
import { CREATE_MODULE, PAGINATE_MODULE, UPDATE_MODULE } from 'src/querys/moduleQuery';
import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import { useQuasar } from 'quasar';
import { CREATE_PAGE } from 'src/querys/pageQuery';
import { useRoute } from 'vue-router';
import { CREATE_PREMISSION, MANY_PREMISSION_RULES, PREMISSION_TREE_SUBJECTS } from 'src/querys/premissionQuery';
import { GET_RESPONSIBLES } from 'src/querys/groupQuery';
import { TASK_STATUS_PROPERTI } from 'src/querys/tasksQuery';

const $q = useQuasar()
const route = useRoute()
const createBtn = ref(false);
const saveBtn = ref(false)
const updateBtn = ref(false)
const modules = ref([]);
const newModule = ref(null);
const subjects = ref([])
const subjectOptions = ref([])
const statusOption = ref(null)

const { result: subjectResult, loading: subjectLoading, error: subjectError } = useQuery(GET_RESPONSIBLES, {}, {fetchPolicy: 'no-cache'});
const { result: moduleResult, loading: moduleLoading, error: moduleError, refetch: refetchModule } = useQuery(PAGINATE_MODULE, {}, {fetchPolicy: 'no-cache'});
const {load: premissionTree, result: premissionTreeResult, loading: premissionTreeLoading} = useLazyQuery(PREMISSION_TREE_SUBJECTS, {}, {fetchPolicy: 'no-cache'});
const { result: StatusResult, loading: StatusLoading } = useQuery(TASK_STATUS_PROPERTI, {}, { fetchPolicy: 'no-cache' });

watch([moduleLoading, subjectLoading, StatusLoading], ([isModuleLoading, isSubjectLoading, isStatusLoadung]) => {
  if (isStatusLoadung) return
    statusOption.value = StatusResult.value.property?.meta?.options.map(item => ({
        label: item.label,
        id: item.id,
        color: item.color
    }))
    console.log("Options ",statusOption);
  if (isModuleLoading) return;
  if(moduleResult){
    loadModule();
  }
  if (isSubjectLoading) return
  setSubject()
});

const setSubject = () => {
  subjects.value = subjectResult.value?.get_group?.subject?.map(subject => ({
    id: subject?.object?.id,
    name: subject?.object?.fullname?.first_name,
    last_name: subject?.object?.fullname?.last_name
  }))
  subjectOptions.value = subjects.value.map(item => ({
    id: item.id,
    fullname: `${item.name} ${item.last_name}`
  }))
}

const loadModule = () => {
  console.log("module Result ",moduleResult.value);
  
  modules.value = moduleResult.value.paginate_type1.data.map(module => {
    const statusCount = {
      assigned: 0,
      completed: 0,
      closed: 0
    };
    const getStatusById = (statusId) => {
      return statusOption.value.find(status => status.id === statusId) || { label: "Неизвестен", color: "gray" };
    };

    const tasks = module?.responsible?.map(task => {
      const taskStatusId = task?.object?.task_status;

      const status = getStatusById(taskStatusId);

   
      if (status.id === statusOption.value[0].id) { 
        statusCount.assigned++;
      } else if (status.id === statusOption.value[1].id) { 
        statusCount.completed++;
      } else if (status.id === statusOption.value[2].id) {
        statusCount.closed++;
      }

      return {
        id: task?.object?.id,
        name: task?.object?.name,
        status: status?.label,   
        color: status?.color  
      };
    });

    return {
      name: module?.name,
      id: module?.id,
      start_date: module?.start_date,
      end_date: module?.end_date,
      responsible_now: module?.responsible_id?.object?.id,
      fullname: `${module?.responsible_id?.object?.fullname?.first_name}  ${module?.responsible_id?.object?.fullname?.last_name}`,
      tasks: tasks,
      statusCount: statusCount
    };
  });
  createBtn.value = true,
  console.log(modules.value);
  
}

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
const { mutate: createPremissionForModulesPage, onDone: doneModulesPagePremission } = useMutation(CREATE_PREMISSION)

//Создание модуля с установкой доступов Начало
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
        addModulesPagePremission()
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

const addModulesPagePremission = ()=>{
  const pagePremissionVariable = {
    input: {
      model_type: "page",
      model_id: "5955448239736382426",
      owner_type: "subject",
      owner_id: newModule.value.responseble_id.id,
      level: 5
    }
  }
  try {
    createPremissionForModulesPage(pagePremissionVariable)
    doneModulePremission((modulesPageResult)=>{
      if(modulesPageResult){
        console.log("ModulesPageResult", modulesPageResult);
      }
    })
  } catch (error) {
    
  }
}
//Создание модуля с установкой доступов Конец

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
    responsible_now: item.responsible_now,
    responseble_id: null,
    start_date: formatDateForInput(item.start_date),
    end_date: formatDateForInput(item.end_date),
    tasks: item.tasks,
    statusCount: item.statusCount
  };
  createBtn.value = false
  updateBtn.value = true
}

const { mutate: fetchUpdate } = useMutation(UPDATE_MODULE, {}, {fetchPolicy: 'no-cache'})
const {mutate: setManyPremission, onDone: doneManyPremission} = useMutation(MANY_PREMISSION_RULES, {}, {fetchPolicy: 'no-cache'})

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
   premissionTreeResult.value = await checkPremissionTree(newModule.value.id, "object")
    if(premissionTreeResult.value){
      console.log(premissionTreeResult.value);
        console.log(newModule.value.responsible_now);   
      const oldPremissionRule = premissionTreeResult.value?.permissionTreeSubjects?.data.find(subject => subject?.subject_id == newModule.value.responsible_now)
      if(oldPremissionRule){
        console.log("oldRule ",oldPremissionRule);
        
      await createManyPremissions("object", newModule.value.id, oldPremissionRule.permission_rule_id)
      doneManyPremission((result) =>{
         fetchUpdate(variable)
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'assignment_turned_in',
          message: `Модуль "${variable.input.name}" обновлен `
        });
        })
      }
      await refetchModule()
      updateBtn.value = false
      newModule.value = null
    }

  } catch (error) {
    console.log("Error update module", error);

  }
}

const createManyPremissions = async (modelType, modelId, oldIdRules)=>{
  const variable = {
    input: {
      model_type: modelType,
      model_id: modelId,
      apply_to_children:false,
      collection_to_delete:[
         oldIdRules
      ],
      collection_to_create:[
         {
          owner_type: "subject",
          owner_id: newModule.value.responseble_id.id,
          level: 6
         }
      ]
   }
  }
  console.log("Many variable", variable);
try {
  if(variable){
    await setManyPremission(variable)
  }
} catch (error) {
  console.log("Error createManyPremissions", error);
}
}

const checkPremissionTree = async (id, type)=>{
  const variable ={
    modelId: id,
    modelType: type,
    groupId:"7329570140695640028"
  }
  try {
   premissionTreeResult.value = await premissionTree(PREMISSION_TREE_SUBJECTS,variable)
    return premissionTreeResult.value
  
  } catch (error) {
    console.log("Error check premision", error);
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
