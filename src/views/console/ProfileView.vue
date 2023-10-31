<template>
  <n-card title="个人信息">
    <div class="user-info">
      <avatar-upload
        :size="100"
        :src="userInfo.avatar_url"
        round
        @confirm="uploadAvatar"
      />
      <p>{{ userInfo.nickname }}</p>
    </div>
    <n-list>
      <template #header> 基础信息 </template>
      <n-list-item>
        <n-input-group>
          <n-input-group-label>唯一标识符</n-input-group-label>
          <n-input disabled :value="userInfo.identity_id"></n-input>
          <n-button @click="copyText(userInfo.identity_id ?? '')">
            <n-icon>
              <CopyOutline />
            </n-icon>
          </n-button>
        </n-input-group>
      </n-list-item>
      <n-list-item>
        <n-input-group>
          <n-input-group-label>头像地址</n-input-group-label>
          <n-input disabled :value="userInfo.avatar_url"></n-input>
          <n-button @click="copyText(userInfo.avatar_url ?? '')">
            <n-icon>
              <CopyOutline />
            </n-icon>
          </n-button>
        </n-input-group>
      </n-list-item>
      <n-list-item>
        <n-input-group>
          <n-input-group-label>用户昵称</n-input-group-label>
          <n-input v-model:value="userInfo.nickname"></n-input>
          <n-button @click="copyText(userInfo.nickname ?? '')">
            <n-icon>
              <CopyOutline />
            </n-icon>
          </n-button>
        </n-input-group>
      </n-list-item>
      <n-list-item>
        <n-input-group>
          <n-input-group-label>邮箱地址</n-input-group-label>
          <n-input disabled :value="userInfo.email"></n-input>
          <n-button @click="copyText(userInfo.email ?? '')">
            <n-icon>
              <CopyOutline />
            </n-icon>
          </n-button>
        </n-input-group>
        <span style="color: #999; font-size: 12px">
          出于安全考虑，邮箱地址暂时不可修改
        </span>
      </n-list-item>
      <template #footer>
        <div class="float-right">
          <n-button type="error" strong ghost @click="formRef?.openModal()">
            <template #icon>
              <n-icon>
                <KeyOutline />
              </n-icon>
            </template>
            修改密码
          </n-button>
          <n-button type="primary" strong ghost @click="updateInfo">
            <template #icon>
              <n-icon>
                <SendOutline />
              </n-icon>
            </template>
            确认修改
          </n-button>
        </div>
      </template>
    </n-list>
    <template #footer>
      上次修改时间：{{ describeTime(new Date(userInfo.updated_at ?? 0)) }}
    </template>
  </n-card>
  <dialog-form
    label-placement="top"
    ref="formRef"
    title="修改密码"
    :field="fields"
    :rules="rules"
    @submit="updatePassword"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import {
  getUserInfo as getInfo,
  updateUserInfo,
  resetPassword,
} from "@/api/user";
import { uploadSource } from "@/api/source";
import { describeTime, copyText as copy } from "@/utils/strings";
import avatarUpload from "@/components/avatarUpload.vue";
import { CopyOutline, SendOutline, KeyOutline } from "@vicons/ionicons5";
import { useUserConfig } from "@/stores/userConfig";
import { storeToRefs } from "pinia";
import dialogForm, { type Field } from "@/components/dialogForm.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const formRef = ref<InstanceType<typeof dialogForm> | null>(null);
const userConfig = useUserConfig();
const { user } = storeToRefs(userConfig);

const baseURL = import.meta.env.VITE_BASE_URL as string;

const userInfo = ref<User>({
  identity_id: "",
  nickname: "",
  avatar_url: "",
  email: "",
});

const copyText = (str: string) => {
  copy(str)
    .then(() => {
      window.$message.success("复制成功");
    })
    .catch(() => {
      window.$message.error("复制失败");
    });
};

const getUserInfo = () => {
  getInfo()
    .then((res) => {
      const { data } = res;
      userInfo.value = data.data;
      user.value = {
        ...data.data,
      };
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

const uploadAvatar = (file: File, data: string) => {
  uploadSource(file)
    .then((res) => {
      const { data } = res;
      userInfo.value.avatar_url = `${baseURL}/source/${data.data.hash}`;
      window.$message.success("上传成功");
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

const updateInfo = () => {
  // check user info if valid
  const uploadInfo = {
    nickname: userInfo.value.nickname,
    avatar_url: userInfo.value.avatar_url,
  };
  for (const key in uploadInfo) {
    if (uploadInfo[key as keyof typeof uploadInfo].trim() === "") {
      window.$message.error("请填写完整信息");
      return;
    }
  }
  // update user info
  updateUserInfo(uploadInfo)
    .then(() => {
      window.$message.success("修改成功");
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

const fields: Field[] = [
  {
    label: "旧密码",
    field: "old_password",
    type: "input-password",
  },
  {
    label: "新密码",
    field: "new_password",
    type: "input-password",
  },
  {
    label: "确认密码",
    field: "confirm_password",
    type: "input-password",
  },
];

const rules = {
  old_password: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
    {
      min: 6,
      max: 64,
      message: "长度在 6 到 64 个字符",
      trigger: "blur",
    },
  ],
  new_password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      min: 6,
      max: 64,
      message: "长度在 6 到 64 个字符",
      trigger: "blur",
    },
  ],
  confirm_password: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      min: 6,
      max: 64,
      message: "长度在 6 到 64 个字符",
      trigger: "blur",
    },
  ],
};

type updatePasswordData = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

const updatePassword = (data: updatePasswordData, valid: boolean) => {
  if (!valid) {
    window.$message.error("请检查表单");
    return;
  }
  if (data.new_password !== data.confirm_password) {
    window.$message.error("两次输入的密码不一致");
    return;
  }
  resetPassword({
    old_password: data.old_password,
    new_password: data.new_password,
  })
    .then(() => {
      window.$message.success("修改成功");
      formRef.value?.closeModal();
      userConfig.logout();
      router.replace({ name: "login" });
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
.n-card {
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 10px auto;
}

.user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.user-info p {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.float-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

@media screen and (max-width: 800px) {
  .n-card {
    max-width: 100%;
  }
}
</style>
