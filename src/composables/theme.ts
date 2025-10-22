// 禁用暗色模式自动检测，固定为浅色模式
export const isDark = ref(false)
export const toggleDark = (_value?: boolean) => {
  // 禁用暗色模式切换
  isDark.value = false
}
