<template>
  <n-page-header>
    <n-grid :cols="2">
      <n-gi>
        <n-statistic label="记录数" :value="authorizations.length" />
      </n-gi>
      <n-gi>
        <n-statistic label="客户端数" :value="clientCounts" />
      </n-gi>
    </n-grid>
    <template #title>
      <a href="#" style="text-decoration: none; color: inherit">授权记录</a>
    </template>
  </n-page-header>
  <n-data-table
    style="min-height: calc(100vh - 260px); margin-top: 10px"
    :data="authorizations"
    :columns="columns"
    :pagination="pagination"
    max-height="calc(100vh - 380px)"
  />
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, onMounted } from "vue";
import { getAuthorizations } from "@/api/auth";
import { NTag, NSpace } from "naive-ui";

const authorizations = ref<Authorization[]>([]);

const loadAuthorizations = () => {
  getAuthorizations()
    .then((res) => {
      const { data } = res;
      authorizations.value = data.data;
    })
    .catch((err) => {
      const { data } = err.response;
      window.$message.error(data.msg);
    });
};

onMounted(() => {
  loadAuthorizations();
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 15, 20, 25, 30, 35, 40, 45, 50, 100],
  onChange: (page: number) => {
    pagination.page = page;
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  },
});

const clientCounts = computed(() => {
  const clientIds = new Set<string>();
  authorizations.value.forEach((item) => {
    clientIds.add(item.client_id);
  });
  return clientIds.size;
});

const columns = [
  {
    key: "client_name",
    title: "客户端名称",
    render: (row: Authorization) => {
      return h(
        "a",
        {
          href: row.client_domain,
          target: "_blank",
          style: "text-decoration: none; color: inherit",
        },
        row.client_name
      );
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: "scope",
    title: "授权范围",
    ellipsis: {
      tooltip: true,
    },
    render: (row: Authorization) => {
      const scopes = row.scope.split(" ");
      return h(
        NSpace,
        {},
        {
          default: () => {
            return scopes.map((scope) => {
              return h(
                NTag,
                { bordered: false, size: "small" },
                { default: () => scope }
              );
            });
          },
        }
      );
    },
  },
  {
    key: "ip_address",
    title: "授权IP地址",
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: "authorization_time",
    title: "授权时间",
    render: (row: Authorization) => {
      return h("span", {}, new Date(row.authorization_time).toLocaleString());
    },
    ellipsis: {
      tooltip: true,
    },
    sorter: (row1: Authorization, row2: Authorization) => {
      return (
        new Date(row1.authorization_time).getTime() -
        new Date(row2.authorization_time).getTime()
      );
    },
  },
];
</script>
