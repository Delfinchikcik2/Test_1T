<template>
  <q-btn color="transparent" class="text-white btn_border" :label="curentSpaceName">
    <q-menu transition-show="jump-down" transition-hide="jump-up">
      <q-list style="min-width: 100px">
        <q-item clickable @click="(swithSpace(space.id))" v-for="space in spaces" :key="space.id">
          <q-item-section>{{ space.name }}</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="createSpace">
          <q-item-section>+ Создать пространство</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <space-create-popup @close-popup="createSpace" :dialog="popupOpen" class="popup"></space-create-popup>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { GET_CURENT_SPACE_ID, GET_SPACES } from 'src/querys/getQuery';
import { useUserStore } from 'src/stores/user-info';
import SpaceCreatePopup from 'components/SpaceCreatePopup.vue'


const curentSpaceName = ref('');
const data = ref({});
const spaces = ref([]);
const spaceId = ref(null);
const popupOpen = ref(false)
const store = useUserStore()

const { result: spacesResult, loading: spacesLoading, error: spacesError } = useQuery(GET_SPACES);
const { result: spaceIdResult, loading: spaceIdLoading, error: spaceIdError } = useQuery(GET_CURENT_SPACE_ID);

watch([spacesLoading, spaceIdLoading], ([isSpacesLoading, isSpaceIdLoading]) => {
  if (isSpacesLoading || isSpaceIdLoading) return;
loadSpaces();
loadCurenSpacesId();
findCurentName();
});

const loadSpaces = ()=>{
  data.value = spacesResult.value;
  spaces.value = data.value.userMy.spaces;
  if (spacesError.value) {
    console.error('Ошибка запроса (Spaces):', spacesError.value.networkError || spacesError.value.graphQLErrors);
  }
}

const loadCurenSpacesId = ()=>{
  spaceId.value = spaceIdResult.value.userMy.current_space_id;
  if (spaceIdError.value) {
    console.error('Ошибка запроса (Space ID):', spaceIdError.value.networkError || spaceIdError.value.graphQLErrors);
  }
  store.setSpaceId(spaceId.value) 
  
}

const findCurentName = ()=>{
  const findName = spaces.value.find(space => space.id === spaceId.value);

  if(findName) curentSpaceName.value = findName.name
}
const swithSpace = (newSpaceId)=>{
spaceId.value = newSpaceId;
findCurentName();
}

const createSpace = ()=>{
  popupOpen.value = !popupOpen.value;
}
</script>