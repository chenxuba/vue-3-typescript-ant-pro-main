<script setup lang="ts">
import { GlobalOutlined } from '@ant-design/icons-vue'

const userStore = useUserStore()
const {  nickname } = storeToRefs(userStore)

function handleClick({ key }: any) {
  if (key === 'backToFront') {
    // 跳转到前台页面
    window.location.href = 'http://101.200.13.193/web'
  }
}
</script>

<template>
  <a-dropdown>
    <span hover="bg-[var(--hover-color)]" flex items-center h-48px px-12px cursor-pointer class="transition-all-300">
      <a-avatar src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763909761&t=4523fa0150b88276f226cef96220c618" mr-8px size="small" />
      <span class="anticon">{{ nickname }}</span>
    </span>
    <template #overlay>
      <a-menu @click="handleClick">
        <!-- <a-menu-item key="0">
          <template #icon>
            <UserOutlined />
          </template>
          <RouterLink to="/account/center">
            个人中心
          </RouterLink>
        </a-menu-item>
        <a-menu-item key="1">
          <template #icon>
            <ProfileOutlined />
          </template>
          <RouterLink to="/account/settings">
            个人设置
          </RouterLink>
        </a-menu-item> -->
        <a-menu-divider />
        <a-menu-item key="backToFront">
          <template #icon>
            <GlobalOutlined />
          </template>
          回到前台
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
