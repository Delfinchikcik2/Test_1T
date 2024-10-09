<template class="popup">
<div class="float-center" v-if="dialog" :position="position">
        <q-card>
          <div class="q-pa-md row justify-center">
            <div style="width: 100%; max-width: 500px">
              <div class="q-pb-sm text-black text-center">
                <div>Создание пространства</div>

                <q-input class="q-my-md" outlined v-model="spaceName" label="Название пространства" />
                <q-select outlined v-model="selectedOption" :options="options" label="Outlined" />
                <q-btn @click="onSubmit" class="bg-primary q-mt-md align-center"> Создать</q-btn>
              </div>

            </div>
          </div>
        </q-card>
      </div>
</template>
<script setup>
import { defineProps, ref, defineEmits } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { CREATE_SPACE } from 'src/querys/mutations';


const position = ref('center')
const spaceName = ref('')
const options = ['Стандарт', 'IT Союз']
const selectedOption = ref('Стандарт')
const emit =  defineEmits(['close-popup']);
const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
    required: true
  }
});

const variable = ref({})
const {mutate: createSpace} = useMutation(CREATE_SPACE)

const onSubmit = async()=>{
    variable.value = {
        input:{
            name: spaceName.value,
            description: "",
            template: selectedOption.value === "Стандарт" ? "standard" : "union"
        }
        }
       await createSpace(variable.value)
      emit('close-popup')
}

</script>

<style>
.popup{
    position: fixed;
  top: 20%;
  left:  30%;
  min-width: 500px;
  min-height: 500px;
  background-color: rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  z-index: 4;
}
</style>