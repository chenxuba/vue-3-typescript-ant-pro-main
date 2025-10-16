<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, computed, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { ExclamationCircleOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons-vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
// @ts-ignore
import hljs from 'highlight.js/lib/core'
// 导入需要的语言
// @ts-ignore
import javascript from 'highlight.js/lib/languages/javascript'
// @ts-ignore
import typescript from 'highlight.js/lib/languages/typescript'
// @ts-ignore
import xml from 'highlight.js/lib/languages/xml'
// @ts-ignore
import css from 'highlight.js/lib/languages/css'
// @ts-ignore
import json from 'highlight.js/lib/languages/json'
// @ts-ignore
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/github.css'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('vue', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)

defineOptions({
  name: 'ConfigFullStack',
})

const router = useRouter()

// 当前步骤
const currentStep = ref(0)

// 表单引用
const formRef = ref<FormInstance>()
const trainingScopeFormRef = ref<FormInstance>()

// 表单数据
const formData = ref({
  name: '',
  skillTag: '',
  domainCategory: undefined,
  difficulty: '简单',
  studyHours: '配置任务后自动计算',
  backgroundImage: null as File | null,
  coverImage: null as File | null,
  description: '',
  showTaskRequirement: false,
  trainingScope: '完全公开',
  // 代码仓库相关
  enableCodeRepository: false,
  repositoryType: '代码仓库',
  repositoryUrl: 'https://git.educoder.net/pmper166s9/test9',
})

// 表单验证规则
const formRules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  skillTag: [
    { required: true, message: '请输入技能标签', trigger: 'blur' },
  ],
  domainCategory: [
    { required: true, message: '请选择领域类别', trigger: 'change' },
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' },
  ],
  studyHours: [
    { required: true, message: '请输入学时', trigger: 'blur' },
  ],
  backgroundImage: [
    { required: true, message: '请上传顶部背景图', trigger: 'change' },
  ],
  coverImage: [
    { required: true, message: '请上传封面图', trigger: 'change' },
  ],
  trainingScope: [
    { required: true, message: '请选择培训公开范围', trigger: 'change' },
  ],
}

// 领域类别选项
const domainCategoryOptions = [
  { label: '人工智能', value: '人工智能' },
  { label: '大数据', value: '大数据' },
  { label: '云计算', value: '云计算' },
  { label: 'Web开发', value: 'Web开发' },
]

// 仓库类型选项
const repositoryTypeOptions = [
  { label: '切换仓库', value: '切换仓库' },
  { label: '代码仓库', value: '代码仓库' },
  { label: '私密代码仓库', value: '私密代码仓库' },
]

// 开启版本库弹窗
const showRepositoryModal = ref(false)

// 新建文件弹窗
const showNewFileModal = ref(false)
const newFileFormRef = ref<FormInstance>()
const newFileForm = ref({
  fileName: '',
  commitMessage: '',
  fileContent: '',
})
// 当前新建文件的父节点路径
const currentParentPath = ref('/')

// 新建文件表单验证规则
const newFileRules: Record<string, Rule[]> = {
  fileName: [
    { required: true, message: '请输入文件名称', trigger: 'blur' },
  ],
  commitMessage: [
    { required: true, message: '请输入提交信息', trigger: 'blur' },
  ],
  fileContent: [
    { required: true, message: '请输入文件内容', trigger: 'blur' },
  ],
}

// 新建文件夹弹窗
const showNewFolderModal = ref(false)
const newFolderFormRef = ref<FormInstance>()
const newFolderForm = ref({
  folderName: '',
  commitMessage: '',
})
// 当前新建文件夹的父节点路径
const currentFolderParentPath = ref('/')

// 新建文件夹表单验证规则
const newFolderRules: Record<string, Rule[]> = {
  folderName: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
  ],
  commitMessage: [
    { required: true, message: '请输入提交信息', trigger: 'blur' },
  ],
}

// 代码编辑器行号
const codeLineNumbers = ref<number[]>([1])

// 更新行号
const updateLineNumbers = () => {
  const lines = newFileForm.value.fileContent.split('\n').length
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
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = e.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    // 插入两个空格（或者使用 \t）
    const newValue = value.substring(0, start) + '  ' + value.substring(end)
    newFileForm.value.fileContent = newValue

    // 设置光标位置
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2
    })
  }
}

// 文件树数据
const fileTreeData = ref([
  {
    title: 'src',
    key: '0-0',
    children: [
      {
        title: 'components',
        key: '0-0-0',
        children: [
          { title: 'Header.vue', key: '0-0-0-0', isLeaf: true },
          { title: 'Footer.vue', key: '0-0-0-1', isLeaf: true },
        ],
      },
      {
        title: 'views',
        key: '0-0-1',
        children: [
          { title: 'Home.vue', key: '0-0-1-0', isLeaf: true },
          { title: 'About.vue', key: '0-0-1-1', isLeaf: true },
        ],
      },
      { title: 'App.vue', key: '0-0-2', isLeaf: true },
      { title: 'main.ts', key: '0-0-3', isLeaf: true },
    ],
  },
  {
    title: 'public',
    key: '0-1',
    children: [
      { title: 'index.html', key: '0-1-0', isLeaf: true },
      { title: 'favicon.ico', key: '0-1-1', isLeaf: true },
    ],
  },
  { title: 'package.json', key: '0-2', isLeaf: true },
  { title: 'README.md', key: '0-3', isLeaf: true },
])

