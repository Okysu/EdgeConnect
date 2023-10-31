import { defineStore } from "pinia";

// application config store
export const useAppConfig = defineStore("appConfig", {
  state: () => ({
    locale: "zhCN",
    theme: "auto",
    expanded: [] as string[],
  }),
  persist: true,
});
