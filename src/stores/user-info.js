import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("useUserinfo", () => {
  const token = ref('');
  const refresh_token = ref('');
  const user_id = ref('');

  const setToken = (token) => {
    localStorage.setItem("acsess_token",token)
  };
  const setRefreshToken = (refreshToken) => {
    localStorage.setItem("refresh_token",refreshToken)

  };
  const setUserId = (userId) => {
    localStorage.setItem("user_id",userId)
  };

  const getToken = ()=>{
    return token.value = localStorage.getItem("acsess_token");
  }
  const getRefreshToken = ()=>{
    return refresh_token.value = localStorage.getItem("refresh_token");
    }
  const getUserId = ()=>{
    return user_id.value = localStorage.getItem("user_id");
  }


    const clearUserData = ()=>{
      localStorage.removeItem("acsess_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
    }
  return {
    token,
    refresh_token,
    user_id,

    setToken,
    setRefreshToken,
    setUserId,

    getRefreshToken,
    getToken,
    getUserId,

    clearUserData
  };
});
