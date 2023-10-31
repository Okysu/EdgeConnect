import { defineStore } from "pinia";

const TOKEN_EXPIRED: number = Number(import.meta.env.VITE_TOKEN_EXPIRED);

// user config store
export const useUserConfig = defineStore("userConfig", {
  state: () => ({
    token: "",
    signAt: 0,
    user: {} as User,
  }),
  getters: {
    login: (state) =>
      state.token !== "" && state.signAt + TOKEN_EXPIRED > Date.now(),
  },
  actions: {
    logout() {
      this.token = "";
      this.signAt = 0;
      this.user = {} as User;
    },
  },
  persist: true,
});
