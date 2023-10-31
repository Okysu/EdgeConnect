<template>
  <n-page-header>
    <n-grid :cols="3">
      <n-gi>
        <n-statistic label="总客户端应用" :value="clients.length" />
      </n-gi>
      <n-gi>
        <n-statistic
          label="已启用应用"
          :value="clients.filter((e) => e.valid).length"
        />
      </n-gi>
      <n-gi>
        <n-statistic
          label="待审核应用"
          :value="clients.filter((e) => e.disabled).length"
        />
      </n-gi>
    </n-grid>
    <template #title>
      <a href="#" style="text-decoration: none; color: inherit">应用列表</a>
    </template>
    <template #extra>
      <n-button
        size="small"
        type="primary"
        strong
        ghost
        @click="(addMode = true), formRef!.openModal()"
        >添加应用</n-button
      >
    </template>
  </n-page-header>
  <n-grid :cols="cols" style="margin-top: 20px" x-gap="10" y-gap="10">
    <n-gi v-for="item in clients">
      <n-card :title="item.name">
        <template #header-extra>
          <n-space>
            <n-tag :type="item.valid ? 'success' : 'warning'">
              {{ item.valid ? "已启用" : item.disabled ? "待审核" : "未启用" }}
            </n-tag>
          </n-space>
        </template>
        {{ item.description }}
        <n-list>
          <n-list-item>
            <p>
              ClientID：<span>{{ item.hide_id ? "******" : item.id }}</span>
              <n-space>
                <n-button
                  size="small"
                  @click="item.hide_id = !item.hide_id"
                  text
                >
                  <n-icon>
                    <EyeOutline v-if="item.hide_id" />
                    <EyeOffOutline v-else />
                  </n-icon>
                </n-button>
                <n-button size="small" text @click="copyText(item.id)">
                  <n-icon>
                    <CopyOutline />
                  </n-icon>
                </n-button>
              </n-space>
            </p>
            <p>
              SecretKey：<span>{{
                item.hide_secret ? "******" : item.secret
              }}</span>
              <n-space>
                <n-button
                  size="small"
                  @click="item.hide_secret = !item.hide_secret"
                  text
                >
                  <n-icon>
                    <EyeOutline v-if="item.hide_secret" />
                    <EyeOffOutline v-else />
                  </n-icon>
                </n-button>
                <n-button size="small" text @click="copyText(item.secret)">
                  <n-icon>
                    <CopyOutline />
                  </n-icon>
                </n-button>
              </n-space>
            </p>
          </n-list-item>
        </n-list>
        <template #footer>
          创建日期： {{ new Date(item.created_at).toLocaleString() }}
        </template>
        <template #action>
          <n-space>
            <n-button
              secondary
              strong
              type="primary"
              @click="editFormOpen(item)"
              >编辑
            </n-button>
            <n-button secondary strong type="error" @click="delConfirm(item)">
              删除
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-gi>
  </n-grid>
  <dialog-form
    ref="formRef"
    :title="addMode ? '添加应用' : '编辑应用'"
    :field="fields"
    :rules="rules"
    @submit="formSubmit"
  />
  <dialog-confirm
    ref="delconfirmRef"
    :title="`删除应用 ${delClientValue?.name} ?`"
    :notice="`请输入<span style='color: red'>${delClientValue?.name}</span>以确认删除`"
    @submit="delConfirmSubmit"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  getClients,
  addClient,
  deleteClient,
  updateClient,
} from "@/api/client";
import { debounce, deepClone } from "@/utils/functions";
import { copyText as copy } from "@/utils/strings";
import { EyeOffOutline, EyeOutline, CopyOutline } from "@vicons/ionicons5";
import dialogForm, { type Field } from "@/components/dialogForm.vue";
import dialogConfirm from "@/components/dialogConfirm.vue";
import type { FormItemRule } from "naive-ui";

const clients = ref<Client[]>([]);
const formRef = ref<InstanceType<typeof dialogForm> | null>(null);
const cols = ref(2);

const fields: Field[] = [
  {
    label: "应用名称",
    field: "name",
    type: "input",
  },
  {
    label: "应用简介",
    field: "description",
    type: "textarea",
  },
  {
    label: "应用主页",
    field: "domain",
    type: "input",
  },
  {
    label: "回调地址",
    field: "redirect_uri",
    type: "input",
  },
];

const rules = {
  name: [{ required: true, message: "请输入应用名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入应用简介", trigger: "blur" }],
  domain: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: FormItemRule, value: string) => {
        if (!value) {
          return new Error("请输入应用主页");
        }
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          return new Error("应用主页必须以http://或https://开头");
        }
        return true;
      },
    },
  ],
  redirect_uri: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: FormItemRule, value: string) => {
        if (!value) {
          return new Error("请输入回调地址");
        }
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          return new Error("回调地址必须以http://或https://开头");
        }
        return true;
      },
    },
  ],
};

const addMode = ref(true);
const editClientValue = ref<ClientForm | null>(null);
const formSubmit = (data: ClientForm, valid: boolean) => {
  if (!valid) {
    window.$message.error("请检查表单");
    return;
  }
  const refFunc = addMode.value ? addClient : updateClient;
  if (!addMode.value) {
    const oldVal = deepClone(editClientValue.value!);
    if (
      oldVal.name === data.name &&
      oldVal.description === data.description &&
      oldVal.domain === data.domain &&
      oldVal.redirect_uri === data.redirect_uri
    ) {
      window.$message.warning("未检测到任何修改");
      formRef.value!.closeModal();
      return;
    }
    data.id = editClientValue.value!.id;
  }
  refFunc(data)
    .then((res) => {
      const { data } = res;
      if (data.code === 200) {
        window.$message.success("操作成功");
        getClient();
        formRef.value!.closeModal();
      } else {
        window.$message.error(data.msg);
      }
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

const editFormOpen = (item: ClientForm) => {
  editClientValue.value = item;
  addMode.value = false;
  formRef.value!.openModal(item);
};

const delconfirmRef = ref<InstanceType<typeof dialogConfirm> | null>(null);
const delClientValue = ref<Client | null>(null);
const delConfirm = (item: Client) => {
  delClientValue.value = item;
  delconfirmRef.value!.openModal();
};
const delConfirmSubmit = (data: { confirmText: string }, valid: boolean) => {
  if (!valid || data.confirmText !== delClientValue.value?.name) {
    window.$message.error("请输入正确的确认文本");
    return;
  }
  deleteClient(delClientValue.value!.id)
    .then((res) => {
      const { data } = res;
      if (data.code === 200) {
        window.$message.success("删除成功");
        getClient();
        delconfirmRef.value!.closeModal();
      } else {
        window.$message.error(data.msg);
      }
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

const getClient = () => {
  getClients()
    .then((res) => {
      clients.value = res.data.data.map((e: Client) => {
        return {
          ...e,
          hide_id: false,
          hide_secret: true,
        };
      });
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

onMounted(() => {
  // get clients
  getClient();
  // layout
  layout();
  window.addEventListener("resize", debounce(layout, 300));
});

const layout = () => {
  // get window width
  const width = window.innerWidth;
  if (width < 768) {
    cols.value = 1;
  } else {
    cols.value = 2;
  }
};

const copyText = (str: string) => {
  copy(str)
    .then(() => {
      window.$message.success("复制成功");
    })
    .catch(() => {
      window.$message.error("复制失败");
    });
};
</script>

<style scoped>
.n-list-item__main p {
  display: flex;
  justify-self: start;
  align-items: center;
}

.n-list-item__main p span {
  margin-right: 10px;
  text-overflow: ellipsis;
}

.n-space .n-button {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
