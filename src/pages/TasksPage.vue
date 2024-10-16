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
          <task-form v-if="newTask && executor" :newTask="newTask" :executorOptions="executorOptions"
                     :filteredStatusOptions="filteredStatusOptions" :isInputDisable="inpunDisable"  @update:newTask="updateNewTask"/>
          <task-form v-if="newTask && owner" :newTask="newTask" :executorOptions="executorOptions"
                     :filteredStatusOptions="filteredStatusOptions" :updateBtn="updateBtn" :isDisabled="false"  @update:newTask="updateNewTask"/>
        </template>
        <div v-else class="no-data">Нет данных для отображения.</div>
      </task-table>
      <div v-if="updateBtn" class="save-module-btn">
        <q-btn class="btnSpaces" label="Обновить статус" color="green" @click="updateTaskStatus" />
        <q-btn class="btnSpaces" label="Отмена" color="red" @click="resetSave" />
      </div>
    </q-page>
  </template>

<script setup>
import { useMutation, useQuery, useLazyQuery } from '@vue/apollo-composable';
import { useQuasar } from 'quasar';
import { GET_EXECUTOR } from 'src/querys/groupQuery';
import { MANY_PREMISSION_RULES, PREMISSION_TREE_SUBJECTS } from 'src/querys/premissionQuery';
import { PAGINATE_TASKS, TASK_STATUS_PROPERTI, UPDATE_TASK } from 'src/querys/tasksQuery';
import { useUserStore } from 'src/stores/user-info';
import { ref, watch } from 'vue';
import TaskTable from 'src/components/TaskTable.vue';
import TaskRow from 'src/components/TaskRow.vue';
import TaskForm from 'src/components/TaskForm.vue';

const $q = useQuasar()
const tasks = ref([])
const newTask = ref(null)
const updateBtn = ref(false)
const statusOption = ref([])
const filteredStatusOptions = ref([])
const subjects = ref(null)
const executorOptions = ref(null)
const inpunDisable = ref(true)
const role = useUserStore().getRole()
const subjectId = useUserStore().getSubjectId()

const owner = ref(false)
const executor = ref(false)


const { load: fetchTasks, result: tasksResult, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useLazyQuery(PAGINATE_TASKS, {}, { fetchPolicy: 'no-cache' });
const { result: StatusResult, loading: StatusLoading } = useQuery(TASK_STATUS_PROPERTI, {}, { fetchPolicy: 'no-cache' });
const { result: subjectResult, loading: subjectLoading, error: subjectError } = useQuery(GET_EXECUTOR, {}, { fetchPolicy: 'no-cache' });

const updateNewTask = (updatedTask) => {
  newTask.value = updatedTask;
};

watch([tasksLoading, StatusLoading, subjectLoading], async ([isTasksLoading, isStatusLoadung, isSubjectLoading]) => {
    if (isTasksLoading) return
    if (role == "owner") {
        let moduleResult = await fetchTasks(PAGINATE_TASKS)
        if (moduleResult) {
            loadTasks(moduleResult);
        }
    } else if (role == "executor") {
        console.log(subjectId);

        const variable = {
            where: {
                column: "6087550423904434588->6414058648113056419->objectId",
                operator: "EQ",
                value: subjectId
            }
        }
        let moduleResult = await fetchTasks(PAGINATE_TASKS, variable)
        if (moduleResult) {
            loadTasks(moduleResult);
        }
    }
    if (isStatusLoadung) return
    statusOption.value = StatusResult.value.property?.meta?.options.map(item => ({
        label: item.label,
        id: item.id,
        color: item.color
    }))
    if (role == "executor") {
        filteredStatusOptions.value = statusOption.value.filter(status => status.label == "Выполнена");
        console.log("ffffffffffffffffffffffffffffffffff", filteredStatusOptions.value);

    } else {
        filteredStatusOptions.value = statusOption.value;
    }
    if (isSubjectLoading) return
    setSubject()
    if (role == "owner") owner.value = true
    if (role == "executor") executor.value = true
});

const setSubject = () => {
    console.log("getGroup ", subjectResult);

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

const loadTasks = (tasksResult) => {
    console.log("tasksResult", tasksResult);

    tasks.value = tasksResult.paginate_type2.data.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        executor_id: task.executor?.object?.id,
        executor_fullname: `${task.executor?.object?.fullname?.first_name} ${task.executor?.object?.fullname?.last_name}`,
        status: task.task_status
    })
    )
    updateBtn.value = false
    newTask.value = null
}

