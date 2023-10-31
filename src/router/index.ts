import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/LoginView.vue";
import { useUserConfig } from "@/stores/userConfig";

const subtitle: string = "边际互联";

let userConfig: null | ReturnType<typeof useUserConfig> = null;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "主页",
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => HomeView,
      meta: {
        title: "登录",
      },
    },
    {
      path: "/agree-auth",
      name: "agree-auth",
      component: () => import("@/views/AgreeAuthView.vue"),
      meta: {
        title: "授权登录",
      },
    },
    {
      path: "/console",
      name: "console",
      component: () => import("@/views/ConsoleView.vue"),
      meta: {
        title: "控制台",
      },
      children: [
        {
          path: "/applications",
          name: "applications",
          component: () => import("@/views/console/ApplicationView.vue"),
          meta: {
            title: "应用列表",
          },
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("@/views/console/ProfileView.vue"),
          meta: {
            title: "基本信息",
          },
        },
        {
          path: "/authorized",
          name: "authorized",
          component: () => import("@/views/console/AuthorizedView.vue"),
          meta: {
            title: "授权记录",
          },
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (window.$loadingbar) window.$loadingbar.start();
  if (!userConfig) userConfig = useUserConfig();
  if (to.meta.title && typeof to.meta.title === "string") {
    document.title = to.meta.title + " - " + subtitle;
  }
  if (to.name !== "login" && !userConfig.login) {
    next({ name: "login" });
  }
  next();
});
router.afterEach(async (to, from) => {
  if (window.$loadingbar) window.$loadingbar.finish();
});

export default router;
