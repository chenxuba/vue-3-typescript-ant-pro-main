<template>
  <div class="test-page-container">
    <a-card title="测试页面" :bordered="false">
      <div v-html="testContent"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const testContent = ref(`
<p><strong>本节课任务要求：</strong></p><p><u><strong> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </strong></u></p><p>1\"掌握并完成教材中的基础知识学习\"</p><p>2\"学习与课程相关的测试内容及考核要点\"</p><p>3\"完成指定的编程练习与实践项目\"</p>`)
</script>

<style scoped lang="less">

</style>

