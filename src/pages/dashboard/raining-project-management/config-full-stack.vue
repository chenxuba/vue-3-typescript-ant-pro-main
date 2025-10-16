<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
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

// 文件内容映射（使用函数避免编译问题）
const getFileContent = (key: string): string => {
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
  if (node.isLeaf) {
    selectedFile.value = {
      key: node.key,
      title: node.title,
      content: getFileContent(node.key),
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

// 返回
const handleBack = () => {
  if (currentStep.value > 0) {
    currentStep.value--
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
    } catch (error) {
      message.error('请完善必填信息')
      currentStep.value = 1

    }
  } else if (currentStep.value === 1) {
    // 第二步：代码仓库
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    // 第三步：任务关卡
    currentStep.value = 3
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

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="技能标签" name="skillTag" required :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                  <a-input v-model:value="formData.skillTag" placeholder="请输入技能标签" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="领域类别" name="domainCategory" required :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }">
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
                    <a-menu>
                      <a-menu-item key="1">新建文件</a-menu-item>
                      <a-menu-item key="2">新建文件夹</a-menu-item>
                      <a-menu-item key="3">上传</a-menu-item>
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
                  <a-tree
                    v-model:expanded-keys="expandedKeys"
                    :tree-data="fileTreeData"
                    :show-icon="false"
                    :show-line="true"
                    @select="handleSelectFile"
                  >
                    <template #title="{ title, isLeaf }">
                      <span class="tree-node-title">
                        <span v-if="!isLeaf" class="folder-icon">📁</span>
                        <span v-else class="file-icon">📄</span>
                        {{ title }}
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
  </div>
</template>

<style scoped lang="less">
.config-full-stack-page {
  background: #f0f2f5;
  min-height: 100vh;

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
            height: 200px !important;
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
              margin:0 12px 4px 12px;
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

                    &:hover {
                      background: #f5f5f5;
                    }
                  }

                  .ant-tree-node-content-wrapper {
                    &:hover {
                      background: transparent;
                    }
                  }

                  .tree-node-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    .folder-icon,
                    .file-icon {
                      font-size: 14px;
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
</style>