// 展开的节点
const expandedKeys = ref(['0-0', '0-0-0'])

// 选中的文件
const selectedFile = ref<{ key: string; title: string; content: string } | null>(null)

// 动态文件内容存储
const dynamicFileContents = ref<Record<string, string>>({})

// 文件内容映射（使用函数避免编译问题）
const getFileContent = (key: string): string => {
  // 优先从动态存储中获取
  if (dynamicFileContents.value[key]) {
    return dynamicFileContents.value[key]
  }
  
  // 否则从预设内容中获取
  const contents: Record<string, string> = {
    '0-0-0-0': '// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"// Header.vue\n<div class="app-header">\n  <div class="logo">My App</div>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</div>\n\n// Component logic\nconst headerTitle = "My App"',
    '0-0-0-1': '// Footer.vue\n<div class="app-footer">\n  <p>&copy; 2024 My App. All rights reserved.</p>\n</div>\n\n// Component styles\n.app-footer {\n  padding: 2rem;\n  text-align: center;\n}',
    '0-0-1-0': '// Home.vue\n<div class="home-page">\n  <h1>Welcome to Home Page</h1>\n  <p>This is the home page content.</p>\n</div>\n\nimport { ref } from "vue"\nconst message = ref("Hello World!")',
    '0-0-1-1': '// About.vue\n<div class="about-page">\n  <h1>About Us</h1>\n  <p>Learn more about our application.</p>\n</div>',
    '0-0-2': '// App.vue\n<div id="app">\n  <Header />\n  <router-view />\n  <Footer />\n</div>\n\nimport Header from "./components/Header.vue"\nimport Footer from "./components/Footer.vue"',
    '0-0-3': 'import { createApp } from "vue"\nimport App from "./App.vue"\nimport router from "./router"\n\nconst app = createApp(App)\napp.use(router)\napp.mount("#app")',
    '0-1-0': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n</head>\n<body>\n  <div id="app"></div>\n</body>\n</html>',
    '0-2': '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "description": "A Vue 3 application",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "vue": "^3.3.0"\n  }\n}',
    '0-3': '# My App\n\nVue 3 application.\n\n## Setup\nnpm install\n\n## Development\nnpm run dev\n\n## Build\nnpm run build',
  }
  return contents[key] || '// File content'
}

// 根据文件扩展名获取语言类型
const getLanguageByFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'vue': 'vue',
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
  }
  return langMap[ext || ''] || 'javascript'
}

// 处理文件选择
const handleSelectFile = (_selectedKeys: any[], e: any) => {
  const node = e.node
  console.log('选中的节点：', node)
  // 只有叶子节点（文件）才显示内容，文件夹不显示
  if (node.isLeaf === true || (node.isLeaf !== false && !node.children)) {
    const content = getFileContent(node.key)
    console.log('文件内容：', content)
    selectedFile.value = {
      key: node.key,
      title: node.title,
      content: content,
    }
  }
}

// 高亮后的代码
const highlightedCode = computed(() => {
  if (!selectedFile.value) return ''
  const language = getLanguageByFilename(selectedFile.value.title)
  try {
    return hljs.highlight(selectedFile.value.content, { language }).value
  } catch (e) {
    return hljs.highlightAuto(selectedFile.value.content).value
  }
})

// 富文本编辑器
const editorRef = shallowRef()
const valueHtml = ref('')

// 富文本编辑器配置
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'bold',
    'italic',
    'underline',
    'through',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    '|',
    'insertLink',
    'insertImage',
    '|',
    'undo',
    'redo',
  ],
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入简介',
  MENU_CONF: {},
}

// 编辑器创建完成
const handleCreated = (editor: any) => {
  editorRef.value = editor
}

// 编辑器内容变化
const handleChange = (editor: any) => {
  formData.value.description = editor.getHtml()
}

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 文件上传处理
const handleBackgroundUpload = (file: File) => {
  formData.value.backgroundImage = file
  // 手动触发表单验证
  formRef.value?.validateFields(['backgroundImage'])
  return false // 阻止自动上传
}

const handleCoverUpload = (file: File) => {
  formData.value.coverImage = file
  // 手动触发表单验证
  formRef.value?.validateFields(['coverImage'])
  return false // 阻止自动上传
}

// 代码仓库开关变化
const handleRepositorySwitchChange = (checked: boolean | string | number) => {
  const isChecked = typeof checked === 'boolean' ? checked : Boolean(checked)
  if (isChecked) {
    // 如果要打开，显示确认弹窗
    showRepositoryModal.value = true
  } else {
    // 直接关闭
    formData.value.enableCodeRepository = false
  }
}

// 确认开启版本库
const handleConfirmRepository = () => {
  formData.value.enableCodeRepository = true
  showRepositoryModal.value = false
}

// 取消开启版本库
const handleCancelRepository = () => {
  formData.value.enableCodeRepository = false
  showRepositoryModal.value = false
}

