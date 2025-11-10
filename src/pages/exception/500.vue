<script setup lang="ts">
const router = useRouter()
function back() {
  router.replace({
    path: '/',
  })
}
</script>

<template>
  <a-result status="500" title="500" sub-title="您没有权限访问本系统">
    <template #extra>
      <a-button type="primary" @click="back">
        Back Home
      </a-button>
    </template>
  </a-result>
</template>
