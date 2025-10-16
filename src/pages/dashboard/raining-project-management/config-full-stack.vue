<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
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

// Composables
import { useFileTree } from './composables/useFileTree'

// Types
import type { FormData, NewFileForm, NewFolderForm, TaskLevel, TaskLevelForm, EvaluationForm } from './types'

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

// 弹窗状态
const showRepositoryModal = ref(false)
const showNewFileModal = ref(false)
const showNewFolderModal = ref(false)
const currentParentPath = ref('/')
const currentFolderParentPath = ref('/')

// 任务关卡相关状态
const taskLevels = ref<TaskLevel[]>([])
const selectedTaskLevelId = ref<string>('')
const currentTab = ref('task')
const taskLevelFormRef = ref<FormInstance>()
const evaluationFormRef = ref<FormInstance>()

// 任务关卡表单数据
const taskLevelFormData = ref<TaskLevelForm>({
  taskName: '',
  learningResources: [],
  taskRequirement: '',
  referenceAnswer: '',
  difficulty: '适中',
  skillTag: '',
  taskHours: '',
})

// 评测设置表单数据
const evaluationFormData = ref<EvaluationForm>({
  timeLimit: '',
  studentTaskFile: [],
  evaluationFile: [],
  passJudgment: 'output_compare',
  spaceHandling: 'no_ignore',
  scoreRule: 'all_pass',
  caseType: 'text',
  testCases: [],
})

// 任务关卡表单验证规则
const taskLevelFormRules: Record<string, Rule[]> = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
  ],
  learningResources: [
    { required: true, message: '请上传学习资源', trigger: 'change', type: 'array', min: 1 },
  ],
  taskRequirement: [
    { required: true, message: '请输入任务要求', trigger: 'blur' },
  ],
  referenceAnswer: [
    { required: true, message: '请输入参考答案', trigger: 'blur' },
  ],
  difficulty: [
    { required: true, message: '请选择难度系数', trigger: 'change' },
  ],
  skillTag: [
    { required: true, message: '请输入技能标签', trigger: 'blur' },
  ],
  taskHours: [
    { required: true, message: '请输入任务学时', trigger: 'blur' },
  ],
}

// 评测设置表单验证规则
const evaluationFormRules: Record<string, Rule[]> = {
  timeLimit: [
    { required: true, message: '请输入评测时长限制', trigger: 'blur' },
  ],
  studentTaskFile: [
    { required: true, message: '请上传学员任务文件', trigger: 'change', type: 'array', min: 1 },
  ],
  evaluationFile: [
    { required: true, message: '请上传评测执行文件', trigger: 'change', type: 'array', min: 1 },
  ],
}

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

// 添加任务关卡
const addTaskLevel = (type: 'programming' | 'choice' | 'kernel') => {
  const typeNames = {
    programming: '编程实训任务关卡',
    choice: '选择题实训任务关卡',
    kernel: '内核链接实训任务关卡',
  }
  
  const newLevel: TaskLevel = {
    id: Date.now().toString(),
    name: `第${taskLevels.value.length + 1}关：${typeNames[type]}`,
    type,
    taskName: '',
    learningResources: [],
    taskRequirement: '',
    referenceAnswer: '',
    difficulty: '适中',
    skillTag: '',
    taskHours: '',
  }
  
  taskLevels.value.push(newLevel)
  selectedTaskLevelId.value = newLevel.id
  loadTaskLevelFormData(newLevel.id)
  message.success('任务关卡添加成功')
}

// 删除任务关卡
const deleteTaskLevel = (id: string) => {
  const index = taskLevels.value.findIndex(level => level.id === id)
  if (index !== -1) {
    taskLevels.value.splice(index, 1)
    if (selectedTaskLevelId.value === id) {
      selectedTaskLevelId.value = taskLevels.value[0]?.id || ''
      if (selectedTaskLevelId.value) {
        loadTaskLevelFormData(selectedTaskLevelId.value)
      }
    }
    message.success('任务关卡删除成功')
  }
}

// 选择任务关卡
const selectTaskLevel = (id: string) => {
  if (selectedTaskLevelId.value && selectedTaskLevelId.value !== id) {
    saveTaskLevelFormData(selectedTaskLevelId.value)
  }
  selectedTaskLevelId.value = id
  loadTaskLevelFormData(id)
}

// 加载任务关卡表单数据
const loadTaskLevelFormData = (id: string) => {
  const level = taskLevels.value.find(l => l.id === id)
  if (level) {
    taskLevelFormData.value = {
      taskName: level.taskName,
      learningResources: level.learningResources,
      taskRequirement: level.taskRequirement,
      referenceAnswer: level.referenceAnswer,
      difficulty: level.difficulty,
      skillTag: level.skillTag,
      taskHours: level.taskHours,
    }
    
    // 加载评测设置数据
    if (level.evaluationSettings) {
      evaluationFormData.value = { ...level.evaluationSettings }
    } else {
      // 重置为默认值
      evaluationFormData.value = {
        timeLimit: '',
        studentTaskFile: [],
        evaluationFile: [],
        passJudgment: 'output_compare',
        spaceHandling: 'no_ignore',
        scoreRule: 'all_pass',
        caseType: 'text',
        testCases: [],
      }
    }
  }
}

