<template>
    <q-page>
        <table class="styled-table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Исполнитель</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tr v-if="tasksLoading">
          <td colspan="4" class="loading">Загрузка...</td>
        </tr>
        <tr v-else-if="tasksError">
          <td colspan="4" class="error">Ошибка загрузки данных: {{ moduleError.message }}</td>
        </tr>
            <tbody v-else-if="tasksResult && statusOption.length > 1">
                <tr v-for="task in tasks" :key="task.id" :style="{backgroundColor: getTaskColor(task.status)}" class="module-row">
                    <td>
                        <q-btn class="edit-btn-cell" dense flat icon="edit" @click="editTask(task)" />
                        {{ task.name }}
                    </td>
                    <td>{{ task.description }}</td>
                    <td>{{ task.executor_fullname }}</td>
                    <td>{{getTaskStatusName(task.status) }}</td>
                </tr>
                <tr v-if="newTask">
            <td>
              <q-input v-model="newTask.name" label="Название" disable />
            </td>
            <td>
                <q-input v-model="newTask.description" label="Описание" type="text" disable />
            </td>
            <td>
                <q-select v-model="newTask.executor_id" :options="executorOptions" option-value="id"
                  option-label="fullname" label="Исполнитель" disable />
            </td>
            <td>
              <q-select v-if="updateBtn" v-model="newTask.default_status" :options="statusOption" option-value="id"
                  option-label="label" label="Статус" />
            </td>

          </tr>
            </tbody>
            <div v-else class="no-data">Нет данных для отображения.</div>
        </table>
        <div v-if="updateBtn" class="save-module-btn">
            <q-btn class="btnSpaces" label="Обновить статус" color="green" @click="updateTaskStatus" />
            <q-btn class="btnSpaces" label="Отмена" color="red" @click="resetSave" />
        </div>
    </q-page>
</template>

<script setup>
import { useMutation, useQuery } from '@vue/apollo-composable';
import { GET_EXECUTOR} from 'src/querys/groupQuery';
import {PAGINATE_TASKS, TASK_STATUS_PROPERTI, UPDATE_TASK } from 'src/querys/tasksQuery';
import { ref, watch } from 'vue';

const tasks = ref([])
const newTask = ref(null)
const updateBtn = ref(false)
const statusOption = ref([])
const subjects = ref(null)
const executorOptions = ref(null)

const { result: tasksResult, loading: tasksLoading, refetch: refetchTasks } = useQuery(PAGINATE_TASKS, {}, { fetchPolicy: 'no-cache' });
const { result: StatusResult, loading: StatusLoading } = useQuery(TASK_STATUS_PROPERTI, {}, { fetchPolicy: 'no-cache' });
const { result: subjectResult, loading: subjectLoading, error: subjectError } = useQuery(GET_EXECUTOR, {}, {fetchPolicy: 'no-cache'});


watch([tasksLoading, StatusLoading, subjectLoading], ([isTasksLoading, isStatusLoadung, isSubjectLoading]) => {
    if (isTasksLoading) return
    console.log(tasksResult.value);
    loadTasks()
    if (isStatusLoadung) return
    statusOption.value = StatusResult.value.property?.meta?.options.map(item => ({
        label: item.label,
        id: item.id,
        color: item.color
    }))
    if (isSubjectLoading) return
    setSubject()
});

const setSubject = () => {
    console.log("getGroup ",subjectResult);
    
  subjects.value = subjectResult.value?.get_group?.subject?.map(subject => ({
    id: subject?.object?.id,
    name: subject?.object?.fullname?.first_name,
    last_name: subject?.object?.fullname?.last_name
  }))
  executorOptions.value = subjects.value.map(item => ({
    id: item.id,
    fullname: `${item.name} ${item.last_name}`
  }))
}

const loadTasks = () => {
    tasks.value = tasksResult.value.paginate_type2.data.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        executor_id: task.executor?.object?.id,
        executor_fullname: `${task.executor?.object?.fullname?.first_name} ${task.executor?.object?.fullname?.last_name}`,
        status: task.task_status
    })
    )
}

const getTaskStatusName = (statusId)=>{
    console.log(statusId);
    
    const status = statusOption.value.find(item => item.id == statusId)
    console.log(status);
    
    return status ? status.label : "Неизвестно";
}

const getTaskColor = (statusId)=>{
    const status = statusOption.value.find(item => item.id == statusId)
    return status ? status.color : "grey"
}

const{mutate: taskUpdate, onDone: doneUpdate} = useMutation(UPDATE_TASK)

const updateTaskStatus = ()=>{
    const statusId = (statusId)=>{
        console.log("statusId ",statusId);
        console.log(statusOption.value);
        
       const status = statusOption.value.find(item => item.label == statusId)
       console.log("statuusss ",status);
        return status.id
    }
   
const variable = {
    input:{
        task_status: statusId(newTask.value.default_status.label),
        name: newTask.value.name 
    },
    id: newTask.value.id
}
console.log(variable);

try{
    taskUpdate(variable)
    doneUpdate(() => {
      refetchTasks()
    })
    updateBtn.value = false
    newTask.value = null
} catch (error)
{
    console.log("Error update task status", error);
}
}

const resetSave = () => {
  newTask.value = null
  updateBtn.value = false
}

const editTask = (task)=>{
    newTask.value = {
    id: task.id,
    name: task.name,
    description: task.description,
    executor_id: task.executor_fullname,
    default_status: getTaskStatusName(task.status)
}
updateBtn.value = true
}
</script>