const getTaskStatusName = (statusId) => {
    const status = statusOption.value.find(item => item.id == statusId)
    return status ? status.label : "Неизвестно";
}


const getTaskColor = (statusId) => {
    const status = statusOption.value.find(item => item.id == statusId)
    return status ? status.color : "grey"
}

const { mutate: taskUpdate, onDone: doneUpdate } = useMutation(UPDATE_TASK)
const { mutate: setManyRules, onDone: doneManyRules } = useMutation(MANY_PREMISSION_RULES)
const { load: premissionTree, result: premissionTreeResult, loading: premissionTreeLoading } = useLazyQuery(PREMISSION_TREE_SUBJECTS, {}, { fetchPolicy: 'no-cache' });


const updateTaskStatus = () => {
    const statusId = (statusId) => {
        console.log("statusId ", statusId);
        console.log(statusOption.value);

        const status = statusOption.value.find(item => item.label == statusId)
        console.log("statuusss ", status);
        return status.id
    }
    let variable
    if (role == "owner") {
        variable = {
            input: {
                task_status: statusId(newTask.value.default_status.label),
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
    } else if (role == "executor") {
        variable = {
            input: {
                task_status: statusId(newTask.value.default_status.label),
                name: newTask.value.name,
            },
            id: newTask.value.id
        }
    }
    try {
        taskUpdate(variable)
        doneUpdate(async () => {
            const oldRuleId = await getPremissionTree()
            console.log("oldRules", oldRuleId);
            changePremission(oldRuleId)
            if (role == "owner") {
                let moduleResult = await refetchTasks(PAGINATE_TASKS)
                if (moduleResult.data) {
                    loadTasks(moduleResult.data);
                }
            } else if (role == "executor") {
                console.log(subjectId);

                const variable = {
                    where: {
                        column: "6087550423904434588->6414058648113056419->objectId",
                        operator: "EQ",
                        value: subjectId
                    }
                }
                let moduleResult = await refetchTasks(PAGINATE_TASKS, variable)
                if (moduleResult.data) {
                    loadTasks(moduleResult.data);
                }
            }
        })
    } catch (error) {
        console.log("Error update task status", error);
    }
}

const changePremission = async (oldIdRules) => {
    if (role == "owner") {
        const variable = {
            input: {
                model_type: "object",
                model_id: newTask.value.id,
                collection_to_delete: [
                    oldIdRules
                ],
                collection_to_create: [
                    {
                        owner_type: "subject",
                        owner_id: newTask.value.executor_id.id,
                        level: 5
                    }
                ]
            }
        }
        console.log("many premission variable ", variable);
        try {
            await setManyRules(variable)
            updateBtn.value = false
            newTask.value = null
        } catch (error) {
            console.log("Error change premission", error);
        }
    }
}

const getPremissionTree = async () => {
    console.log(newTask.value);
    const variable = {
        modelId: newTask.value.id,
        modelType: "object",
        groupId: "903288632941026841"
    }
    console.log("tree variable", variable);
    try {
        const result = await premissionTree(PREMISSION_TREE_SUBJECTS, variable)
        console.log("result tree", result);

        if (result) {
            const oldIdRules = result.permissionTreeSubjects?.data.find(subject => subject?.subject_id == newTask.value.old_executor)
            console.log("rules id", oldIdRules);

            return oldIdRules.permission_rule_id
        }
    } catch (error) {
        console.log("Error get premission tree", error);
    }

}

const resetSave = () => {
    newTask.value = null
    updateBtn.value = false
}

const editTask = (task) => {
    if (role == "executor") {
        if (getTaskStatusName(task.status) == "Завершена" || getTaskStatusName(task.status) == "Выполнена"){
            $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Вы не можете изменить статус этой задачи'
        });
        }else{
            newTask.value = {
            id: task.id,
            name: task.name,
            description: task.description,
            executor_id: task.executor_fullname,
            default_status: getTaskStatusName(task.status),
            old_executor: task.executor_id
        }
        updateBtn.value = true
        }
    } else {
        newTask.value = {
            id: task.id,
            name: task.name,
            description: task.description,
            executor_id: task.executor_fullname,
            default_status: getTaskStatusName(task.status),
            old_executor: task.executor_id
        }
        updateBtn.value = true
    }
}
</script>