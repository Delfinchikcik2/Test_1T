<template>
    <q-page>
      <task-table>
        <template v-if="tasksLoading">
          <tr>
            <td colspan="4" class="loading">Загрузка...</td>
          </tr>
        </template>
        <template v-else-if="tasksError">
          <tr>
            <td colspan="4" class="error">Ошибка загрузки данных: {{ tasksError.message }}</td>
          </tr>
        </template>
        <template v-else-if="tasksResult && statusOption.length > 1">
          <task-row v-for="task in tasks" :key="task.id" :task="task" :editTask="editTask"
                    :getTaskColor="getTaskColor" :getTaskStatusName="getTaskStatusName" />
          <task-form v-if="newTask && role == 'responsible'" :newTask="newTask" :executorOptions="executorOptions" :save-btn="saveBtn"
                     :filteredStatusOptions="filteredStatusOption" :isDisabled="statusDisabled"  @update:newTask="updateNewTask"/>
          <task-form v-if="newTask && role == 'owner'" :newTask="newTask" :executorOptions="executorOptions" :save-btn="saveBtn"
                     :filteredStatusOptions="filteredStatusOption" :updateBtn="updateBtn"  @update:newTask="updateNewTask"/>
        </template>
        <div v-else class="no-data">Нет данных для отображения.</div>
      </task-table>
      <div v-if="createBtn" class="create-module-btn">
            <q-btn label="Создать задачу" color="secondary" @click="addNewTasksRow" />
        </div>
        <div v-if="saveBtn" class="save-module-btn">
            <q-btn class="btnSpaces" label="Создать задачу" color="green" @click="createTask" />
            <q-btn class="btnSpaces" label="Отмена" color="red" @click="resetSave" />
        </div>
      <div v-if="updateBtn" class="save-module-btn">
        <q-btn class="btnSpaces" label="Обновить статус" color="green" @click="updateTask" />
        <q-btn class="btnSpaces" label="Отмена" color="red" @click="resetSave" />
      </div>
    </q-page>
  </template>

<script setup>
import { useMutation, useQuery, useLazyQuery } from '@vue/apollo-composable';
import { GET_EXECUTOR, GET_GROUP_WITH_SUBJECT } from 'src/querys/groupQuery';
import { GET_PAGE } from 'src/querys/pageQuery';
import { CREATE_PREMISSION, MANY_PREMISSION_RULES } from 'src/querys/premissionQuery';
import { CREATE_TASK, PAGINATE_TASKS, TASK_STATUS_PROPERTI, UPDATE_TASK } from 'src/querys/tasksQuery';
import { useUserStore } from 'src/stores/user-info';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import TaskTable from 'src/components/TaskTable.vue';
import TaskRow from 'src/components/TaskRow.vue';
import TaskForm from 'src/components/TaskForm.vue';

const tasks = ref([])
const newTask = ref(null)
const createBtn = ref(false);
const saveBtn = ref(false)
const updateBtn = ref(false)
const statusOption = ref([])
const filteredStatusOption = ref([])
const subjects = ref(null)
const executorOptions = ref(null)
const statusDisabled = ref(false)
const router = useRoute()
const role = useUserStore().getRole()
let variable = ref({
    id: router.params.id
})
watch(() => router.params.id, (newId) => {
    variable.value.id = newId
    refetch()
})

const { result: pageResult, loading: pageLoading, refetch } = useQuery(GET_PAGE, variable, { fetchPolicy: 'no-cache' });
const { load: paginateTasks, result: tasksResult, loading: tasksLoading, refetch: refetchTasks, error: tasksError } = useLazyQuery(PAGINATE_TASKS, {}, { fetchPolicy: 'no-cache' });
const { result: StatusResult, loading: StatusLoading } = useQuery(TASK_STATUS_PROPERTI, {}, { fetchPolicy: 'no-cache' });
const { result: subjectResult, loading: subjectLoading, error: subjectError } = useQuery(GET_EXECUTOR, {}, { fetchPolicy: 'no-cache' });

const updateNewTask = (updatedTask) => {
  newTask.value = updatedTask;
};

