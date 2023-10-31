<template>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 600px"
      :title="title"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <span v-html="notice" />
      <n-form
        ref="formRef"
        label-placement="left"
        :model="fieldValue"
        :rules="{
          confirmText: [{ required: true, message: '请输入确认文本' }],
        }"
      >
        <n-form-item path="confirmText">
          <n-input v-model:value="fieldValue.confirmText" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space style="float: right">
          <n-button
            @click="(showModal = false), onCancel(deepClone(fieldValue))"
            >取消</n-button
          >
          <n-button type="primary" @click="formSubmit">确定</n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { deepClone } from "@/utils/functions";
import type { FormInst } from "naive-ui";

const formRef = ref<FormInst | null>(null);
const fieldValue = ref<{ confirmText: string }>({ confirmText: "" });
const showModal = ref(false);
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  onCancel: {
    type: Function,
    required: false,
    default: () => {},
  },
  onOpen: {
    type: Function,
    required: false,
    default: () => {},
  },
  onSubmit: {
    type: Function,
    required: false,
    default: () => {},
  },
  notice: {
    type: String,
    required: false,
    default: "",
  },
});

const initForm = () => {
  fieldValue.value = {
    confirmText: "",
  };
};

const formSubmit = (e: Event) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      props.onSubmit(deepClone(fieldValue.value), true);
    } else {
      props.onSubmit(deepClone(fieldValue.value), false);
    }
  });
};

const toggleModal = () => {
  showModal.value = !showModal.value;
  if (!showModal.value) {
    props.onCancel(deepClone(fieldValue.value));
  } else {
    initForm();
    props.onOpen(deepClone(fieldValue.value));
  }
};

const openModal = () => {
  initForm();
  showModal.value = true;
  props.onOpen(deepClone(fieldValue.value));
};

const closeModal = () => {
  showModal.value = false;
  props.onCancel(deepClone(fieldValue.value));
};

defineExpose({
  toggleModal,
  openModal,
  closeModal,
});
</script>

<style scoped>
.n-card span {
  user-select: none;
}

.n-form{
  margin-top: 20px;
}
</style>
