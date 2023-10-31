<template>
  <div
    class="avatar-wrapper"
    @mouseenter="showMask = true"
    @mouseleave="showMask = false"
  >
    <n-avatar
      :size="size"
      :src="avatar_url"
      :round="round"
      @click="uploadImage"
    />
    <div
      @click="uploadImage"
      v-if="showMask"
      class="mask"
      :style="{ borderRadius: round ? '50%' : '3px' }"
    >
      <div class="upload-btn">
        <n-icon size="24">
          <CloudUploadOutline />
        </n-icon>
        <span>上传头像</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CloudUploadOutline } from "@vicons/ionicons5";
import { ref, watch, type PropType } from "vue";
const props = defineProps({
  size: {
    type: [Number, String] as PropType<number | "small" | "medium" | "large">,
    default: 40,
  },
  src: {
    type: String,
    default: "",
  },
  round: {
    type: Boolean,
    default: false,
  },
  onConfirm: {
    type: Function,
    default: () => {},
  },
});
watch(
  () => props.src,
  (v) => {
    avatar_url.value = v;
  },
  {
    immediate: false,
  }
);
const avatar_url = ref(props.src);
const showMask = ref(false);
const uploadImage = (e: Event) => {
  e.preventDefault();
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const data = (e.target as FileReader).result;
      avatar_url.value = data as string;
      props.onConfirm(file, data as string);
    };
  };
  input.remove();
};
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  display: inline-flex;
  transition: all 0.3s ease-in-out;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #fff;
}
</style>