// 获取节点的完整路径
const getNodePath = (nodeKey: string): string => {
  const findPath = (nodes: any[], targetKey: string, currentPath: string = ''): string | null => {
    for (const node of nodes) {
      const nodePath = currentPath + '/' + node.title
      
      if (node.key === targetKey) {
        return nodePath
      }
      
      if (node.children) {
        const result = findPath(node.children, targetKey, nodePath)
        if (result) return result
      }
    }
    return null
  }
  
  return findPath(fileTreeData.value, nodeKey) || '/'
}

// 打开新建文件弹窗
const handleNewFile = (parentPath: string = '/') => {
  showNewFileModal.value = true
  currentParentPath.value = parentPath
  // 重置表单
  newFileForm.value = {
    fileName: '',
    commitMessage: '',
    fileContent: '',
  }
  // 重置行号
  codeLineNumbers.value = [1]
  newFileFormRef.value?.clearValidate()
}

// 取消新建文件
const handleCancelNewFile = () => {
  showNewFileModal.value = false
  newFileFormRef.value?.resetFields()
}

// 确认新建文件
const handleConfirmNewFile = async () => {
  try {
    await newFileFormRef.value?.validate()
    
    // 这里添加新建文件的逻辑
    console.log('新建文件数据：', newFileForm.value)
    
    // 生成新的文件节点
    const newKey = `0-new-file-${Date.now()}`
    const newFile = {
      title: newFileForm.value.fileName,
      key: newKey,
      isLeaf: true,
    }
    
    // 保存文件内容到动态存储
    dynamicFileContents.value[newKey] = newFileForm.value.fileContent
    console.log('文件内容已保存：', newKey, dynamicFileContents.value[newKey])
    
    // 添加到文件树的正确位置
    if (currentParentPath.value === '/') {
      // 添加到根目录
      fileTreeData.value.push(newFile)
    } else {
      // 查找父节点并添加到其 children 中
      const findAndAddToParent = (nodes: any[], targetPath: string): boolean => {
        for (const node of nodes) {
          const nodePath = getNodePath(node.key)
          if (nodePath === targetPath) {
            if (!node.children) {
              node.children = []
            }
            node.children.push(newFile)
            // 展开父节点
            if (!expandedKeys.value.includes(node.key)) {
              expandedKeys.value.push(node.key)
            }
            return true
          }
          if (node.children && findAndAddToParent(node.children, targetPath)) {
            return true
          }
        }
        return false
      }
      
      findAndAddToParent(fileTreeData.value, currentParentPath.value)
    }
    
    message.success('文件创建成功')
    showNewFileModal.value = false
    newFileFormRef.value?.resetFields()
  } catch (error) {
    console.error('表单验证失败：', error)
  }
}

// 打开新建文件夹弹窗
const handleNewFolder = (parentPath: string = '/') => {
  showNewFolderModal.value = true
  currentFolderParentPath.value = parentPath
  // 重置表单
  newFolderForm.value = {
    folderName: '',
    commitMessage: '',
  }
  newFolderFormRef.value?.clearValidate()
}

// 取消新建文件夹
const handleCancelNewFolder = () => {
  showNewFolderModal.value = false
  newFolderFormRef.value?.resetFields()
}

// 确认新建文件夹
const handleConfirmNewFolder = async () => {
  try {
    await newFolderFormRef.value?.validate()
    
    // 这里添加新建文件夹的逻辑
    console.log('新建文件夹数据：', newFolderForm.value)
    
    // 生成新的文件夹节点
    const newKey = `0-new-folder-${Date.now()}`
    
    // 方式1：与现有文件夹结构完全一致
    const newFolder: any = {
      title: newFolderForm.value.folderName,
      key: newKey,
      children: [],
    }
    
    console.log('新建的文件夹节点：', newFolder)
    console.log('现有的文件树：', fileTreeData.value)
    
    // 添加到文件树的正确位置
    if (currentFolderParentPath.value === '/') {
      // 添加到根目录
      fileTreeData.value.push(newFolder)
    } else {
      // 查找父节点并添加到其 children 中
      const findAndAddToParent = (nodes: any[], targetPath: string): boolean => {
        for (const node of nodes) {
          const nodePath = getNodePath(node.key)
          if (nodePath === targetPath) {
            if (!node.children) {
              node.children = []
            }
            node.children.push(newFolder)
            // 展开父节点
            if (!expandedKeys.value.includes(node.key)) {
              expandedKeys.value.push(node.key)
            }
            return true
          }
          if (node.children && findAndAddToParent(node.children, targetPath)) {
            return true
          }
        }
        return false
      }
      
      findAndAddToParent(fileTreeData.value, currentFolderParentPath.value)
    }
    
    // 自动展开新建的文件夹
    expandedKeys.value.push(newKey)
    
    // 强制更新视图
    nextTick(() => {
      console.log('更新后的文件树：', fileTreeData.value)
    })
    
    message.success('文件夹创建成功')
    showNewFolderModal.value = false
    newFolderFormRef.value?.resetFields()
  } catch (error) {
    console.error('表单验证失败：', error)
  }
}

// 处理菜单点击
const handleMenuClick = (info: any) => {
  const key = String(info.key)
  switch (key) {
    case 'newFile':
      handleNewFile()
      break
    case 'newFolder':
      handleNewFolder()
      break
    case 'upload':
      message.info('上传功能开发中...')
      break
  }
}

