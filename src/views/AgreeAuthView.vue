<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import request from "@/utils/request";
import { reactive, ref } from "vue";
import { getClient } from "@/api/client";
// use route hook
const route = useRoute();
// get Code
const query = route.query;
// use router hook
const router = useRouter();
const client = ref<Client | null>(null);
if (!query.client_id) {
  window.$message.error("缺少client_id参数");
  router.replace({ name: "home" });
} else {
  getClient(query.client_id as string)
    .then((res) => {
      const { data } = res.data;
      client.value = data;
    })
    .catch(() => {
      window.$message.error("获取应用信息失败");
      router.replace({ name: "home" });
    });
}

interface authorize {
  client_id: string;
  response_type: string;
  redirect_uri?: string;
}

// agree auth
const agreeAuth = () => {
  let data = {
    client_id: query.client_id,
    response_type: "code",
  } as authorize;
  if (client.value?.redirect_uri) {
    data.redirect_uri = client.value.redirect_uri;
  } else if (query.redirect_uri) {
    data.redirect_uri = query.redirect_uri as string;
  }
  request
    .get("/auth/authorize", {
      params: {
        client_id: query.client_id,
        response_type: "code",
        scope: scope_value(),
      },
    })
    .then((res) => {
      const { data } = res.data;
      window.$message.success("授权成功");
      window.location.href = data.redirect_uri + "?code=" + data.code;
    });
};

const checkedValue = reactive({
  sign_id: true,
  basic_info: true,
});

const scope_value = (): string => {
  let scope = "";
  if (checkedValue.sign_id) {
    scope += "identityID ";
  }
  if (checkedValue.basic_info) {
    scope += "nickname avatarURL email";
  }
  return scope;
};
</script>

<template>
  <div class="agree-auth__box">
    <n-card title="授权登录">
      <n-space>
        <n-alert title="授权说明" type="warning">
          若您同意授权，则会将您的账号信息发送给第三方平台，以便于您使用第三方平台的服务。
        </n-alert>
      </n-space>
      <n-card :title="client?.name" style="margin: 10px 0">
        您确定要授权登录<a class="app__name" :href="client?.domain">{{
          client?.name
        }}</a
        >吗？ 对方将获得以下权限：
        <n-space>
          <n-checkbox :checked="checkedValue.sign_id">
            获取您的用户标识ID
          </n-checkbox>
          <n-checkbox :checked="checkedValue.basic_info">
            获取您的用户昵称、头像、邮箱
          </n-checkbox>
        </n-space>
      </n-card>
      <n-button
        block
        type="primary"
        secondary
        strong
        style="margin-top: 15px"
        @click="agreeAuth"
      >
        同意授权
      </n-button>
    </n-card>
  </div>
</template>

<style scoped>
.agree-auth__box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.agree-auth__box > .n-card {
  width: 460px;
}

.app__name {
  color: cornflowerblue;
}

@media screen and (max-width: 768px) {
  .agree-auth__box > .n-card {
    width: 100%;
    height: 100%;
  }
}
</style>
