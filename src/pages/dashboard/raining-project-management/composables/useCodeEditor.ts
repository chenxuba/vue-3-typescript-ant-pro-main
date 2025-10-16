import { ref, nextTick } from 'vue'

export function useCodeEditor() {
  // 代码编辑器行号
  const codeLineNumbers = ref<number[]>([1])

  // 更新行号
  const updateLineNumbers = (content: string) => {
    const lines = content.split('\n').length
    codeLineNumbers.value = Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1)
  }

  // 同步滚动
  const syncScroll = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement
    const lineNumbers = textarea.parentElement?.querySelector('.code-editor-line-numbers') as HTMLElement
    if (lineNumbers) {
      lineNumbers.scrollTop = textarea.scrollTop
    }
  }

  // 处理 Tab 键缩进
  const handleKeydown = (e: KeyboardEvent, content: string, updateContent: (value: string) => void) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = content

      // 插入两个空格
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      updateContent(newValue)

      // 设置光标位置
      nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }

  return {
    codeLineNumbers,
    updateLineNumbers,
    syncScroll,
    handleKeydown,
  }
}

