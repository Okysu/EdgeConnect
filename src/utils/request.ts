import axios from "axios";
import sha256 from "sha256";
import { useUserConfig } from "@/stores/userConfig";
import { deepClone } from "./functions";

let userConfig: null | ReturnType<typeof useUserConfig> = null;

const PASSWORD_SALT: string = import.meta.env.VITE_PASSWORD_SALT;

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
});

request.interceptors.request.use(
  function (config) {
    if (window.$loadingbar) window.$loadingbar.start();
    // init user config
    if (!userConfig) userConfig = useUserConfig();
    // request interceptor
    // deep copying to avoid side effects caused by directly referencing reactive data.
    config.params = config.params ? deepClone(config.params) : config.params;
    // if using FormData, do not deepclone
    if (config.data instanceof FormData) {
      config.data = config.data;
    } else {
      config.data = config.data ? deepClone(config.data) : config.data;
    }
    // encrypt password
    if (config.data && config.data.password)
      config.data.password = sha256(config.data.password + PASSWORD_SALT);
    if (config.data && config.data.old_password)
      config.data.old_password = sha256(
        config.data.old_password + PASSWORD_SALT
      );
    if (config.data && config.data.new_password)
      config.data.new_password = sha256(
        config.data.new_password + PASSWORD_SALT
      );
    // add timestamp to request to avoid caching when using GET method
    if (config.method?.toLocaleLowerCase() === "get") {
      config.params = {
        ...config.params,
        t: Date.now(),
      };
    }
    // add token to request
    if (userConfig.login) {
      config.headers.Authorization = "Bearer " + userConfig.token;
    }
    return config;
  },
  function (error) {
    if (window.$loadingbar) window.$loadingbar.error();
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  function (response) {
    if (window.$loadingbar) window.$loadingbar.finish();
    // response interceptor
    const result = response.data;
    return response;
  },
  function (error) {
    if (window.$loadingbar) window.$loadingbar.error();
    return Promise.reject(error);
  }
);

export default request;
