<template>
  <div class="q-pa-md q-gutter-sm q-mt-sm">
    <q-list>
      <q-expansion-item
        v-for="page in pages"
        :key="page.id"
        :label="page.label"
        :dense="true"
        :expand-separator="true"
        @click="loadPageInPanel(page)"
      >
        <template v-slot:header>
          <div class="clickable-node">
            {{ page.label }}
          </div>
        </template>
        <q-list v-if="page.children && page.children.length">
          <q-item
            v-for="child in page.children"
            :key="child.id"
            class="clickable-node"
          >
            <q-item-section  @click="loadPageInPanel(child)">
              {{ child.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, watch} from 'vue';
import { GET_ROOT_PAGE, GET_CHILD_PAGE } from 'src/querys/getQuery';
import { useQuery, useLazyQuery } from '@vue/apollo-composable';
import { useRouter } from 'vue-router';

const data = ref({});
const pagetitle = ref([]);
const pages = ref([]);
const router = useRouter()

const { result: pageResult, loading: pageLoading, error: pageError } = useQuery(GET_ROOT_PAGE, {}, {
  fetchPolicy: 'no-cache'
});

watch(pageLoading, (ispageLoading) => {
  if (ispageLoading) return;
  loadPage();
});


const createTree = (pages) => {
  return pages.map(page => ({
    id: page.id,
    label: page.title,
    position: page.position,
    lazy: true,
    parent_id: page?.parent_id,
    selectable: true,
    children: [],
    group_id: page.group_id,
    is_group: page.is_group
  }));
};

const loadPage = () => {
  data.value = pageResult.value;
  console.log(data);

  pagetitle.value = data.value.rootPages.data.map(data => ({
    title: data.title,
    position: data.position,
    id: data.id,
    parent_id: data?.parent_id,
    hasChildren: data.hasChild,
    group_id: data.object.id,
    is_group: data.is_group,
  }));
  console.log(pagetitle.value);

  pages.value = createTree(pagetitle.value);
  console.log(pages.value);

  if (pageError.value) {
    console.error('Ошибка запроса:', pageError.value.networkError || pageError.value.graphQLErrors);
  }
};

const { load, result: childResult, loading: ChildLoading, refetch } = useLazyQuery(GET_CHILD_PAGE);

const loadChild = async (node) => {
  const variables = {
    where: {
      column: "parent_id",
      operator: "EQ",
      value: node.id
    }
  };

  try {
    if (childResult.value) {
      await refetch(variables);
      console.log(childResult.value);
      
      const childPages = childResult.value.pages.data.map(page => ({
        id: page.id,
        label: page.title,
        position: page.position,
        parent_id: page.parent_id,
        lazy: true,
        selectable: true,
        group_id: page.object.id,
        is_group:page.is_group
      }));
      node.children = childPages;
      console.log(node.children);
    } else if(!childResult.value) {
      await load(GET_CHILD_PAGE, variables);
     if(!ChildLoading){ return }
      const childPages = childResult.value.pages.data.map(page => ({
        id: page.id,
        label: page.title,
        position: page.position,
        lazy: true,
        selectable: true,
        group_id: page.object.id,
        is_group:page.is_group
      }));

      node.children = childPages;
      console.log(node.children);
    }
  } catch (error) {
    console.error('Ошибка загрузки дочерних страниц:', error);
  }
};

const loadPageInPanel = async (node) => {
  if (!node.children || node.children.length === 0) {
    await loadChild(node);
  }
    console.log("Клик сработал на ", node);
    if(node.is_group){
    const id = node.group_id;
      router.push({ name: 'groupPage', params: { id } })
  } else if(node.label == 'Модули'){
    const id = node.id;
    router.push({ name: 'page', params: { id } })
  } else if(node.label == 'Мои задачи') 
  {
    const id = node.id;
    router.push({ name: 'taskspage', params: { id } })
  } else {
    const id = node.id;
    router.push({ name: 'module', params: { id } })
    
  }
};

</script>

<style scoped>
.clickable-node {
  cursor: pointer; 
  padding: 4px;
}
.clickable-node:hover {
  background-color: #b7bac0; 
}
</style>
