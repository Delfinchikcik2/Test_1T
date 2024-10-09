import { defineStore } from "pinia";
import { ref, watch} from 'vue';
import { GET_ROOT_PAGE, GET_CHILD_PAGE } from 'src/querys/getQuery';
import { useQuery, useLazyQuery } from '@vue/apollo-composable';
import { useRouter } from 'vue-router';

export const usePageStore = defineStore('usePageStore', ()=>{
    const pagetitle = ref([]);
    const pages = ref([]);

const createTree = (pages) => {
  return pages.map(page => ({
    id: page.id,
    label: page.title,
    position: page.position,
    lazy: true,
    selectable: true,
    children: [],
    group_id: page.group_id,
    is_group: page.is_group
  }));
};

const loadPage = (pageResult,pageError) => {
  pagetitle.value = pageResult.value.rootPages.data.map(data => ({
    title: data.title,
    position: data.position,
    id: data.id,
    hasChildren: data.hasChild,
    group_id: data.object.id,
    is_group: data.is_group,
  }));

  pages.value = createTree(pagetitle.value);

  if (pageError.value) {
    console.error('Ошибка запроса:', pageError.value.networkError || pageError.value.graphQLErrors);
  }
};


const loadChild = async (node, load, refetch, childResult, ChildLoading) => {
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
      pages.value.children = childPages
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
      pages.value.children = childPages
    }
  } catch (error) {
    console.error('Ошибка загрузки дочерних страниц:', error);
  }
};


return{
    pagetitle,
    pages,

    loadPage,
    loadChild

}
})