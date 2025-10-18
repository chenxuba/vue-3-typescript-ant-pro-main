<script setup lang="ts">
import { ref, nextTick, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
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
  name: 'ConfigJupyterLab',
})

const router = useRouter()

// 当前步骤
const currentStep = ref(0)

// 表单引用
const formRef = ref<FormInstance>()
const trainingScopeFormRef = ref<FormInstance>()

// 表单数据
interface FormData {
  name: string
  skillTag: string
  domainCategory?: string
  difficulty: string
  studyHours: string
  backgroundImage: File | null
  coverImage: File | null
  description: string
  showTaskRequirement: boolean
  trainingScope: string
  enableCodeRepository: boolean
  repositoryType: string
  repositoryUrl: string
}

const formData = ref<FormData>({
  name: '',
  skillTag: '',
  domainCategory: undefined,
  difficulty: '简单',
  studyHours: '',
  backgroundImage: null,
  coverImage: null,
  description: '',
  showTaskRequirement: false,
  trainingScope: '完全公开',
  enableCodeRepository: false,
  repositoryType: '代码仓库',
  repositoryUrl: 'https://git.educoder.net/pmper166s9/test9',
})

// 从路由接收数据并填充表单
onMounted(() => {
  const routeData = history.state as any
  console.log('接收到的路由数据:', routeData)
  
  if (routeData && routeData.name) {
    // 难度映射：数字转字符串
    const difficultyMap: Record<number, string> = {
      1: '简单',
      2: '适中',
      3: '困难',
    }
    
    // 填充基础信息
    formData.value.name = routeData.name || ''
    formData.value.description = routeData.description || ''
    formData.value.difficulty = difficultyMap[routeData.difficulty] || '简单'
    formData.value.studyHours = routeData.classHour || ''
    formData.value.showTaskRequirement = routeData.showTaskRequire || false
    
    console.log('已自动填充表单数据:', {
      name: formData.value.name,
      description: formData.value.description,
      descriptionLength: formData.value.description?.length || 0,
      difficulty: formData.value.difficulty,
      studyHours: formData.value.studyHours,
      showTaskRequirement: formData.value.showTaskRequirement
    })
  } else {
    console.log('未接收到路由数据')
  }
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

// 步骤标题
const steps = [
  { title: '基本信息' },
  { title: '代码仓库' },
  { title: '评测设置' },
  { title: '实验环境' },
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

// 文件上传处理
const handleBackgroundUpload = (file: File) => {
  formData.value.backgroundImage = file
  return false
}

const handleCoverUpload = (file: File) => {
  formData.value.coverImage = file
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
interface NewFileForm {
  fileName: string
  fileContent: string
}

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
interface NewFolderForm {
  folderName: string
}

const handleConfirmNewFolder = (formData: NewFolderForm) => {
  addFolderToTree(formData.folderName, currentFolderParentPath.value)
  message.success('文件夹创建成功')
  showNewFolderModal.value = false
}

// 评测设置 - 当前标签页
const evaluationActiveTab = ref('settings')

// 评测设置数据
interface EvaluationData {
  enableEvaluation: boolean
  defaultFile: File | null
  defaultFileName: string
  timeLimit: string
  scoringRule: string
  evaluationSetting: string
  testSets: TestSet[]
}

interface TestSet {
  id: number
  checked: boolean
  content: string
}

const evaluationData = ref<EvaluationData>({
  enableEvaluation: true,
  defaultFile: null,
  defaultFileName: '',
  timeLimit: '',
  scoringRule: '通过全部测试集',
  evaluationSetting: '通过所有代码块评测',
  testSets: [
    { id: 1, checked: false, content: '' },
    { id: 2, checked: false, content: '' },
  ],
})

// 参考答案数据
interface ReferenceAnswerData {
  hideReference: boolean
  disableCopy: boolean
  content: string
}

const referenceAnswerData = ref<ReferenceAnswerData>({
  hideReference: true,
  disableCopy: true,
  content: '',
})

// 测试集计数器
let testSetIdCounter = 3

// 新增测试集
const addTestSet = () => {
  evaluationData.value.testSets.push({
    id: testSetIdCounter++,
    checked: false,
    content: '',
  })
}

// 删除测试集
const deleteTestSet = () => {
  // 检查是否有选中的测试集
  const hasChecked = evaluationData.value.testSets.some(item => item.checked)
  if (!hasChecked) {
    message.warning('请勾选要删除的测试集')
    return
  }
  
  evaluationData.value.testSets = evaluationData.value.testSets.filter(item => !item.checked)
  if (evaluationData.value.testSets.length === 0) {
    message.warning('至少保留一个测试集')
    evaluationData.value.testSets.push({
      id: testSetIdCounter++,
      checked: false,
      content: '',
    })
  }
}

// 选择代码文件
const handleCodeFileUpload = (file: File) => {
  evaluationData.value.defaultFile = file
  evaluationData.value.defaultFileName = file.name
  message.success(`已选择文件: ${file.name}`)
  return false
}

// 返回
const handleBack = () => {
  if (currentStep.value === 0) {
    router.back()
  } else {
    currentStep.value--
    scrollToTop()
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
    // 收集所有数据
    const projectData = {
      type: 'JupyterLab',
      basicInfo: formData.value,
      repository: {
        enabled: formData.value.enableCodeRepository,
        type: formData.value.repositoryType,
        url: formData.value.repositoryUrl,
        fileTree: fileTreeData.value,
      },
      evaluation: evaluationData.value,
      referenceAnswer: referenceAnswerData.value,
      environment: {
        selectedEnvironment: selectedEnvironment.value,
        config: environmentConfig.value,
      },
    }
    
    console.log('保存项目数据：', projectData)
    
    message.success('项目创建成功！')
    
    setTimeout(() => {
      router.push('/dashboard/analysis')
    }, 500)
  } catch (error) {
    console.error('保存失败：', error)
    message.error('保存失败，请重试')
  }
}

// 实验环境列表
const environmentList = [
  { id: '1', name: 'Python3/JupyterLab', value: 'Python3/JupyterLab' },
  { id: '2', name: 'R4.2/Jupyterlab', value: 'R4.2/Jupyterlab' },
  { id: '3', name: 'Python3-tensorflow2.6/JupyterLab', value: 'Python3-tensorflow2.6/JupyterLab' },
  { id: '4', name: 'Python3.7/Jupyterlab', value: 'Python3.7/Jupyterlab' },
  { id: '5', name: 'Python3.7-TensorFlow1.13/JupyterLab', value: 'Python3.7-TensorFlow1.13/JupyterLab' },
  { id: '6', name: 'Python3.8/JupyterLab', value: 'Python3.8/JupyterLab' },
  { id: '7', name: 'Python3.10/Jupyterlab', value: 'Python3.10/Jupyterlab' },
  { id: '8', name: 'Python3.11/JupyterLab', value: 'Python3.11/JupyterLab' },
  { id: '9', name: 'Python3.10-ultralytics/JupyterLab', value: 'Python3.10-ultralytics/JupyterLab' },
]

// 选中的实验环境
const selectedEnvironment = ref('Python3/JupyterLab')

// 环境搜索关键词
const environmentSearchKeyword = ref('')

// 过滤后的环境列表
const filteredEnvironmentList = computed(() => {
  if (!environmentSearchKeyword.value) {
    return environmentList
  }
  return environmentList.filter(env => 
    env.name.toLowerCase().includes(environmentSearchKeyword.value.toLowerCase())
  )
})

// 实验环境配置
interface EnvironmentConfig {
  attachedEnvironment: string
  usageDuration: string
}

const environmentConfig = ref<EnvironmentConfig>({
  attachedEnvironment: 'Css',
  usageDuration: '',
})

// 选择实验环境
const handleSelectEnvironment = (envValue: string) => {
  selectedEnvironment.value = envValue
}

// 滚动到顶部
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
</script>

<template>
  <div class="config-jupyter-lab-page">
    <div class="page-header">
      <h2>JupyterLab环境实训项目配置</h2>
    </div>

    <div class="page-container">
      <!-- 步骤条 -->
      <div class="steps-section">
        <a-steps :current="currentStep" class="custom-steps">
          <a-step v-for="(step, index) in steps" :key="index" :title="step.title" />
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
          <a-form 
            ref="formRef" 
            :model="formData" 
            :rules="formRules" 
            layout="horizontal" 
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 18 }"
          >
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
                <a-form-item label="领域类别" name="domainCategory" required :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }">
                  <a-select 
                    v-model:value="formData.domainCategory" 
                    placeholder="请选择领域类别"
                    :options="domainCategoryOptions" 
                  />
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

            <a-form-item label="学时" name="studyHours">
              <a-input v-model:value="formData.studyHours" placeholder="请输入学时" />
            </a-form-item>

            <a-form-item label="顶部背景图" name="backgroundImage" required>
              <div class="flex items-top gap-16px">
                <a-upload 
                  :before-upload="handleBackgroundUpload" 
                  :show-upload-list="false"
                  accept="image/png,image/jpeg"
                >
                  <a-button>选择文件</a-button>
                </a-upload>
                <div class="upload-hint">
                  说明：支持上传png/jpeg等格式文件，文件大小不能超过12M,建议使用290*218像素；如不上传，默认使用系统图片。
                </div>
              </div>
            </a-form-item>

            <a-form-item label="封面图" name="coverImage" required>
              <div class="flex items-top gap-16px">
                <a-upload 
                  :before-upload="handleCoverUpload" 
                  :show-upload-list="false" 
                  accept="image/png,image/jpeg"
                >
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
                显示任务要求（勾选后，将简介作为任务要求显示在实践项目挑战页面）
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
          <a-form 
            ref="trainingScopeFormRef" 
            :model="formData" 
            :rules="formRules" 
            layout="horizontal"
            :label-col="{ span: 2 }" 
            :wrapper-col="{ span: 18 }"
          >
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

      <!-- 第三步：评测设置 -->
      <div v-if="currentStep === 2" class="step-content evaluation-step">
        <a-tabs v-model:activeKey="evaluationActiveTab" class="evaluation-tabs">
          <!-- 评测设置标签页 -->
          <a-tab-pane key="settings" tab="评测设置">
            <div class="evaluation-section">
              <!-- 评测文件 -->
              <div class="section-block">
                <div class="block-header">评测文件</div>
                <div class="block-content">
                  <a-form layout="horizontal" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                    <a-form-item label="是否启用评测功能" required>
                      <a-radio-group v-model:value="evaluationData.enableEvaluation" class="custom-radio">
                        <a-radio :value="true">是</a-radio>
                        <a-radio :value="false">否</a-radio>
                      </a-radio-group>
                    </a-form-item>

                    <template v-if="evaluationData.enableEvaluation">
                      <a-form-item label="默认打开文件" required>
                        <div class="flex items-center gap-16px">
                          <a-upload 
                            :before-upload="handleCodeFileUpload"
                            :show-upload-list="false"
                            accept=".py,.ipynb"
                          >
                            <a-button type="primary">点击选择代码文件</a-button>
                          </a-upload>
                          <span v-if="evaluationData.defaultFileName" class="file-name">
                            {{ evaluationData.defaultFileName }}
                          </span>
                        </div>
                      </a-form-item>

                      <a-form-item label="评测时长限制" required>
                        <a-input 
                          v-model:value="evaluationData.timeLimit" 
                          placeholder="请输入评测时长（秒）" 
                          style="width: 600px"
                        />
                      </a-form-item>

                      <a-form-item label="系统评分规则">
                        <a-radio-group v-model:value="evaluationData.scoringRule" class="custom-radio">
                          <a-radio value="通过全部测试集">
                            通过全部测试集（仅当所有测试集都正确时，获得项目学时）
                          </a-radio>
                          <a-radio value="通过部分测试集">
                            通过部分测试集（任意一个测试集正确时，获得项目学时）
                          </a-radio>
                        </a-radio-group>
                      </a-form-item>

                      <a-form-item label="评测设置" required>
                        <a-radio-group v-model:value="evaluationData.evaluationSetting" class="custom-radio">
                          <a-radio value="通过所有代码块评测">
                            通过所有代码块评测（对学员任务文件的所有非空代码块进行评测）
                          </a-radio>
                          <a-radio value="通过指定代码块评测">
                            通过指定代码块评测（对学员任务文件的指定非空代码块进行评测）
                          </a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </template>
                  </a-form>
                </div>
              </div>

              <!-- 测试集 -->
              <div v-if="evaluationData.enableEvaluation" class="section-block">
                <div class="block-header">
                  <span>测试集</span>
                  <div class="header-actions">
                    <a-button @click="addTestSet">新增测试集</a-button>
                    <a-button @click="deleteTestSet">删除测试集</a-button>
                  </div>
                </div>
                <div class="block-content">
                  <div 
                    v-for="(testSet, index) in evaluationData.testSets" 
                    :key="testSet.id"
                    class="test-set-item"
                  >
                    <a-checkbox v-model:checked="testSet.checked" />
                    <span class="test-set-label">测试集{{ index + 1 }}</span>
                    <a-input 
                      v-model:value="testSet.content" 
                      placeholder="请输入预期输出内容"
                      class="test-set-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 参考答案标签页 -->
          <a-tab-pane key="reference" tab="参考答案">
            <div class="reference-section">
              <div class="section-block">
                <div class="block-header">参考答案</div>
                <div class="block-content">
                  <a-form layout="horizontal" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                    <a-form-item label="是否隐藏参考答案模块" required>
                      <a-radio-group v-model:value="referenceAnswerData.hideReference" class="custom-radio">
                        <a-radio :value="true">是</a-radio>
                        <a-radio :value="false">否</a-radio>
                      </a-radio-group>
                    </a-form-item>

                    <a-form-item label="是否禁止复制参考答案" required>
                      <a-radio-group v-model:value="referenceAnswerData.disableCopy" class="custom-radio">
                        <a-radio :value="true">是</a-radio>
                        <a-radio :value="false">否</a-radio>
                      </a-radio-group>
                    </a-form-item>

                    <a-form-item label="参考答案" required>
                      <RichTextEditor v-model="referenceAnswerData.content" />
                    </a-form-item>
                  </a-form>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 第四步：实验环境 -->
      <div v-if="currentStep === 3" class="step-content environment-step">
        <div class="environment-section">
          <h3 class="section-main-title">实验环境</h3>
          
          <div class="environment-container">
            <!-- 左侧：环境列表 -->
            <div class="environment-left">
              <div class="search-box">
                <a-input 
                  v-model:value="environmentSearchKeyword"
                  placeholder="搜索需要的实验环境"
                  allow-clear
                >
                  <template #suffix>
                    <span class="search-icon">🔍</span>
                  </template>
                </a-input>
              </div>
              
              <div class="environment-list">
                <div 
                  v-for="env in filteredEnvironmentList" 
                  :key="env.id"
                  class="environment-item"
                  :class="{ active: selectedEnvironment === env.value }"
                  @click="handleSelectEnvironment(env.value)"
                >
                  {{ env.name }}
                </div>
              </div>
            </div>

            <!-- 右侧：环境配置 -->
            <div class="environment-right">
              <div class="environment-config-header">
                实验环境: {{ selectedEnvironment }}
              </div>
              
              <a-form 
                :model="environmentConfig"
                layout="horizontal"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-form-item label="附带环境">
                  <a-select 
                    v-model:value="environmentConfig.attachedEnvironment"
                    placeholder="请选择附带环境"
                  >
                    <a-select-option value="Bwapp">Bwapp</a-select-option>
                    <a-select-option value="Css">Css</a-select-option>
                    <a-select-option value="DataTurks">DataTurks</a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item label="实验环境使用时长">
                  <a-input 
                    v-model:value="environmentConfig.usageDuration"
                    placeholder="请输入实验环境使用时长"
                    suffix="分"
                  />
                </a-form-item>
              </a-form>
            </div>
          </div>
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

    <NewFileModal
      v-model:open="showNewFileModal"
      :parent-path="currentParentPath"
      @confirm="handleConfirmNewFile"
    />

    <NewFolderModal
      v-model:open="showNewFolderModal"
      :parent-path="currentFolderParentPath"
      @confirm="handleConfirmNewFolder"
    />
  </div>
</template>

<style scoped lang="less">
.config-jupyter-lab-page {
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

  .page-container {
    background: #fff;
    padding: 24px;
    border-radius: 4px;

    .steps-section {
      margin-bottom: 32px;
      padding: 0 100px;

      .custom-steps {
        max-width: 800px;
        margin: 0 auto;
      }
    }

    .section-title {
      background: #40a9ff;
      padding: 8px 18px;
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
      
      h3 {
        margin: 0;
      }
    }

    .form-section {
      margin-bottom: 24px;

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

    .step-content {
      .content-card {
        padding: 32px;
        min-height: 400px;
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

.upload-hint {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  line-height: 1.5;
}

.flex {
  display: flex;
}

.items-top {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-12px {
  gap: 12px;
}

.gap-16px {
  gap: 16px;
}

.file-name {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
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

/* 评测设置样式 */
.evaluation-step {
  .evaluation-tabs {
    ::v-deep(.ant-tabs-nav) {
      margin-bottom: 0;
      background: #fff;
    }

    ::v-deep(.ant-tabs-content-holder) {
      padding: 0;
    }
  }

  .evaluation-section,
  .reference-section {
    padding: 20px 0;
  }

  .section-block {
    background: #fff;
    margin-bottom: 16px;
    border-radius: 4px;
    overflow: hidden;

    .block-header {
      background: #5b8ff9;
      color: #fff;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 8px;

        .ant-btn {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.6);
          font-size: 13px;
          height: 28px;
          padding: 0 12px;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #fff;
          }
        }
      }
    }

    .block-content {
      padding: 24px;

      .ant-form-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .test-set-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .test-set-label {
      min-width: 70px;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
    }

    .test-set-input {
      flex: 1;
    }
  }
}

/* 实验环境样式 */
.environment-step {
  .section-main-title {
    font-size: 18px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .environment-section {
    .environment-container {
      display: flex;
      gap: 24px;
      min-height: 500px;

      .environment-left {
        width: 440px;
        background: #f5f5f5;
        border-radius: 4px;
        padding: 16px;
        display: flex;
        flex-direction: column;

        .search-box {
          margin-bottom: 16px;

          .search-icon {
            font-size: 16px;
          }
        }

        .environment-list {
          flex: 1;
          overflow-y: auto;

          .environment-item {
            padding: 12px 16px;
            background: #e8e8e8;
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.85);

            &:hover {
              background: #d9d9d9;
            }

            &.active {
              background: #fff;
              color: #1890ff;
              font-weight: 500;
            }

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }

      .environment-right {
        flex: 1;
        background: #fafafa;
        border-radius: 4px;
        padding: 24px;

        .environment-config-header {
          font-size: 16px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e8e8e8;
        }

        .ant-form-item {
          margin-bottom: 24px;

          ::v-deep(.ant-form-item-label) {
            label {
              font-size: 14px;
              color: rgba(0, 0, 0, 0.85);
            }
          }
        }
      }
    }
  }
}
</style>

