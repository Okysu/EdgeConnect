<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useAppConfig } from "@/stores/appConfig";
import { useUserConfig } from "@/stores/userConfig";
import {
  login as userlogin,
  logout as userlogout,
  sendValidCode,
  register as registerUser,
} from "@/api/user";
import { onMounted, reactive, ref, nextTick } from "vue";
import type { FormInst, FormItemRule } from "naive-ui";
import Captcha from "@/utils/captcha";
import { describeTime } from "@/utils/strings";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const redirect_uri = route.query.redirect_uri as string;

const { theme } = storeToRefs(useAppConfig());
const userConfig = useUserConfig();
const { token, user, signAt } = storeToRefs(userConfig);

const themeOptions = [
  { label: "系统", value: "auto" },
  { label: "亮色", value: "light" },
  { label: "暗色", value: "dark" },
];

const loginForm = ref<FormInst>();
const loginValue = reactive({
  username: "",
  password: "",
  captcha: "",
  loading: false,
});

const registerForm = ref<FormInst>();
const registerValue = reactive({
  nickname: "",
  password: "",
  confirm: "",
  email: "",
  captcha: "",
  code: "",
  loading: false,
});

const emptyLoginValue = () => {
  loginValue.username = "";
  loginValue.password = "";
  loginValue.captcha = "";
  loginValue.loading = false;
};

const emptyRegisterValue = () => {
  registerValue.nickname = "";
  registerValue.password = "";
  registerValue.confirm = "";
  registerValue.captcha = "";
  registerValue.code = "";
  registerValue.email = "";
  registerValue.loading = false;
};

const captchaLogin = ref<HTMLCanvasElement>();
const captchaRegister = ref<HTMLCanvasElement>();

const captchaInstance = {
  login: new Captcha(),
  register: new Captcha(),
};

const loginRules = {
  username: [
    {
      required: true,
      message: "请输入你的账号或邮箱",
      trigger: "blur",
    },
    {
      min: 3,
      max: 64,
      message: "长度在 3 到 64 个字符",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入你的密码",
      trigger: "blur",
    },
    {
      min: 6,
      max: 64,
      message: "长度在 6 到 64 个字符",
      trigger: "blur",
    },
  ],
  captcha: {
    required: true,
    trigger: "blur",
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error("请输入验证码");
      }
      if (!captchaInstance.login.verify(Number(value))) {
        return new Error("验证码错误");
      }
      return true;
    },
  },
};

const registerRules = {
  nickname: [
    {
      required: true,
      message: "请输入你的昵称",
      trigger: "blur",
    },
    {
      min: 2,
      max: 20,
      message: "长度在 2 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入你的密码",
      trigger: "blur",
    },
    {
      min: 6,
      max: 64,
      message: "长度在 6 到 64 个字符",
      trigger: "blur",
    },
  ],
  confirm: [
    {
      required: true,
      trigger: "blur",
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("请再次输入你的密码");
        }
        if (value !== registerValue.password) {
          return new Error("两次输入的密码不一致");
        }
        return true;
      },
    },
  ],
  captcha: {
    required: true,
    trigger: "blur",
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error("请输入验证码");
      }
      if (!captchaInstance.register.verify(Number(value))) {
        return new Error("验证码错误");
      }
      return true;
    },
  },
  code: {
    required: true,
    trigger: "blur",
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error("请输入邮箱验证码");
      }
      return true;
    },
  },
  email: {
    required: true,
    trigger: "blur",
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error("请输入邮箱");
      }
      const reg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (!reg.test(value)) {
        return new Error("邮箱格式不正确");
      }
      return true;
    },
  },
};

type loginResponse = {
  code: number;
  data: {
    token: string;
    user: User;
  };
  msg: string;
};

const logout = () => {
  userlogout()
    .then(() => {
      window.$message.success("退出登录成功");
    })
    .catch((err) => {
      const { msg } = err.response;
      window.$message.error(msg);
    })
    .finally(() => {
      userConfig.logout();
      nextTick(() => {
        if (captchaLogin.value)
          captchaInstance.login.setRef(captchaLogin.value);
        captchaInstance.login.generateCaptcha();
      });
    });
};

const login = (e: Event) => {
  e.preventDefault();
  loginForm.value?.validate((errors) => {
    if (errors) {
      captchaInstance.login.generateCaptcha();
      return;
    }
    loginValue.loading = true;
    let data = {
      username: loginValue.username,
      password: loginValue.password,
    };
    userlogin(data)
      .then((res) => {
        const { data } = res.data as loginResponse;
        window.$message.success("登录成功");
        token.value = data.token;
        user.value = data.user;
        signAt.value = Date.now();
        emptyLoginValue();
        if (redirect_uri) {
          window.location.href = redirect_uri;
        } else {
          router.replace({ name: "authorized" });
        }
      })
      .catch((err) => {
        const { data } = err.response;
        window.$message.error(data.msg);
      })
      .finally(() => {
        captchaInstance.login.generateCaptcha();
        loginValue.loading = false;
      });
  });
};