// 处理树节点菜单点击
const handleTreeNodeMenuClick = (info: any, nodeData: any) => {
  const menuKey = String(info.key)
  console.log('树节点菜单点击：', menuKey, nodeData)
  
  // 获取节点路径
  const nodePath = getNodePath(nodeData.key)
  
  switch (menuKey) {
    case 'newFile':
      // 在选中的文件夹下新建文件
      handleNewFile(nodePath)
      break
    case 'newFolder':
      // 在选中的文件夹下新建文件夹
      handleNewFolder(nodePath)
      break
    case 'upload':
      message.info('上传功能开发中...')
      break
    case 'rename':
      handleRenameNode(nodeData)
      break
    case 'copyPath':
      handleCopyPath(nodeData)
      break
    case 'delete':
      handleDeleteNode(nodeData)
      break
  }
}

// 重命名节点
const handleRenameNode = (nodeData: any) => {
  Modal.confirm({
    title: '重命名',
    content: h('div', [
      h('p', `当前名称：${nodeData.title}`),
      h('input', {
        id: 'rename-input',
        placeholder: '请输入新名称',
        style: 'width: 100%; padding: 4px 11px; border: 1px solid #d9d9d9; border-radius: 2px;',
      }),
    ]),
    onOk: () => {
      const input = document.getElementById('rename-input') as HTMLInputElement
      const newName = input?.value.trim()
      if (!newName) {
        message.error('请输入新名称')
        return Promise.reject()
      }
      
      // 在文件树中找到并更新节点名称
      const updateNodeName = (nodes: any[]): boolean => {
        for (const node of nodes) {
          if (node.key === nodeData.key) {
            node.title = newName
            message.success('重命名成功')
            return true
          }
          if (node.children && updateNodeName(node.children)) {
            return true
          }
        }
        return false
      }
      
      updateNodeName(fileTreeData.value)
      
      // 如果当前选中的是被重命名的文件，更新选中文件的标题
      if (selectedFile.value && selectedFile.value.key === nodeData.key) {
        selectedFile.value.title = newName
      }
    },
  })
}

// 复制路径
const handleCopyPath = (nodeData: any) => {
  const path = getNodePath(nodeData.key)
  navigator.clipboard.writeText(path).then(() => {
    message.success(`路径已复制到剪贴板: ${path}`)
  }).catch(() => {
    message.error('复制失败')
  })
}

