<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined, DeleteOutlined, EditOutlined, HolderOutlined, MoreOutlined } from '@ant-design/icons-vue'
// @ts-ignore
import hljs from 'highlight.js/lib/core'
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

// 组件导入
import FileTreeComponent from './components/FileTreeComponent.vue'
import FilePreview from './components/FilePreview.vue'
import RichTextEditor from './components/RichTextEditor.vue'
import NewFileModal from './components/NewFileModal.vue'
import NewFolderModal from './components/NewFolderModal.vue'
import RepositoryModal from './components/RepositoryModal.vue'
import QuestionModal from './components/QuestionModal.vue'

// Composables
import { useFileTree } from './composables/useFileTree'
import { useTaskLevel } from './composables/useTaskLevel'

// Types
import type { FormData, NewFileForm, NewFolderForm, ExperimentEnvironmentForm } from './types'

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
const experimentFormRef = ref<FormInstance>()

// 表单数据
const formData = ref<FormData>({
  name: '',
  skillTag: '',
  domainCategory: undefined,
  difficulty: '简单',
  studyHours: '配置任务后自动计算',
  backgroundImage: null,
  coverImage: null,
  description: '',
  showTaskRequirement: false,
  trainingScope: '完全公开',
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

// 实验环境列表
interface ExperimentEnvironment {
  id: string
  name: string
  isEditing: boolean
  config: ExperimentEnvironmentForm
}

const experimentEnvironments = ref<ExperimentEnvironment[]>([
  {
    id: '1',
    name: '实验环境1',
    isEditing: false,
    config: {
      experimentImage: 'Python3.6',
      experimentInterfaces: [],
      attachedEnvironment: undefined,
      applicationCard: undefined,
      programmingLanguage: undefined,
      startupCommand: undefined,
      containerPort: undefined,
      route: undefined,
    }
  }
])

const activeEnvironmentKey = ref('1')
const editingEnvironmentName = ref('')

// 实验环境验证规则
const experimentFormRules: Record<string, Rule[]> = {
  experimentImage: [
    { required: true, message: '请选择实验镜像', trigger: 'change' },
  ],
  experimentInterfaces: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个实验界面', trigger: 'change' },
  ],
  containerPort: [
    { required: true, message: '请输入容器端口', trigger: 'blur' },
  ],
}

// 获取当前激活的环境配置
const currentEnvironmentConfig = computed(() => {
  const env = experimentEnvironments.value.find(e => e.id === activeEnvironmentKey.value)
  return env?.config || experimentEnvironments.value[0]?.config
})

// 使用文件树composable
const {
  fileTreeData,
  expandedKeys,
  selectedFile,
  highlightedCode,
  handleSelectFile,
  getNodePath,
  addFileToTree,
  addFolderToTree,
  handleRenameNode,
  handleCopyPath,
  handleDeleteNode,
} = useFileTree()

// 使用任务关卡composable
const {
  taskLevels,
  selectedTaskLevelId,
  currentTab,
  taskLevelFormRef,
  evaluationFormRef,
  taskLevelFormData,
  evaluationFormData,
  taskLevelFormRules,
  evaluationFormRules,
  isKernelTask,
  isChoiceTask,
  isProgrammingTask,
  addTaskLevel,
  deleteTaskLevel,
  selectTaskLevel,
  saveTaskLevel,
  resetTaskLevel,
  handleLearningResourceUpload,
  handleStudentTaskFileUpload,
  handleEvaluationFileUpload,
  addTestCase,
  removeTestCase,
  clearAllTestCases,
  downloadTemplate,
  batchUploadTestCases,
  getCurrentQuestions,
  addQuestion,
  deleteQuestion,
  updateQuestion,
  updateQuestionsOrder,
} = useTaskLevel()

// 弹窗状态
const showRepositoryModal = ref(false)
const showNewFileModal = ref(false)
const showNewFolderModal = ref(false)
const showQuestionModal = ref(false)
const currentEditingQuestion = ref<any>(null) // 当前编辑的题目
const currentParentPath = ref('/')
const currentFolderParentPath = ref('/')

// 文件上传处理
const handleBackgroundUpload = (file: File) => {
  formData.value.backgroundImage = file
  formRef.value?.validateFields(['backgroundImage'])
  return false
}

const handleCoverUpload = (file: File) => {
  formData.value.coverImage = file
  formRef.value?.validateFields(['coverImage'])
  return false
}

// 代码仓库开关变化
const handleRepositorySwitchChange = (checked: boolean | string | number) => {
  const isChecked = typeof checked === 'boolean' ? checked : Boolean(checked)
  if (isChecked) {
    showRepositoryModal.value = true
  } else {
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
  const nodePath = getNodePath(nodeData.key)
  
  switch (menuKey) {
    case 'newFile':
      handleNewFile(nodePath)
      break
    case 'newFolder':
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

// 打开新建文件弹窗
const handleNewFile = (parentPath: string = '/') => {
  showNewFileModal.value = true
  currentParentPath.value = parentPath
}

// 确认新建文件
const handleConfirmNewFile = (formData: NewFileForm) => {
  addFileToTree(formData.fileName, formData.fileContent, currentParentPath.value)
  message.success('文件创建成功')
  showNewFileModal.value = false
}

// 打开新建文件夹弹窗
const handleNewFolder = (parentPath: string = '/') => {
  showNewFolderModal.value = true
  currentFolderParentPath.value = parentPath
}

// 确认新建文件夹
const handleConfirmNewFolder = (formData: NewFolderForm) => {
  addFolderToTree(formData.folderName, currentFolderParentPath.value)
  message.success('文件夹创建成功')
  showNewFolderModal.value = false
}

// 滚动到顶部
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      pageContent.scrollTop = 0
    }
    
    const layoutContent = document.querySelector('.ant-layout-content')
    if (layoutContent) {
      layoutContent.scrollTop = 0
    }
    
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
    currentStep.value = 2
    scrollToTop()
  } else if (currentStep.value === 2) {
    currentStep.value = 3
    scrollToTop()
  }
}

// 保存项目
const handleSave = async () => {
  try {
    // 验证实验环境表单
    await experimentFormRef.value?.validate()
    
    // 收集所有数据
    const projectData = {
      basicInfo: formData.value,
      repository: {
        enabled: formData.value.enableCodeRepository,
        type: formData.value.repositoryType,
        url: formData.value.repositoryUrl,
        fileTree: fileTreeData.value,
      },
      taskLevels: taskLevels.value,
      experimentEnvironments: experimentEnvironments.value,
    }
    
    console.log('保存项目数据：', projectData)
    
    // 这里可以调用后端API保存数据
    // await saveProject(projectData)
    
    message.success('项目创建成功！')
    
    // 延迟返回列表页，让用户看到成功提示
    setTimeout(() => {
      router.push('/dashboard/analysis')
    }, 500)
  } catch (error) {
    console.error('保存失败：', error)
    message.error('请完善必填信息')
  }
}

// 新增题目
const handleAddQuestion = () => {
  currentEditingQuestion.value = null
  showQuestionModal.value = true
}

// 编辑题目
const handleEditQuestion = (question: any) => {
  currentEditingQuestion.value = question
  showQuestionModal.value = true
}

// 确认添加/编辑题目
const handleConfirmQuestion = (question: any) => {
  if (currentEditingQuestion.value) {
    // 编辑模式：更新题目
    updateQuestion(question)
  } else {
    // 新增模式：添加题目
    addQuestion(question)
  }
  currentEditingQuestion.value = null
}

// 拖拽相关
const draggedIndex = ref<number | null>(null)

const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== dropIndex) {
    const questions = [...getCurrentQuestions.value]
    const [draggedItem] = questions.splice(draggedIndex.value, 1)
    questions.splice(dropIndex, 0, draggedItem)
    
    // 更新题目顺序
    updateQuestionsOrder(questions)
    message.success('题目顺序已更新')
  }
  draggedIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
}