// 保存任务关卡表单数据
const saveTaskLevelFormData = (id: string) => {
  const level = taskLevels.value.find(l => l.id === id)
  if (level) {
    Object.assign(level, taskLevelFormData.value)
    // 保存评测设置数据
    level.evaluationSettings = { ...evaluationFormData.value }
  }
}

// 学习资源文件上传处理
const handleLearningResourceUpload = (info: any) => {
  const { file, fileList } = info
  
  if (file.status === 'done') {
    message.success(`${file.name} 文件上传成功`)
  } else if (file.status === 'error') {
    message.error(`${file.name} 文件上传失败`)
  }
  
  taskLevelFormData.value.learningResources = fileList.map((f: any) => ({
    uid: f.uid,
    name: f.name,
    status: f.status,
    url: f.response?.url || f.url,
  }))
  
  // 触发表单验证
  taskLevelFormRef.value?.validateFields(['learningResources'])
}

// 保存任务关卡
const saveTaskLevel = async () => {
  try {
    // 同时验证关联任务表单和评测设置表单
    await Promise.all([
      taskLevelFormRef.value?.validate(),
      evaluationFormRef.value?.validate()
    ])
    if (selectedTaskLevelId.value) {
      saveTaskLevelFormData(selectedTaskLevelId.value)
    }
    message.success('保存成功')
  } catch (error) {
    message.error('请完善必填信息')
  }
}

// 重置任务关卡表单
const resetTaskLevel = () => {
  if (selectedTaskLevelId.value) {
    loadTaskLevelFormData(selectedTaskLevelId.value)
  }
  // 清除所有表单校验
  taskLevelFormRef.value?.clearValidate()
  evaluationFormRef.value?.clearValidate()
  message.info('已重置')
}

// 学员任务文件上传处理
const handleStudentTaskFileUpload = (info: any) => {
  const { fileList } = info
  evaluationFormData.value.studentTaskFile = fileList.map((f: any) => ({
    uid: f.uid,
    name: f.name,
    status: f.status,
    url: f.response?.url || f.url,
  }))
  
  // 触发表单验证
  evaluationFormRef.value?.validateFields(['studentTaskFile'])
}

// 评测执行文件上传处理
const handleEvaluationFileUpload = (info: any) => {
  const { fileList } = info
  evaluationFormData.value.evaluationFile = fileList.map((f: any) => ({
    uid: f.uid,
    name: f.name,
    status: f.status,
    url: f.response?.url || f.url,
  }))
  
  // 触发表单验证
  evaluationFormRef.value?.validateFields(['evaluationFile'])
}

// 新增测试集
const addTestCase = () => {
  evaluationFormData.value.testCases.push({
    id: Date.now().toString(),
    input: '',
    output: '',
  })
}

// 删除测试集
const removeTestCase = (id: string) => {
  const index = evaluationFormData.value.testCases.findIndex(tc => tc.id === id)
  if (index !== -1) {
    evaluationFormData.value.testCases.splice(index, 1)
    message.success('删除成功')
  }
}

// 一键删除测试用例
const clearAllTestCases = () => {
  evaluationFormData.value.testCases = []
  message.success('已清空所有测试用例')
}

// 下载测试用例模板
const downloadTemplate = () => {
  message.info('下载功能开发中...')
}

// 批量上传测试用例
const batchUploadTestCases = () => {
  message.info('批量上传功能开发中...')
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
                        <RichTextEditor v-model="taskLevelFormData.taskRequirement" placeholder="请输入任务要求" />
                      </a-form-item>

                      <a-form-item label="参考答案" name="referenceAnswer" required>
                        <RichTextEditor v-model="taskLevelFormData.referenceAnswer" placeholder="请输入参考答案" />
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

                      <a-form-item label="任务学时" name="taskHours" required>
                        <a-input v-model:value="taskLevelFormData.taskHours" placeholder="请输入任务学时" />
                      </a-form-item>
                    </a-form>
                  </a-tab-pane>

                  <!-- 评测设置标签页 -->
                  <a-tab-pane key="evaluation" tab="评测设置">
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

      <!-- 底部按钮 -->
      <div class="page-footer">
        <a-button v-if="currentStep === 0" @click="handleBack">返回</a-button>
        <a-button v-else @click="handleBack">上一步</a-button>
        <a-button type="primary" @click="handleNext">下一步</a-button>
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
  </div>
</template>

<style scoped lang="less">
.config-full-stack-page {
  background: #f0f2f5;

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
</style>