// 删除节点
const handleDeleteNode = (nodeData: any) => {
  const isFolder = nodeData.children !== undefined || nodeData.isLeaf === false
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除${isFolder ? '文件夹' : '文件'} "${nodeData.title}" 吗？${isFolder ? '文件夹下的所有内容也会被删除。' : ''}`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      // 从文件树中删除节点
      const deleteNode = (nodes: any[]): boolean => {
        const index = nodes.findIndex(node => node.key === nodeData.key)
        if (index !== -1) {
          nodes.splice(index, 1)
          message.success('删除成功')
          
          // 如果删除的是当前选中的文件，清空选中状态
          if (selectedFile.value?.key === nodeData.key) {
            selectedFile.value = null
          }
          
          // 删除动态文件内容
          if (dynamicFileContents.value[nodeData.key]) {
            delete dynamicFileContents.value[nodeData.key]
          }
          
          return true
        }
        
        for (const node of nodes) {
          if (node.children && deleteNode(node.children)) {
            return true
          }
        }
        return false
      }
      
      deleteNode(fileTreeData.value)
    },
  })
}

// 滚动到顶部的通用函数
const scrollToTop = () => {
  nextTick(() => {
    // 尝试多种方式滚动到顶部
    // 1. 滚动 window
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // 2. 滚动 document.documentElement
    document.documentElement.scrollTop = 0
    
    // 3. 滚动 body
    document.body.scrollTop = 0
    
    // 4. 如果有特定的滚动容器（如 .page-content 或布局容器）
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      pageContent.scrollTop = 0
    }
    
    // 5. 尝试滚动布局容器
    const layoutContent = document.querySelector('.ant-layout-content')
    if (layoutContent) {
      layoutContent.scrollTop = 0
    }
    
    // 6. 查找所有可能的滚动容器并滚动到顶部
    const scrollableElements = document.querySelectorAll('*')
    scrollableElements.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTop = 0
      }
    })
  })
}

// 返回
const handleBack = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    scrollToTop()
  } else {
    router.back()
  }
}

// 下一步
const handleNext = async () => {
  if (currentStep.value === 0) {
    try {
      // 第一步：同时验证两个表单
      await Promise.all([
        formRef.value?.validate(),
        trainingScopeFormRef.value?.validate()
      ])
      console.log('表单数据：', formData.value)
      currentStep.value = 1
      scrollToTop()
    } catch (error) {
      message.error('请完善必填信息')
      currentStep.value = 1
      scrollToTop()
    }
  } else if (currentStep.value === 1) {
    // 第二步：代码仓库
    currentStep.value = 2
    scrollToTop()
  } else if (currentStep.value === 2) {
    // 第三步：任务关卡
    currentStep.value = 3
    scrollToTop()
  }
}
</script>

<template>
  <div class="config-full-stack-page">
    <div class="page-header">
      <h2>全栈环境实训项目配置</h2>
    </div>

    <div class="page-content">
      <!-- 步骤条 -->
      <div class="steps-container">
        <a-steps :current="currentStep">
          <a-step title="基本信息" />
          <a-step title="代码仓库" />
          <a-step title="任务关卡" />
          <a-step title="实验环境" />
        </a-steps>
      </div>

      <!-- 第一步：基本信息 -->
      <div v-if="currentStep === 0">
        <!-- 基本信息标题 -->
        <div class="section-title">
          <h3>基本信息</h3>
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
          <a-form ref="formRef" :model="formData" :rules="formRules" layout="horizontal" :label-col="{ span: 2 }"
            :wrapper-col="{ span: 18 }">
            <a-form-item label="名称" name="name" required>
              <a-input v-model:value="formData.name" placeholder="请输入名称" />
            </a-form-item>

            <a-row>
              <a-col :span="12">
                <a-form-item label="技能标签" name="skillTag" required :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                  <a-input v-model:value="formData.skillTag" placeholder="请输入技能标签" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="领域类别" name="domainCategory" required :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 12 }">
                  <a-select v-model:value="formData.domainCategory" placeholder="请选择领域类别"
                    :options="domainCategoryOptions" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="难度" name="difficulty" required>
              <a-radio-group v-model:value="formData.difficulty" class="custom-radio">
                <a-radio value="简单">简单</a-radio>
                <a-radio value="适中">适中</a-radio>
                <a-radio value="困难">困难</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="学时" name="studyHours" required>
              <a-input v-model:value="formData.studyHours" disabled />
            </a-form-item>

            <a-form-item label="顶部背景图" name="backgroundImage" required>
              <div class="flex items-top gap-16px">
                <a-upload :before-upload="handleBackgroundUpload" :show-upload-list="false"
                  accept="image/png,image/jpeg">
                  <a-button>选择文件</a-button>
                </a-upload>
                <div class="upload-hint">
                  说明：支持上传png/jpeg等格式文件，文件大小不能超过12M,建议使用290*218像素；如不上传，默认使用系统图片。
                </div>
              </div>
            </a-form-item>

            <a-form-item label="封面图" name="coverImage" required>
              <div class="flex items-top gap-16px">
                <a-upload :before-upload="handleCoverUpload" :show-upload-list="false" accept="image/png,image/jpeg">
                  <a-button>选择文件</a-button>
                </a-upload>
                <div class="upload-hint">
                  说明：支持上传png/jpeg等格式文件，文件大小不能超过12M,建议使用290*218像素；如不上传，默认使用系统图片。
                </div>
              </div>
            </a-form-item>

            <a-form-item label="简介" name="description">
              <div class="editor-container">
                <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="'default'" class="editor-toolbar" />
                <Editor v-model="valueHtml" :defaultConfig="editorConfig" :mode="'default'" class="editor-content"
                  @onCreated="handleCreated" @onChange="handleChange" />
              </div>
            </a-form-item>

            <a-form-item label="任务要求" name="showTaskRequirement">
              <a-checkbox v-model:checked="formData.showTaskRequirement">
                显示任务要求（勾选后，将帮作为任务要求显示在任务项目政策面）
              </a-checkbox>
            </a-form-item>
          </a-form>
        </div>

        <!-- 培训公开范围标题 -->
        <div class="section-title">
          <h3>培训公开范围</h3>
        </div>

        <!-- 培训公开范围表单 -->
        <div class="form-section">
          <a-form ref="trainingScopeFormRef" :model="formData" :rules="formRules" layout="horizontal"
            :label-col="{ span: 2 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="培训公开范围" name="trainingScope" required>
              <a-radio-group v-model:value="formData.trainingScope" class="custom-radio">
                <a-radio value="完全公开">完全公开</a-radio>
                <a-radio value="全院公开">全院公开</a-radio>
                <a-radio value="本单位公开">本单位公开</a-radio>
                <a-radio value="不公开">不公开</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </div>
      </div>

      <!-- 第二步：代码仓库 -->
      <div v-if="currentStep === 1">
        <!-- 代码仓库表单 -->
        <div class="form-section repository-section">
          <!-- 顶部：下拉菜单 + 仓库地址 -->
          <div class="repository-top-bar flex items-center gap-16px justify-between">
            <a-select v-model:value="formData.repositoryType" :options="repositoryTypeOptions"
              class="repository-type-select" />
            <div class="repository-url-group">
              <span class="url-label">仓库地址：</span>
              <a-input v-model:value="formData.repositoryUrl" placeholder="请输入仓库地址" class="url-input" />
            </div>
          </div>

          <!-- 下方：左右布局 -->
          <div class="repository-main-area">
            <!-- 左侧：开关 + 提示 -->
            <div class="repository-left">
              <div class="repository-switch-box flex items-center justify-between">
                <div class="flex items-center gap-12px">
                  <span class="switch-label">代码仓库</span>
                  <a-switch :checked="formData.enableCodeRepository" @change="handleRepositorySwitchChange" />
                </div>
                <a-dropdown v-if="formData.enableCodeRepository">
                  <template #overlay>
                    <a-menu @click="handleMenuClick">
                      <a-menu-item key="newFile">新建文件</a-menu-item>
                      <a-menu-item key="newFolder">新建文件夹</a-menu-item>
                      <a-menu-item key="upload">上传</a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="primary" size="small">
                    <PlusOutlined />
                    新建
                  </a-button>
                </a-dropdown>
              </div>


              <!-- 文件树 -->
              <div v-if="formData.enableCodeRepository" class="file-tree-container">
                <div class="tree-header">
                  <span class="tree-title">文件目录</span>
                </div>
                <div class="tree-content">
                  <a-tree v-model:expanded-keys="expandedKeys" :tree-data="fileTreeData" :show-icon="false"
                    :show-line="true" @select="handleSelectFile">
                    <template #title="{ title, isLeaf, children, key }">
                      <span class="tree-node-title-wrapper">
                        <span class="tree-node-title">
                          <span v-if="children !== undefined || isLeaf === false" class="folder-icon">📁</span>
                          <span v-else class="file-icon">📄</span>
                          {{ title }}
                        </span>
                        <a-dropdown :trigger="['click']" placement="bottomRight">
                          <template #overlay>
                            <a-menu @click="(info) => handleTreeNodeMenuClick(info, { key, title, isLeaf, children })">
                              <!-- 文件夹菜单 -->
                              <template v-if="children !== undefined || isLeaf === false">
                                <a-menu-item key="newFile">
                                  <span>新建文件</span>
                                </a-menu-item>
                                <a-menu-item key="newFolder">
                                  <span>新建文件夹</span>
                                </a-menu-item>
                                <a-menu-item key="upload">
                                  <span>上传</span>
                                </a-menu-item>
                                <a-menu-divider />
                                <a-menu-item key="copyPath">
                                  <span>复制路径</span>
                                </a-menu-item>
                                <a-menu-item key="delete" danger>
                                  <span>删除</span>
                                </a-menu-item>
                              </template>
                              <!-- 文件菜单 -->
                              <template v-else>
                                <a-menu-item key="rename">
                                  <span>重命名</span>
                                </a-menu-item>
                                <a-menu-item key="copyPath">
                                  <span>复制路径</span>
                                </a-menu-item>
                                <a-menu-item key="delete" danger>
                                  <span>删除</span>
                                </a-menu-item>
                              </template>
                            </a-menu>
                          </template>
                          <span class="tree-node-more" @click.stop>
                            <MoreOutlined />
                          </span>
                        </a-dropdown>
                      </span>
                    </template>
                  </a-tree>
                </div>
              </div>

              <div v-if="formData.enableCodeRepository" class="repository-tips">
                <div class="tips-title">提示：</div>
                <div class="tips-content">
                  此处存放本实训所需的所有代码等相关文件，你可以通过以下：
                </div>
                <div class="tips-list">
                  1、<a href="#" class="tips-link">Gitee客户端</a> 上传已有文件来开始使用。
                </div>
                <div class="tips-list">
                  2、直接在平台上创建文件目录以及相关代码文件。
                </div>
              </div>
            </div>

            <!-- 右侧：文件预览区域 -->
            <div class="repository-right">
              <div v-if="formData.enableCodeRepository" class="file-preview-area">
                <div v-if="selectedFile" class="file-preview">
                  <div class="file-header">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ selectedFile.title }}</span>
                  </div>
                  <div class="file-content">
                    <pre><code class="hljs" v-html="highlightedCode"></code></pre>
                  </div>
                </div>
                <div v-else class="empty-preview">
                  在左侧代码仓库区域点击目录打开文件
                </div>
              </div>
              <div v-else class="empty-area">
                在左侧代码仓库区域点击目录打开文件
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="page-footer">
        <a-button v-if="currentStep === 0" @click="handleBack">返回</a-button>
        <a-button v-else @click="handleBack">上一步</a-button>
        <a-button type="primary" @click="handleNext">下一步</a-button>
      </div>
    </div>

    <!-- 开启版本库弹窗 -->
    <a-modal v-model:open="showRepositoryModal" title="开启版本库" :footer="null" width="480px" centered>
      <div class="repository-modal-content">
        <div class="modal-icon">
          <ExclamationCircleOutlined style="color: #faad14; font-size: 24px;" />
        </div>
        <div class="modal-text">
          新建实践题关卡时，需要使用代码仓库；如果只有选择关卡，则不需要代码仓库。代码仓库启用后，将无法关闭。
        </div>
      </div>
      <div class="modal-footer">
        <a-button @click="handleCancelRepository">不开启</a-button>
        <a-button type="primary" @click="handleConfirmRepository">开启</a-button>
      </div>
    </a-modal>

    <!-- 新建文件弹窗 -->
    <a-modal v-model:open="showNewFileModal" title="新建文件" :footer="null" width="880px" centered>
      <a-form ref="newFileFormRef" :model="newFileForm" :rules="newFileRules" layout="vertical">
        <a-form-item label="文件名称或文件路径：" name="fileName" required>
          <a-input v-model:value="newFileForm.fileName" placeholder="请输入文件名称">
            <template #addonBefore>
              <div class="min-w-100px max-w-150px">{{ currentParentPath }}</div>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="提交信息：" name="commitMessage" required>
          <a-input 
            v-model:value="newFileForm.commitMessage" 
            placeholder="请输入本次提交的主要信息，合理的描信息有利于代历史记录的查理"
          />
        </a-form-item>

        <a-form-item label="文件内容：" name="fileContent" required>
          <div class="code-editor-wrapper">
            <div class="code-editor-line-numbers">
              <div 
                v-for="line in codeLineNumbers" 
                :key="line" 
                class="line-number"
              >
                {{ line }}
              </div>
            </div>
            <textarea 
              v-model="newFileForm.fileContent"
              class="code-editor-textarea"
              placeholder="请输入文件内容"
              @input="updateLineNumbers"
              @scroll="syncScroll"
              @keydown="handleKeydown"
              spellcheck="false"
            />
          </div>
        </a-form-item>
      </a-form>

      <div class="modal-footer">
        <a-button @click="handleCancelNewFile">取消</a-button>
        <a-button type="primary" @click="handleConfirmNewFile">确定</a-button>
      </div>
    </a-modal>

    <!-- 新建文件夹弹窗 -->
    <a-modal v-model:open="showNewFolderModal" title="新建文件夹" :footer="null" width="600px" centered>
      <a-form ref="newFolderFormRef" :model="newFolderForm" :rules="newFolderRules" layout="vertical">
        <a-form-item label="文件夹名称：" name="folderName" required>
          <a-input v-model:value="newFolderForm.folderName" placeholder="请输入文件夹名称">
            <template #addonBefore>
              <div class="min-w-100px max-w-150px">{{ currentFolderParentPath }}</div>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="提交信息：" name="commitMessage" required>
          <a-input 
            v-model:value="newFolderForm.commitMessage" 
            placeholder="请输入本次提交的主要信息，合理的描信息有利于代历史记录的查理"
          />
        </a-form-item>
      </a-form>

      <div class="modal-footer">
        <a-button @click="handleCancelNewFolder">取消</a-button>
        <a-button type="primary" @click="handleConfirmNewFolder">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.config-full-stack-page {
  background: #f0f2f5;
  // min-height: 100vh;

  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin: 0 24px 16px 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    text-align: center;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  .page-content {
    background: #fff;
    margin: 0 24px;
    padding: 24px;
    border-radius: 4px;

    .steps-container {
      margin-bottom: 32px;
      padding: 0 100px;
    }

    .section-title{
      background: #40a9ff;
      padding: 8px 18px;
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
      h3{
        margin: 0;
      }
    }


    .form-section {
      .ant-form-item {
        margin-bottom: 24px;

        :deep(.ant-form-item-label) {
          font-weight: 500;

          label {
            &::before {
              color: #ff4d4f !important;
              margin-right: 4px;
            }
          }
        }

        .upload-hint {
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;
          line-height: 1.6;
        }

        .editor-container {
          border: 1px solid #d9d9d9;
          border-radius: 2px;
          transition: all 0.3s;

          &:hover {
            border-color: #40a9ff;
          }

          &:focus-within {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
          }

          .editor-toolbar {
            border-bottom: 1px solid #e8e8e8;
            background: #fafafa;
          }

          .editor-content {
            height: 300px !important;
            overflow-y: auto;
            background: #fff;

            :deep(.w-e-text-container) {
              background: #fff;
            }

            :deep(.w-e-text-placeholder) {
              color: #bfbfbf;
            }
          }
        }
      }

      // 代码仓库样式
      &.repository-section {

        // 顶部栏：下拉菜单 + 仓库地址
        .repository-top-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;

          .repository-type-select {
            width: 200px;
          }

          .repository-url-group {
            width: 450px;
            display: flex;
            align-items: center;
            gap: 8px;

            .url-label {
              font-size: 14px;
              color: rgba(0, 0, 0, 0.85);
              white-space: nowrap;
            }

            .url-input {
              flex: 1;
            }
          }
        }

        // 主区域：左右布局
        .repository-main-area {
          display: flex;
          gap: 16px;
          min-height: 400px;
          max-height: calc(100vh - 320px); // 动态高度：浏览器高度减去其他区域（header、footer等）

          // 左侧：开关 + 提示
          .repository-left {
            width: 380px;
            background: #fafafa;
            border: 1px solid #e8e8e8;

            display: flex;
            flex-direction: column;

            .repository-switch-box {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: #fafafa;
              border-radius: 4px;

              .switch-label {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.85);
                font-weight: 500;
                margin-right: auto;
              }
            }

            .repository-tips {
              // background: #f5f5f5;
              border-radius: 4px;
              font-size: 12px;
              margin: 0 12px;
              padding: 6px 0;

              .tips-title {
                font-weight: 500;
                color: rgba(0, 0, 0, 0.85);
              }

              .tips-content {
                color: rgba(0, 0, 0, 0.65);
              }

              .tips-list {
                color: rgba(0, 0, 0, 0.65);

                .tips-link {
                  color: #1890ff;
                  text-decoration: none;

                  &:hover {
                    text-decoration: underline;
                  }
                }
              }
            }

            .file-tree-container {
              flex: 1;
              min-height: 250px; // 确保文件树在小屏幕上也有足够的高度
              max-height: 500px;
              margin: 0 12px 4px 12px;
              background: #fff;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              overflow: hidden;

              .tree-header {
                padding: 4px 16px;
                background: #fafafa;
                border-bottom: 1px solid #e8e8e8;

                .tree-title {
                  font-size: 14px;
                  font-weight: 500;
                  color: rgba(0, 0, 0, 0.85);
                }
              }

              .tree-content {
                flex: 1;
                padding: 12px;
                overflow-y: auto;

                :deep(.ant-tree) {
                  background: transparent;
                  font-size: 14px;

                  .ant-tree-treenode {
                    padding: 2px 0;
                    width: 100%;

                    &:hover {
                      background: #f5f5f5;
                    }
                  }

                  .ant-tree-node-content-wrapper {
                    width: 100% !important;
                    flex: 1 !important;
                    
                    &:hover {
                      background: transparent;
                    }
                  }

                  .ant-tree-title {
                    width: 100%;
                  }

                  .tree-node-title-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    min-width: 0;
                    padding-right: 4px;

                    .tree-node-title {
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      flex: 1;
                      min-width: 0;
                      overflow: hidden;

                      .folder-icon,
                      .file-icon {
                        font-size: 14px;
                        flex-shrink: 0;
                      }
                    }

                    .tree-node-more {
                      display: none;
                      align-items: center;
                      justify-content: center;
                      width: 24px;
                      height: 24px;
                      border-radius: 2px;
                      cursor: pointer;
                      color: rgba(0, 0, 0, 0.45);
                      transition: all 0.2s;
                      flex-shrink: 0;
                      margin-left: 8px;
                      transform: rotate(90deg);
                      color: #333;
                      font-weight: bold;
                      &:hover {
                        background: rgba(0, 0, 0, 0.06);
                        color: rgba(0, 0, 0, 1);
                      }
                    }

                    &:hover {
                      .tree-node-more {
                        display: flex;
                      }
                    }
                  }
                }
              }
            }
          }

          // 右侧：文件预览区域
          .repository-right {
            flex: 1;
            display: flex;
            flex-direction: column;

            .file-preview-area {
              flex: 1;
              background: #fff;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              overflow: hidden;

              .file-preview {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;

                .file-header {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 12px 16px;
                  background: #fafafa;
                  border-bottom: 1px solid #e8e8e8;

                  .file-icon {
                    font-size: 16px;
                  }

                  .file-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(0, 0, 0, 0.85);
                  }
                }

                .file-content {
                  flex: 1;
                  overflow: auto;
                  padding: 16px;
                  background: #f6f8fa;

                  pre {
                    margin: 0;
                    padding: 16px;
                    background: #fff;
                    border-radius: 6px;
                    border: 1px solid #e1e4e8;

                    code.hljs {
                      display: block;
                      overflow-x: auto;
                      padding: 0;
                      background: transparent;
                      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                      font-size: 13px;
                      line-height: 1.6;
                      color: #24292e;
                      white-space: pre;
                      word-wrap: normal;
                    }
                  }
                }
              }

              .empty-preview {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(0, 0, 0, 0.45);
                font-size: 14px;
              }
            }

            .empty-area {
              flex: 1;
              background: #fafafa;
              border: 1px dashed #d9d9d9;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: rgba(0, 0, 0, 0.45);
              font-size: 14px;
            }
          }
        }
      }

    }

    .page-footer {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding-top: 32px;
      margin-top: 20px;
      border-top: 1px solid #f0f0f0;

      .ant-btn {
        min-width: 100px;
        padding: 0 32px;
      }
    }
  }
}

// 开启版本库弹窗样式
.repository-modal-content {
  display: flex;
  gap: 16px;
  padding: 16px 0;

  .modal-icon {
    flex-shrink: 0;
  }

  .modal-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.85);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 自定义镂空样式 */
.custom-radio ::v-deep(.ant-radio-wrapper:hover .ant-radio),
.custom-radio ::v-deep(.ant-radio:hover .ant-radio-inner),
.custom-radio ::v-deep(.ant-radio-input:focus + .ant-radio-inner) {
  border-color: var(--pro-ant-color-primary);
}

.custom-radio ::v-deep(.ant-radio-inner) {
  background-color: transparent;
  border-color: #d9d9d9;
}

.custom-radio ::v-deep(.ant-radio-checked .ant-radio-inner) {
  background-color: transparent;
  border-color: var(--pro-ant-color-primary);
}

.custom-radio ::v-deep(.ant-radio-inner::after) {
  background-color: var(--pro-ant-color-primary);
  transform: scale(0.5);
}

/* 代码编辑器样式 */
.code-editor-wrapper {
  position: relative;
  display: flex;
  height: 400px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    border-color: #40a9ff;
  }

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  .code-editor-line-numbers {
    flex-shrink: 0;
    width: 48px;
    height: 100%;
    background: #f6f8fa;
    border-right: 1px solid #e1e4e8;
    overflow-y: hidden;
    overflow-x: hidden;
    user-select: none;
    padding: 12px 0;
    text-align: right;

    .line-number {
      height: 21px;
      line-height: 21px;
      padding-right: 10px;
      font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      color: #6e7781;
    }
  }

  .code-editor-textarea {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 21px;
    color: #24292e;
    background: #fff;
    overflow-y: auto;
    overflow-x: auto;
    tab-size: 2;

    &::placeholder {
      color: #bfbfbf;
    }

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 5px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
}
</style>