const seconds = ref(0);
const secondLeft = () => {
  seconds.value = 60;
  const timer = setInterval(() => {
    seconds.value--;
    if (seconds.value === 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const sendCode = () => {
  registerForm.value?.validate((errors) => {
    if (errors && errors.filter((e) => e[0].field !== "code").length > 0) {
      captchaInstance.register.generateCaptcha();
      return;
    }
    secondLeft();
    sendValidCode(registerValue.email)
      .then(() => {
        window.$message.success("发送成功");
      })
      .catch((err) => {
        const { data } = err.response;
        window.$message.error(data.msg);
        captchaInstance.register.generateCaptcha();
      });
  });
};

const register = () => {
  registerForm.value?.validate((errors) => {
    if (errors) {
      return;
    }
    registerValue.loading = true;
    const data = {
      nickname: registerValue.nickname,
      password: registerValue.password,
      email: registerValue.email,
      code: registerValue.code,
    };
    registerUser(data)
      .then((res) => {
        const { data } = res;
        if (data.code === 200) {
          window.$message.success("注册成功，您的账号为：" + data.data);
          emptyRegisterValue();
          nextTick(() => {
            if (captchaRegister.value)
              captchaInstance.register.setRef(captchaRegister.value);
            captchaInstance.register.generateCaptcha();
          });
        } else {
          window.$message.error(data.msg);
        }
      })
      .catch((err) => {
        const { data } = err.response;
        window.$message.error(data.msg);
      })
      .finally(() => {
        registerValue.loading = false;
      });
  });
};

onMounted(() => {
  if (captchaLogin.value) captchaInstance.login.setRef(captchaLogin.value);
  if (captchaRegister.value)
    captchaInstance.register.setRef(captchaRegister.value);
  captchaInstance.login.generateCaptcha();
  captchaInstance.register.generateCaptcha();
});
</script>

<template>
  <div class="login__box">
    <n-card title="边际互联">
      <div v-if="userConfig.login">
        <n-h4>您已登录，当前登录账号为：</n-h4>
        <n-thing>
          <template #avatar>
            <n-avatar :size="48" :src="user.avatar_url"> </n-avatar>
          </template>
          <template #header>
            {{ user.nickname }}
          </template>
          <template #description>
            登录时间：{{ describeTime(new Date(signAt)) }}
          </template>
        </n-thing>
        <n-button type="error" block secondary strong @click="logout">
          退出登录
        </n-button>
      </div>
      <n-tabs
        v-else
        class="card-tabs"
        default-value="signin"
        size="large"
        animated
        pane-wrapper-style="margin: 0 -4px"
        pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
      >
        <n-tab-pane name="signin" tab="登录" display-directive="show">
          <n-form ref="loginForm" :model="loginValue" :rules="loginRules">
            <n-form-item path="username" label="用户名或邮箱">
              <n-input
                v-model:value="loginValue.username"
                type="text"
                placeholder="请输入登录账号..."
              />
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="loginValue.password"
                type="password"
                placeholder="请输入登录密码..."
              />
            </n-form-item>
            <n-form-item path="captcha" label="验证码">
              <n-input
                v-model:value="loginValue.captcha"
                type="text"
                placeholder="请输入计算结果..."
              />
              <canvas
                ref="captchaLogin"
                @click="captchaInstance.login.generateCaptcha()"
                height="34"
                width="120"
              ></canvas>
            </n-form-item>
          </n-form>
          <n-button
            type="primary"
            block
            secondary
            strong
            :loading="loginValue.loading"
            :disabled="loginValue.loading"
            @click="login"
          >
            登录
          </n-button>
        </n-tab-pane>
        <n-tab-pane name="signup" tab="注册" display-directive="show">
          <n-form
            ref="registerForm"
            :model="registerValue"
            :rules="registerRules"
          >
            <n-form-item path="nickname" label="昵称">
              <n-input
                v-model:value="registerValue.nickname"
                type="text"
                placeholder="请输入昵称..."
              />
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="registerValue.password"
                type="password"
                placeholder="请输入密码..."
              />
            </n-form-item>
            <n-form-item path="confirm" label="确认密码">
              <n-input
                v-model:value="registerValue.confirm"
                type="password"
                placeholder="请再次输入密码..."
              />
            </n-form-item>
            <n-form-item path="email" label="邮箱">
              <n-input
                v-model:value="registerValue.email"
                type="text"
                placeholder="请输入邮箱..."
              />
            </n-form-item>
            <n-form-item path="captcha" label="验证码">
              <n-input
                v-model:value="registerValue.captcha"
                type="text"
                placeholder="请输入计算结果..."
              />
              <canvas
                ref="captchaRegister"
                @click="captchaInstance.register.generateCaptcha()"
                height="34"
                width="120"
              ></canvas>
            </n-form-item>
            <n-form-item path="code" label="邮箱验证码">
              <n-input
                v-model:value="registerValue.code"
                type="text"
                placeholder="请输入邮箱验证码..."
              />
              <n-button
                style="margin-left: 5px"
                type="primary"
                size="small"
                text
                @click="sendCode"
                :disabled="seconds > 0"
              >
                {{ seconds > 0 ? `${seconds}秒后重试` : "发送验证码" }}
              </n-button>
            </n-form-item>
          </n-form>
          <n-button type="primary" block secondary strong @click="register">
            注册
          </n-button>
        </n-tab-pane>
      </n-tabs>
      <template #footer>
        <span class="license"
          >使用本网站的服务则默认你已知晓并同意
          <a href="/license.html" target="_blank">《服务条款》</a>
        </span>
      </template>
      <template #action>
        <div class="footer-tools">
          <n-form-item
            label="主题"
            label-placement="left"
            :show-feedback="false"
          >
            <n-select
              style="width: 80px"
              v-model:value="theme"
              size="small"
              :options="themeOptions"
            />
          </n-form-item>
        </div>
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.login__box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.n-card {
  width: 460px;
}

.card-tabs .n-tabs-nav--bar-type {
  padding-left: 4px;
}

.license {
  margin-top: 2px;
  font-size: 10px;
  color: grey;
}

.license a {
  color: cornflowerblue;
  text-decoration: none;
}

.footer-tools {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

@media screen and (max-width: 768px) {
  .n-card {
    width: 100%;
    height: 100%;
  }
}
</style>