watch([pageLoading, tasksLoading, StatusLoading, subjectLoading], async ([isPageLoading, isTasksLoading, isStatusLoadung, isSubjectLoading]) => {
    if (isPageLoading) return
    console.log(pageResult.value);
    const variable = {
        where: {
            column: "8069307079596173140->3820285012994084460->objectId",
            operator: "EQ",
            value: pageResult.value.page?.object?.id
        }
    }
    console.log("variavle", variable);
    await paginateTasks(PAGINATE_TASKS, variable)
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
    createBtn.value = true
}

const getTaskStatusName = (statusId) => {
    const status = statusOption.value.find(item => item.id == statusId)
    return status ? status.label : "Неизвестно";
}

const getTaskColor = (statusId) => {
    const status = statusOption.value.find(item => item.id == statusId)
    return status ? status.color : "grey"
}

const { mutate: taskCreate, onDone: doneCreate } = useMutation(CREATE_TASK);

const refetchTaskPaginator = () => {
    const variable = {
        where: {
            column: "8069307079596173140->3820285012994084460->objectId",
            operator: "EQ",
            value: pageResult.value.page?.object?.id
        }
    }
    refetchTasks(PAGINATE_TASKS, variable)
}
const createTask = () => {
    console.log(newTask.value.default_status);

    const variable = {
        input: {
            name: newTask.value.name,
            description: newTask.value.description,
            task_status: statusId(newTask.value),
            executor: {
                "6414058648113056419": {
                    objectId: newTask.value.executor_id.id
                }
            },
            module: {
                "3820285012994084460": {
                    objectId: pageResult.value.page?.object?.id
                }
            }
        }
    }
    console.log("Task create variable", variable);

    try {
        taskCreate(variable)
        doneCreate((taskResult) => {
            console.log(taskResult);
            if (taskResult) {
                refetchTaskPaginator()
            }
            saveBtn.value = false
            createBtn.value = true
            newTask.value = null
        })
    } catch (error) {
        console.log("Error create task", error);
    }
}

const statusId = (statusId) => {
    console.log(statusId);
    const status = statusOption.value.find(item => item.label == statusId.default_status.label)
    console.log("status", status);
    
    return status?.id !== undefined ? status.id : statusId.defaultSatus;
}

const { mutate: taskUpdate, onDone: doneUpdate } = useMutation(UPDATE_TASK)

const updateTask = () => {
    const variable = {
        input: {
            task_status: statusId(newTask.value),
            name: newTask.value.name,
            description: newTask.value.description,
            executor: {
                "6414058648113056419": {
                    objectId: newTask.value.executor_id.id
                }
            }
        },
        id: newTask.value.id
    }
    console.log("updateTask", variable);

    try {
        taskUpdate(variable)
        doneUpdate(() => {
            refetchTaskPaginator()
        })
        updateBtn.value = false
        newTask.value = null
    } catch (error) {
        console.log("Error update task status", error);
    }
}

const resetInputTask = () => {
    newTask.value = {
        id: '',
        name: '',
        description: '',
        executor_id: null,
        default_status: getTaskStatusName(StatusResult.value.property?.default?.value?.id)
    };
    console.log("NEW TASKKKK ", newTask.value);

}

const addNewTasksRow = () => {
    resetInputTask();
    createBtn.value = false
    saveBtn.value = true
}

const resetSave = () => {
    newTask.value = null
    saveBtn.value = false
    createBtn.value = true
    updateBtn.value = false
}

const editTask = (task) => {
    if (role == "responsible") {
        filteredStatusOption.value = statusOption.value.filter(status => status.label == "Завершена");
        console.log("filteredOption", filteredStatusOption.value);
        if(getTaskStatusName(task.status) != 'Выполнена') statusDisabled.value = true
    } else {
        filteredStatusOption.value = statusOption.value;
    }
    newTask.value = {
        id: task.id,
        name: task.name,
        description: task.description,
        executor_id: '',
        default_status: getTaskStatusName(task.status),
        defaultSatus: task.status
    }
    createBtn.value = false
    updateBtn.value = true
}
</script>