// 实验界面切换
const toggleInterface = (type: string) => {
  const config = currentEnvironmentConfig.value
  if (!config) return
  
  const index = config.experimentInterfaces.indexOf(type)
  if (index > -1) {
    config.experimentInterfaces.splice(index, 1)
    // 清除对应的条件字段
    if (type === 'editor') {
      config.programmingLanguage = undefined
    } else if (type === 'terminal') {
      config.startupCommand = undefined
    } else if (type === 'service') {
      config.containerPort = undefined
      config.route = undefined
    }
  } else {
    config.experimentInterfaces.push(type)
  }
}

// 添加实验环境
const handleAddEnvironment = () => {
  const newId = String(Date.now())
  const newEnv: ExperimentEnvironment = {
    id: newId,
    name: `实验环境${experimentEnvironments.value.length + 1}`,
    isEditing: false,
    config: {
      experimentImage: 'Python3.6',
      experimentInterfaces: [],
      attachedEnvironment: undefined,
      applicationCard: undefined,
      programmingLanguage: undefined,
      startupCommand: undefined,
      containerPort: undefined,
      route: undefined,
    }
  }
  experimentEnvironments.value.push(newEnv)
  activeEnvironmentKey.value = newId
  message.success('添加实验环境成功')
}

// 删除实验环境
const handleDeleteEnvironment = (id: string) => {
  if (experimentEnvironments.value.length === 1) {
    message.warning('至少保留一个实验环境')
    return
  }
  const index = experimentEnvironments.value.findIndex(e => e.id === id)
  if (index > -1) {
    experimentEnvironments.value.splice(index, 1)
    // 如果删除的是当前激活的，切换到第一个
    if (activeEnvironmentKey.value === id) {
      activeEnvironmentKey.value = experimentEnvironments.value[0].id
    }
    message.success('删除实验环境成功')
  }
}

