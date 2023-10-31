<template>
  <n-menu
    :options="menu"
    :default-value="menuValue"
    :default-expanded-keys="expanded"
    mode="horizontal"
    @update:expanded-keys="(e: string[]) => { expanded = e }"
    @update:value="(v: string) => { menuValue = v, $router.push({ name:v } ) }"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppConfig } from "@/stores/appConfig";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { developerOptions, userOptions } from "./menu";

const route = useRoute();
const menuValue = ref(route.path.split("/")[1]);
const { expanded } = storeToRefs(useAppConfig());
const menu = [...userOptions, ...developerOptions];
</script>