// 开始编辑环境名称
const handleEditEnvironmentName = (env: ExperimentEnvironment) => {
  env.isEditing = true
  editingEnvironmentName.value = env.name
}

// 保存环境名称
const handleSaveEnvironmentName = (env: ExperimentEnvironment) => {
  if (editingEnvironmentName.value.trim()) {
    env.name = editingEnvironmentName.value.trim()
    env.isEditing = false
    message.success('重命名成功')
  } else {
    message.warning('名称不能为空')
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
        <a-steps :current="currentStep" class="custom-steps">
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
              <RichTextEditor v-model="formData.description" />
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
              <FileTreeComponent 
                v-if="formData.enableCodeRepository"
                :file-tree-data="fileTreeData"
                v-model:expanded-keys="expandedKeys"
                @select="handleSelectFile"
                @menu-click="handleTreeNodeMenuClick"
              />

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
              <FilePreview 
                v-if="formData.enableCodeRepository"
                :selected-file="selectedFile"
                :highlighted-code="highlightedCode"
              />
              <div v-else class="empty-area">
                在左侧代码仓库区域点击目录打开文件
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三步：任务关卡 -->
      <div v-if="currentStep === 2">
        <div class="task-level-section">
          <!-- 顶部按钮组 -->
          <div class="task-level-header">
            <div class="header-buttons">
              <a-button type="primary" @click="addTaskLevel('kernel')">添加内核链接任务</a-button>
              <a-button type="primary" @click="addTaskLevel('choice')">添加选择题任务</a-button>
              <a-button type="primary" @click="addTaskLevel('programming')">添加编程任务</a-button>
            </div>
          </div>

          <!-- 主要内容区域 -->
          <div class="task-level-main">
            <!-- 左侧：任务关卡列表 -->
            <div class="task-level-list">
              <div class="list-title">任务关卡 ({{ taskLevels.length }})</div>
              <div class="list-items">
                <div 
                  v-for="level in taskLevels" 
                  :key="level.id"
                  :class="['list-item', { active: selectedTaskLevelId === level.id }]"
                  @click="selectTaskLevel(level.id)"
                >
                  <span class="item-name">{{ level.name }}</span>
                  <DeleteOutlined class="delete-icon" @click.stop="deleteTaskLevel(level.id)" />
                </div>
              </div>
            </div>

            <!-- 右侧：任务详情 -->
            <div class="task-level-detail">
              <div v-if="selectedTaskLevelId" class="detail-content">
                <a-tabs v-model:activeKey="currentTab">
                  <!-- 标签栏右侧额外内容 -->
                  <template #tabBarExtraContent v-if="isChoiceTask && currentTab === 'questions'">
                    <a-button type="primary" @click="handleAddQuestion">
                      <PlusOutlined />
                      新增题目
                    </a-button>
                  </template>
                  
                  <!-- 关联任务标签页 -->
                  <a-tab-pane key="task" tab="关联任务">
                    <a-form 
                      ref="taskLevelFormRef"
                      :model="taskLevelFormData" 
                      :rules="taskLevelFormRules"
                      layout="horizontal"
                      :label-col="{ span: 4 }"
                      :wrapper-col="{ span: 18 }"
                    >
                      <a-form-item label="任务名称" name="taskName" required>
                        <a-input v-model:value="taskLevelFormData.taskName" placeholder="请输入任务名称" />
                      </a-form-item>

                      <a-form-item label="学习资源" name="learningResources" required>
                        <a-upload
                          v-model:file-list="taskLevelFormData.learningResources"
                          :before-upload="() => false"
                          @change="handleLearningResourceUpload"
                          accept=".doc,.docx,.pdf,.ppt,.pptx,.mp4"
                          :max-count="10"
                        >
                          <a-button type="primary">点击上传</a-button>
                        </a-upload>
                        <div class="upload-hint">
                          说明：支持上传word、pdf、ppt、mp4等格式文件，每个文件大小不能超过500M。
                        </div>
                      </a-form-item>

                      <a-form-item label="任务要求" name="taskRequirement" required>
                        <RichTextEditor 
                          v-model="taskLevelFormData.taskRequirement" 
                          placeholder="请输入任务要求"
                        />
                      </a-form-item>

                      <a-form-item label="参考答案" name="referenceAnswer" required>
                        <RichTextEditor 
                          v-model="taskLevelFormData.referenceAnswer" 
                          placeholder="请输入参考答案"
                        />
                      </a-form-item>

                      <a-form-item label="难度系数" name="difficulty" required>
                        <a-radio-group v-model:value="taskLevelFormData.difficulty" class="custom-radio">
                          <a-radio value="困难">困难</a-radio>
                          <a-radio value="适中">适中</a-radio>
                          <a-radio value="简单">简单</a-radio>
                        </a-radio-group>
                      </a-form-item>

                      <a-form-item label="技能标签" name="skillTag" required>
                        <a-input v-model:value="taskLevelFormData.skillTag" placeholder="请输入技能标签" />
                      </a-form-item>
                      <a-form-item v-if="isKernelTask" label="内嵌链接" name="kernelLink" required>
                        <a-input v-model:value="taskLevelFormData.kernelLink" placeholder="请输入内嵌链接" />
                      </a-form-item>

                      <a-form-item label="任务学时" name="taskHours" required>
                        <a-input v-model:value="taskLevelFormData.taskHours" placeholder="请输入任务学时" />
                      </a-form-item>

                      
                    </a-form>
                  </a-tab-pane>

                  <!-- 题目标签页（选择题任务） -->
                  <a-tab-pane key="questions" tab="题目" v-if="isChoiceTask">
                    <div v-if="getCurrentQuestions.length === 0" class="questions-content">
                      <a-empty description="暂无题目，请点击右上方按钮新增题目" />
                    </div>
                    <div v-else class="questions-list">
                      <div 
                        v-for="(question, index) in getCurrentQuestions" 
                        :key="question.id"
                        class="question-item"
                        draggable="true"
                        :class="{ 'dragging': draggedIndex === index }"
                        @dragstart="handleDragStart(index)"
                        @dragover="handleDragOver"
                        @drop="handleDrop($event, index)"
                        @dragend="handleDragEnd"
                      >
                        <div class="question-header">
                          <div class="question-number-with-drag">
                            <HolderOutlined class="drag-handle" />
                            <span class="question-number">题目{{ index + 1 }}</span>
                          </div>
                          <div class="action-icons">
                            <EditOutlined class="edit-icon" @click="handleEditQuestion(question)" />
                            <DeleteOutlined class="delete-icon" @click="deleteQuestion(question.id)" />
                          </div>
                        </div>
                        <div class="question-title">
                          <div v-if="question.title" class="flex">
                            {{ index + 1 }}、
                          <div  v-html="question.title"></div>
                          </div>
                          <div v-else style="color: #bfbfbf;">暂无题干</div>
                        </div>
                        <div class="question-options">
                          <div 
                            v-for="option in question.options" 
                            :key="option.id"
                            class="option-row"
                            :class="{ 'is-correct': option.isCorrect }"
                          >
                            <span class="option-label">{{ option.label }}.</span>
                            <span class="option-content">{{ option.content }}</span>
                            <span v-if="option.isCorrect" class="correct-tag">正确答案</span>
                          </div>
                        </div>
                        <div class="question-explanation">
                          <div class="explanation-label">答案解析：</div>
                          <div class="explanation-content">
                            <span v-if="question.explanation">{{ question.explanation }}</span>
                            <span v-else style="color: #bfbfbf;">暂无答案解析</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a-tab-pane>

                  <!-- 评测设置标签页（编程任务） -->
                  <a-tab-pane key="evaluation" tab="评测设置" v-if="isProgrammingTask">
                    <div class="evaluation-content">
                      <!-- 评测文件 -->
                      <div class="evaluation-section">
                        <div class="section-header">评测文件</div>
                        <a-form 
                          ref="evaluationFormRef"
                          :model="evaluationFormData"
                          :rules="evaluationFormRules"
                          layout="horizontal" 
                          :label-col="{ span: 4 }" 
                          :wrapper-col="{ span: 18 }"
                        >
                          <a-form-item label="评测时长限制" name="timeLimit" required>
                            <a-input v-model:value="evaluationFormData.timeLimit" placeholder="请输入任务名称" />
                          </a-form-item>

                          <a-form-item label="学员任务文件" name="studentTaskFile" required>
                            <a-upload
                              v-model:file-list="evaluationFormData.studentTaskFile"
                              :before-upload="() => false"
                              @change="handleStudentTaskFileUpload"
                              accept=".js,.ts,.py,.java,.cpp,.c"
                            >
                              <a-button type="primary">点击选择代码文件</a-button>
                            </a-upload>
                            <div class="upload-hint">
                              （学员评测基本任务时名称，查看效果页上需要编辑的文件类型）
                            </div>
                          </a-form-item>

                          <a-form-item label="评测执行文件" name="evaluationFile" required>
                            <a-upload
                              v-model:file-list="evaluationFormData.evaluationFile"
                              :before-upload="() => false"
                              @change="handleEvaluationFileUpload"
                              accept=".js,.ts,.py,.java,.cpp,.c"
                            >
                              <a-button type="primary">点击选择代码文件</a-button>
                            </a-upload>
                            <div class="upload-hint">
                              （点击评测按钮时调用的文件，用于检验学员任务结果是否正确，可与"学员任务文件"一致）
                            </div>
                          </a-form-item>
                        </a-form>
                      </div>

                      <!-- 评测规则 -->
                      <div class="evaluation-section">
                        <div class="section-header">评测规则</div>
                        <a-form layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                          <a-form-item label="通关判定">
                            <a-radio-group v-model:value="evaluationFormData.passJudgment" class="custom-radio">
                              <a-radio value="output_compare">实际输出与期望输出对比</a-radio>
                              <a-radio value="rule_match">实际输出满足规则</a-radio>
                            </a-radio-group>
                          </a-form-item>

                          <a-form-item label="空格处理">
                            <a-radio-group v-model:value="evaluationFormData.spaceHandling" class="custom-radio">
                              <a-radio value="no_ignore">不忽略空格</a-radio>
                              <a-radio value="ignore_edge">忽略首尾空格</a-radio>
                              <a-radio value="ignore_all">忽略所有空格(仅通过空格中自动添加所有空格进行对比)</a-radio>
                            </a-radio-group>
                          </a-form-item>
                        </a-form>
                      </div>

                      <!-- 测试集 -->
                      <div class="evaluation-section">
                        <div class="section-header">测试集</div>
                        <a-form layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                          <a-form-item label="得分规则">
                            <a-radio-group v-model:value="evaluationFormData.scoreRule" class="custom-radio">
                              <a-radio value="all_pass">通过全部测试集（所有测试集都正确，才获取对应积分；否则得0分学分）</a-radio>
                              <a-radio value="partial_pass">通过部分测试集（选中的测试数全部正确，获取任务学分；获取在0学分）</a-radio>
                            </a-radio-group>
                          </a-form-item>

                          <a-form-item label="用例类型">
                            <div class="case-type-row">
                              <a-radio-group v-model:value="evaluationFormData.caseType" class="custom-radio">
                                <a-radio value="text">文本</a-radio>
                                <a-radio value="file">文件</a-radio>
                              </a-radio-group>
                              <div class="test-case-buttons">
                                <a-button type="primary" @click="addTestCase">新增测试集</a-button>
                                <a-button @click="clearAllTestCases">一键删除测试用例</a-button>
                                <a-button @click="downloadTemplate">下载测试用例模板</a-button>
                                <a-button @click="batchUploadTestCases">批量上传测试用例</a-button>
                              </div>
                            </div>
                          </a-form-item>

                          <!-- 测试集列表 -->
                          <div v-if="evaluationFormData.testCases.length > 0" class="test-cases-list">
                            <div 
                              v-for="(testCase, index) in evaluationFormData.testCases" 
                              :key="testCase.id"
                              class="test-case-item"
                            >
                              <a-checkbox class="test-case-checkbox" />
                              <span class="test-case-label">测试集{{ index + 1 }}</span>
                              <a-input 
                                v-model:value="testCase.input" 
                                placeholder="请输入输入内容" 
                                class="test-case-input"
                              />
                              <a-input 
                                v-model:value="testCase.output" 
                                placeholder="请输入期望输出" 
                                class="test-case-output"
                              />
                              <DeleteOutlined 
                                class="delete-test-case" 
                                @click="removeTestCase(testCase.id)" 
                              />
                            </div>
                          </div>
                        </a-form>
                      </div>
                    </div>
                  </a-tab-pane>
                </a-tabs>
                
                <!-- 底部按钮 -->
                <div class="form-footer-buttons">
                  <a-button @click="resetTaskLevel">重置</a-button>
                  <a-button type="primary" @click="saveTaskLevel">保存</a-button>
                </div>
              </div>
              <div v-else class="empty-detail">
                <a-empty description="请先添加任务关卡" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 第四步：实验环境 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="content-card">
          <div class="environment-header">
            <h3 class="environment-title">实验环境</h3>
            <div class="environment-actions">
              <a-button type="primary" @click="handleAddEnvironment">添加实验环境</a-button>
              <a-button>设置</a-button>
            </div>
          </div>
          <a-form
            ref="experimentFormRef"
            :model="currentEnvironmentConfig"
            :rules="experimentFormRules"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-tabs v-model:activeKey="activeEnvironmentKey">
              <a-tab-pane 
                v-for="env in experimentEnvironments" 
                :key="env.id"
              >
                <template #tab>
                  <div class="tab-label">
                    <template v-if="env.isEditing">
                      <a-input 
                        v-model:value="editingEnvironmentName"
                        size="small"
                        style="width: 120px;"
                        @pressEnter="handleSaveEnvironmentName(env)"
                        @blur="handleSaveEnvironmentName(env)"
                      />
                    </template>
                    <template v-else>
                      <span @dblclick="handleEditEnvironmentName(env)">{{ env.name }}</span>
                      <a-dropdown :trigger="['click']">
                        <MoreOutlined class="tab-more-icon" @click.stop />
                        <template #overlay>
                          <a-menu>
                            <a-menu-item @click="handleEditEnvironmentName(env)">
                              <EditOutlined /> 重命名
                            </a-menu-item>
                            <a-menu-item @click="handleDeleteEnvironment(env.id)">
                              <DeleteOutlined /> 删除
                            </a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </template>
                  </div>
                </template>
                <a-form-item label="实验镜像" name="experimentImage" required>
                  <div class="experiment-image-info">
                    系统实验镜像默认认为Python3.6。
                  </div>
                </a-form-item>

                <a-form-item label="实验界面" name="experimentInterfaces" required>
                  <div class="experiment-interfaces">
                    <div 
                      class="interface-card"
                      :class="{ active: env.config.experimentInterfaces.includes('editor') }"
                      @click="toggleInterface('editor')"
                    >
                      <div class="card-title">代码编辑器</div>
                      <div class="card-desc">提供代码编辑器，编辑器，调试器等工具</div>
                    </div>
                    <div 
                      class="interface-card"
                      :class="{ active: env.config.experimentInterfaces.includes('terminal') }"
                      @click="toggleInterface('terminal')"
                    >
                      <div class="card-title">命令行终端</div>
                      <div class="card-desc">提供命令行窗口</div>
                    </div>
                    <div 
                      class="interface-card"
                      :class="{ active: env.config.experimentInterfaces.includes('service') }"
                      @click="toggleInterface('service')"
                    >
                      <div class="card-title">容器内服务</div>
                      <div class="card-desc">直接预览容器内部Web服务</div>
                    </div>
                  </div>
                </a-form-item>

                <a-form-item label="附带环境">
                  <a-select 
                    v-model:value="env.config.attachedEnvironment"
                    placeholder="请选择附带环境"
                    allowClear
                  >
                    <a-select-option value="env1">环境1</a-select-option>
                    <a-select-option value="env2">环境2</a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item label="应用关卡">
                  <a-select 
                    v-model:value="env.config.applicationCard"
                    placeholder="请选择应用关卡"
                    allowClear
                  >
                    <a-select-option value="level1">关卡1</a-select-option>
                    <a-select-option value="level2">关卡2</a-select-option>
                  </a-select>
                </a-form-item>

                <!-- 选择代码编辑器时显示编程语言 -->
                <a-form-item 
                  v-if="env.config.experimentInterfaces.includes('editor')"
                  label="编程语言"
                >
                  <a-select 
                    v-model:value="env.config.programmingLanguage"
                    placeholder="请选择附带语言"
                    allowClear
                  >
                    <a-select-option value="python">Python</a-select-option>
                    <a-select-option value="javascript">JavaScript</a-select-option>
                    <a-select-option value="java">Java</a-select-option>
                    <a-select-option value="cpp">C++</a-select-option>
                  </a-select>
                </a-form-item>

                <!-- 选择命令行终端时显示开启时触发命令 -->
                <a-form-item 
                  v-if="env.config.experimentInterfaces.includes('terminal')"
                  label="开启时触发命令"
                >
                  <a-input 
                    v-model:value="env.config.startupCommand"
                    placeholder="请输入命令"
                  />
                </a-form-item>

                <!-- 选择容器内服务时显示容器端口和路由 -->
                <a-form-item 
                  v-if="env.config.experimentInterfaces.includes('service')"
                  label="容器端口" 
                  name="containerPort" 
                  required
                >
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-input 
                        v-model:value="env.config.containerPort"
                        placeholder="请输入容器端口"
                      />
                    </a-col>
                    <a-col :span="12">
                      <a-input 
                        v-model:value="env.config.route"
                        placeholder="请输入路由"
                        addon-before="路由（选填）"
                      />
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-tab-pane>
            </a-tabs>
          </a-form>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="page-footer">
        <a-button v-if="currentStep === 0" @click="handleBack">返回</a-button>
        <a-button v-else @click="handleBack">上一步</a-button>
        <a-button v-if="currentStep === 3" type="primary" @click="handleSave">保存</a-button>
        <a-button v-else type="primary" @click="handleNext">下一步</a-button>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <RepositoryModal 
      v-model:open="showRepositoryModal"
      @confirm="handleConfirmRepository"
      @cancel="handleCancelRepository"
    />
    <!-- 新建文件弹窗 -->
    <NewFileModal 
      v-model:open="showNewFileModal"
      :parent-path="currentParentPath"
      @confirm="handleConfirmNewFile"
    />

    <!-- 新建文件夹弹窗 -->
    <NewFolderModal 
      v-model:open="showNewFolderModal"
      :parent-path="currentFolderParentPath"
      @confirm="handleConfirmNewFolder"
    />
    
    <!-- 添加题目弹窗 -->
    <QuestionModal 
      v-model:open="showQuestionModal"
      :question="currentEditingQuestion"
      @confirm="handleConfirmQuestion"
    />
  </div>
</template>

<style scoped lang="less">
.config-full-stack-page {
  background: #f0f2f5;

  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin: 0 0 16px 0;
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
    // max-width: 1400px;
    // margin: 0 auto;
    background: #fff;
    padding: 24px;
    border-radius: 4px;

    .steps-container {
      margin-bottom: 32px;
      padding: 0 100px;
      .custom-steps {
        max-width: 800px;
        margin: 0 auto;
      }
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
      }

      // 代码仓库样式
      &.repository-section {
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

        .repository-main-area {
          display: flex;
          gap: 16px;
          min-height: 400px;
          max-height: calc(100vh - 320px);

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
          }

          .repository-right {
            flex: 1;
            display: flex;
            flex-direction: column;

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

    // 任务关卡样式
    .task-level-section {
      .task-level-header {
        margin-bottom: 24px;
        
        .header-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      }

      .task-level-main {
        display: flex;
        gap: 24px;
        min-height: 500px;

        .task-level-list {
          width: 280px;
          background: #fafafa;
          border: 1px solid #e8e8e8;
          border-radius: 4px;

          .list-title {
            padding: 12px 16px;
            background: #f0f0f0;
            border-bottom: 1px solid #e8e8e8;
            font-weight: 500;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.85);
          }

          .list-items {
            padding: 8px 0;

            .list-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 16px;
              margin: 4px 8px;
              cursor: pointer;
              border-radius: 4px;
              transition: all 0.3s;

              &:hover {
                background: #e6f7ff;

                .delete-icon {
                  opacity: 1;
                }
              }

              &.active {
                background: #1890ff;
                color: #fff;

                .delete-icon {
                  color: #fff;
                  opacity: 1;
                }
              }

              .item-name {
                flex: 1;
                font-size: 14px;
              }

              .delete-icon {
                color: #ff4d4f;
                font-size: 16px;
                opacity: 0;
                transition: opacity 0.3s;

                &:hover {
                  color: #ff7875;
                }
              }
            }
          }
        }

        .task-level-detail {
          flex: 1;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          padding: 24px;

          .detail-content {
            .ant-tabs {
              :deep(.ant-tabs-nav) {
                margin-bottom: 24px;
              }
            }

            .upload-hint {
              margin-top: 8px;
              color: rgba(0, 0, 0, 0.45);
              font-size: 12px;
            }

            .form-footer-buttons {
              display: flex;
              justify-content: center;
              gap: 16px;
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #f0f0f0;

              .ant-btn {
                min-width: 100px;
              }
            }
          }

          .empty-detail {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }

          .empty-evaluation {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
          }

          .questions-content {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
          }

          .questions-list {
            .question-item {
              background: #fafafa;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              padding: 16px;
              margin-bottom: 16px;
              cursor: move;
              transition: all 0.3s;
              user-select: none;

              &:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
              }

              &.dragging {
                opacity: 0.5;
                background: #e6f7ff;
                border-color: #1890ff;
              }

              .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;

                .question-number-with-drag {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .drag-handle {
                    color: rgba(0, 0, 0, 0.25);
                    font-size: 16px;
                    cursor: move;
                    transition: color 0.3s;

                    &:hover {
                      color: rgba(0, 0, 0, 0.45);
                    }
                  }

                  .question-number {
                    font-weight: 500;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.85);
                  }
                }

                .action-icons {
                  display: flex;
                  gap: 12px;
                  align-items: center;

                  .edit-icon {
                    color: #1890ff;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s;

                    &:hover {
                      color: #40a9ff;
                    }
                  }

                  .delete-icon {
                    color: #ff4d4f;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s;

                    &:hover {
                      color: #ff7875;
                    }
                  }
                }
              }

              .question-title {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.85);
                margin-bottom: 16px;
                line-height: 1.6;
                min-height: 20px;
                word-break: break-word;
                
                :deep(p) {
                  margin: 0 !important;
                  padding: 0 !important;
                  line-height: 1.6;
                  display: block;
                }
                
                :deep(br) {
                  display: none;
                }
                
                :deep(*) {
                  max-width: 100%;
                }
              }

              .question-options {
                margin-bottom: 16px;

                .option-row {
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin-bottom: 8px;
                  background: #fff;
                  border: 1px solid #e8e8e8;
                  border-radius: 4px;
                  transition: all 0.3s;

                  &.is-correct {
                    background: #f6ffed;
                    border-color: #52c41a;
                  }

                  .option-label {
                    font-weight: 500;
                    margin-right: 12px;
                    color: rgba(0, 0, 0, 0.85);
                    flex-shrink: 0;
                  }

                  .option-content {
                    flex: 1;
                    color: rgba(0, 0, 0, 0.65);
                  }

                  .correct-tag {
                    flex-shrink: 0;
                    background: #52c41a;
                    color: #fff;
                    padding: 2px 8px;
                    border-radius: 2px;
                    font-size: 12px;
                    margin-left: 12px;
                  }
                }
              }

              .question-explanation {
                background: #fff7e6;
                border: 1px solid #ffd591;
                border-radius: 4px;
                padding: 12px;

                .explanation-label {
                  font-weight: 500;
                  color: rgba(0, 0, 0, 0.85);
                  margin-bottom: 8px;
                  font-size: 14px;
                }

                .explanation-content {
                  color: rgba(0, 0, 0, 0.65);
                  line-height: 1.6;
                  font-size: 14px;
                }
              }
            }
          }

          .evaluation-content {
            .evaluation-section {
              margin-bottom: 32px;

              .section-header {
                background: #5b8fff;
                color: #fff;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 24px;
                border-radius: 4px;
              }

              .upload-hint {
                margin-top: 8px;
                color: rgba(0, 0, 0, 0.45);
                font-size: 12px;
              }

              .case-type-row {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .test-case-buttons {
                  display: flex;
                  gap: 12px;
                }
              }

              .test-cases-list {
                margin-top: 24px;
                margin-left: calc(10.8% + 12px);

                .test-case-item {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin-bottom: 16px;

                  .test-case-checkbox {
                    flex-shrink: 0;
                  }

                  .test-case-label {
                    flex-shrink: 0;
                    width: 80px;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.85);
                  }

                  .test-case-input,
                  .test-case-output {
                    flex: 1;
                  }

                  .delete-test-case {
                    flex-shrink: 0;
                    color: #ff4d4f;
                    cursor: pointer;
                    font-size: 16px;

                    &:hover {
                      color: #ff7875;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/* 自定义镂空样式 */
.custom-radio ::v-deep(.ant-radio-wrapper) {
  margin-right: 30px;
}

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

/* 实验环境样式 */
.environment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;

  .environment-title {
    font-size: 18px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin: 0;
  }

  .environment-actions {
    display: flex;
    gap: 8px;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;

  .tab-more-icon {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    cursor: pointer;
    padding: 2px;
    transition: color 0.3s;

    &:hover {
      color: rgba(0, 0, 0, 0.85);
    }
  }
}

.experiment-image-info {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.experiment-interfaces {
  display: flex;
  gap: 16px;

  .interface-card {
    flex: 1;
    background: #e8e8e8;
    color: rgba(0, 0, 0, 0.65);
    border-radius: 4px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
      background: #5b8fff;
      color: #fff;
      border-color: #fff;
      box-shadow: 0 0 0 2px #5b8fff;

      &:hover {
        box-shadow: 0 4px 12px rgba(91, 143, 255, 0.3), 0 0 0 2px #5b8fff;
      }
    }

    .card-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .card-desc {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }
  }
}
</style>
