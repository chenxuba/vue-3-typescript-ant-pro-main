<script setup lang="ts">
import { ref, nextTick, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { uploadFileApi } from '@/api/common/file'
import { getProjectDetailApi, updateProjectApi, getProjectTaskListApi, updateProjectTaskApi } from '@/api/project'
import { getDicGroupApi, getEnvironmentDicCode } from '@/api/common/dictionary'
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
  name: 'EditJupyterLab',
})

const router = useRouter()
const route = useRoute()

// 项目ID
const projectId = ref<number | null>(null)

// 任务ID
const taskId = ref<number | null>(null)

// 当前步骤
const currentStep = ref(0)

// 加载状态
const loading = ref(false)

// 表单引用
const formRef = ref<FormInstance>()
const trainingScopeFormRef = ref<FormInstance>()

// 表单数据
interface FormData {
  name: string
  tag: string
  fieldType?: number
  difficulty: number
  environment?: number
  secondType?: number
  classHour: string
  topCover: string
  cover: string
  description: string
  showTaskRequire: boolean
  authType: number
  enableCodeRepository: boolean
  repositoryType: string
  gitUrl: string
}

const formData = ref<FormData>({
  name: '',
  tag: '',
  fieldType: undefined,
  difficulty: 1,
  environment: undefined,
  secondType: undefined,
  classHour: '',
  topCover: '',
  cover: '',
  description: '',
  showTaskRequire: false,
  authType: 1,
  enableCodeRepository: false,
  repositoryType: '代码仓库',
  gitUrl: '',
})

// 图片上传相关
const topCoverUrl = ref<string>('')
const coverUrl = ref<string>('')
const uploadingTopCover = ref(false)
const uploadingCover = ref(false)
const imageUrlPrefix = 'http://101.200.13.193'

// 表单验证规则
const formRules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  tag: [
    { required: true, message: '请输入技能标签', trigger: 'blur' },
  ],
  fieldType: [
    { required: true, message: '请选择领域类别', trigger: 'change' },
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' },
  ],
  environment: [
    { required: true, message: '请选择实验环境', trigger: 'change' },
  ],
  secondType: [
    { required: true, message: '请选择小类别', trigger: 'change' },
  ],
  classHour: [
    { required: true, message: '请输入学时', trigger: 'blur' },
  ],
  topCover: [
    { required: true, message: '请上传顶部背景图', trigger: 'change' },
  ],
  cover: [
    { required: true, message: '请上传封面图', trigger: 'change' },
  ],
  authType: [
    { required: true, message: '请选择培训公开范围', trigger: 'change' },
  ],
}

// 领域类别选项
const domainCategoryOptions = [
  { label: '人工智能', value: 1 },
  { label: '大数据', value: 2 },
  { label: '云计算', value: 3 },
  { label: 'Web开发', value: 4 },
]

// 实验环境选项（从字典API加载）
const environmentOptions = ref<Array<{ label: string; value: string }>>([])

// 加载状态
const loadingEnvironment = ref(false)

// 加载实验环境选项
const loadEnvironmentOptions = async () => {
  try {
    loadingEnvironment.value = true
    // JupyterLab环境使用 project#environment_3
    const code = getEnvironmentDicCode(3)
    const data = await getDicGroupApi({ code })
    if (data && data.list) {
      environmentOptions.value = data.list.map(item => ({
        label: item.name,
        value: item.value,
      }))
    }
  } catch (error) {
    console.error('加载实验环境选项失败：', error)
    message.error('加载实验环境选项失败')
  } finally {
    loadingEnvironment.value = false
  }
}

// 小类别选项
const secondTypeOptions = [
  { label: 'Bwapp', value: 1 },
  { label: 'CSS', value: 2 },
  { label: 'DataTurks', value: 3 },
]

// 仓库类型选项
const repositoryTypeOptions = [
  { label: '切换仓库', value: '切换仓库' },
  { label: '代码仓库', value: '代码仓库' },
  { label: '私密代码仓库', value: '私密代码仓库' },
]

// 仓库地址是否锁定
const isRepositoryUrlLocked = ref(false)

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

// 评测设置 - 当前标签页
const evaluationActiveTab = ref('settings')

// 评测设置数据
interface EvaluationData {
  openTestValidate: number // 1开 2不开
  testValidateFiles: string // 评测文件URL
  timeLimitM: string | number // 评测时长限制（分钟）
  scoreRule: number // 系统评分规则：1-通过全部测试集 2-通过部分测试集
  evaluationSetting: string
  testSets: TestSet[]
}

interface TestSet {
  id: number
  args: string
  answer: string
  select: number
}

const evaluationData = ref<EvaluationData>({
  openTestValidate: 1,
  testValidateFiles: '',
  timeLimitM: '',
  scoreRule: 1,
  evaluationSetting: '通过所有代码块评测',
  testSets: [],
})

// 参考答案数据
interface ReferenceAnswerData {
  showAnswer: number // 1是显示、2否隐藏
  prohibitCopyAnswer: number // 1是禁止、2否不禁止
  referenceAnswer: string
}

const referenceAnswerData = ref<ReferenceAnswerData>({
  showAnswer: 1,
  prohibitCopyAnswer: 1,
  referenceAnswer: '',
})

// 保存状态标记
const evaluationSaved = ref(false)
const referenceAnswerSaved = ref(false)

// 测试集计数器
let testSetIdCounter = 1

// 新增测试集
const addTestSet = () => {
  evaluationData.value.testSets.push({
    id: testSetIdCounter++,
    args: '',
    answer: '',
    select: 1,
  })
}

// 删除单个测试集
const removeTestSet = (id: number) => {
  if (evaluationData.value.testSets.length === 1) {
    message.warning('至少保留一个测试集')
    return
  }
  evaluationData.value.testSets = evaluationData.value.testSets.filter(item => item.id !== id)
  message.success('删除成功')
}

// 处理测试集选中状态变化
const handleTestSetSelectChange = (testSet: TestSet, checked: boolean) => {
  testSet.select = checked ? 1 : 2
}

// 评测文件列表
const testValidateFileList = ref<any[]>([])

// 自定义上传请求（用于多文件上传）
const handleLearningResourceCustomRequest = (options: any) => {
  const { onSuccess } = options
  setTimeout(() => {
    onSuccess('ok')
  }, 0)
}

// 处理评测文件上传
const handleTestValidateFilesUpload = async (info: any) => {
  const { fileList } = info
  
  const validFiles = fileList.filter((file: any) => {
    if (file.status === 'uploading') return true
    if (file.status === 'done' || !file.status) return true
    return false
  })
  
  testValidateFileList.value = validFiles
  
  const uploadPromises = validFiles
    .filter((file: any) => file.originFileObj && !file.url)
    .map(async (file: any) => {
      try {
        const url = await uploadFileApi(file.originFileObj)
        file.url = url
        return url
      } catch (error) {
        console.error('文件上传失败:', error)
        message.error(`文件 ${file.name} 上传失败`)
        return null
      }
    })
  
  if (uploadPromises.length > 0) {
    const urls = await Promise.all(uploadPromises)
    const successUrls = urls.filter(url => url !== null)
    
    if (successUrls.length > 0) {
      const allUrls = validFiles
        .filter((file: any) => file.url)
        .map((file: any) => file.url)
        .join(',')
      
      evaluationData.value.testValidateFiles = allUrls
      message.success(`成功上传 ${successUrls.length} 个文件`)
    }
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
  dockerImage: string
  secondType: string
  timeLimitM: string | number
}

const environmentConfig = ref<EnvironmentConfig>({
  dockerImage: '1',
  secondType: 'Css',
  timeLimitM: '',
})

// 选择实验环境
const handleSelectEnvironment = (envValue: string) => {
  selectedEnvironment.value = envValue
  const selectedEnv = environmentList.find(env => env.value === envValue)
  if (selectedEnv) {
    environmentConfig.value.dockerImage = selectedEnv.id
  }
}

// 获取项目详情
const fetchProjectDetail = async () => {
  if (!projectId.value) {
    message.error('缺少项目ID')
    router.back()
    return
  }

  try {
    loading.value = true
    const detail = await getProjectDetailApi({ id: projectId.value })
    
    // 回填基本信息表单数据
    formData.value = {
      name: detail.name || '',
      tag: detail.tag || '',
      fieldType: detail.fieldType,
      difficulty: detail.difficulty || 1,
      environment: detail.environment,
      secondType: detail.secondType,
      classHour: detail.classHour || '',
      topCover: detail.topCover || '',
      cover: detail.cover || '',
      description: detail.description || '',
      showTaskRequire: detail.showTaskRequire === 1,
      authType: detail.authType || 1,
      enableCodeRepository: detail.gitUrl ? true : (detail.enableCodeRepository || false),
      repositoryType: detail.repositoryType || '代码仓库',
      gitUrl: detail.gitUrl || '',
    }
    
    // 设置图片预览
    if (detail.topCover) {
      topCoverUrl.value = imageUrlPrefix + detail.topCover
    }
    if (detail.cover) {
      coverUrl.value = imageUrlPrefix + detail.cover
    }
    
    // 如果有仓库地址，自动打开开关并锁定输入框
    if (detail.gitUrl) {
      isRepositoryUrlLocked.value = true
    }
    
    // 获取任务数据
    await fetchProjectTaskList()
    
  } catch (error: any) {
    console.error('获取项目详情失败：', error)
    message.error(error.message || '获取项目详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取任务列表并填充评测设置和参考答案
const fetchProjectTaskList = async () => {
  if (!projectId.value) return
  
  try {
    const response = await getProjectTaskListApi({ projectId: projectId.value })
    
    let list: any[] = []
    if (Array.isArray(response)) {
      list = response
    } else if (response && typeof response === 'object') {
      list = (response as any).list || (response as any).data || (response as any).tasks || []
    }
    
    if (list && list.length > 0) {
      const task = list[0] // JupyterLab只有一个任务
      if (task) {
        taskId.value = task.taskId
        
        // 填充评测设置
        evaluationData.value = {
          openTestValidate: task.openTestValidate || 1,
          testValidateFiles: task.testValidateFiles || '',
          timeLimitM: task.timeLimitM || '',
          scoreRule: task.scoreRule || 1,
          evaluationSetting: '通过所有代码块评测',
          testSets: [],
        }
        
        // 解析测试集
        if (task.testContent) {
          try {
            const testContent = JSON.parse(task.testContent)
            evaluationData.value.testSets = testContent.map((item: any, index: number) => ({
              id: index + 1,
              args: item.args || '',
              answer: item.answer || '',
              select: item.select || 1,
            }))
            testSetIdCounter = evaluationData.value.testSets.length + 1
          } catch (e) {
            console.error('解析测试集失败:', e)
          }
        }
        
        // 如果没有测试集，添加默认的两个
        if (evaluationData.value.testSets.length === 0) {
          evaluationData.value.testSets = [
            { id: 1, args: '', answer: '', select: 1 },
            { id: 2, args: '', answer: '', select: 1 },
          ]
          testSetIdCounter = 3
        }
        
        // 填充评测文件列表
        if (task.testValidateFiles) {
          testValidateFileList.value = task.testValidateFiles.split(',').map((url: string, index: number) => ({
            uid: `${index}`,
            name: url.split('/').pop() || `文件${index + 1}`,
            status: 'done',
            url: url,
            response: url,
          }))
        }
        
        // 填充参考答案
        referenceAnswerData.value = {
          showAnswer: task.showAnswer || 1,
          prohibitCopyAnswer: task.prohibitCopyAnswer || 1,
          referenceAnswer: task.referenceAnswer || '',
        }
        
        // 填充实验环境配置
        if (task.dockerImage) {
          const env = environmentList.find(e => e.id === String(task.dockerImage))
          if (env) {
            selectedEnvironment.value = env.value
          }
          environmentConfig.value.dockerImage = String(task.dockerImage)
        }
        if (task.secondType) {
          environmentConfig.value.secondType = task.secondType
        }
        if (task.timeLimitM) {
          environmentConfig.value.timeLimitM = task.timeLimitM
        }
        
        // 标记为已保存
        evaluationSaved.value = true
        referenceAnswerSaved.value = true
      }
    }
  } catch (error: any) {
    console.error('获取任务列表失败：', error)
  }
}

// 文件上传处理
const handleBackgroundUpload = async (file: File) => {
  const isLt12M = file.size / 1024 / 1024 < 12
  if (!isLt12M) {
    message.error('图片大小不能超过 12MB!')
    return false
  }

  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }

  try {
    uploadingTopCover.value = true
    const fileUrl = await uploadFileApi(file)
    topCoverUrl.value = imageUrlPrefix + fileUrl
    formData.value.topCover = fileUrl
    formRef.value?.validateFields(['topCover'])
    message.success('顶部背景图上传成功')
  } catch (error) {
    message.error('顶部背景图上传失败')
  } finally {
    uploadingTopCover.value = false
  }

  return false
}

const handleCoverUpload = async (file: File) => {
  const isLt12M = file.size / 1024 / 1024 < 12
  if (!isLt12M) {
    message.error('图片大小不能超过 12MB!')
    return false
  }

  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }

  try {
    uploadingCover.value = true
    const fileUrl = await uploadFileApi(file)
    coverUrl.value = imageUrlPrefix + fileUrl
    formData.value.cover = fileUrl
    formRef.value?.validateFields(['cover'])
    message.success('封面图上传成功')
  } catch (error) {
    message.error('封面图上传失败')
  } finally {
    uploadingCover.value = false
  }

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

// 模拟请求仓库文件
const fetchRepositoryFiles = async () => {
  try {
    message.loading('正在查询仓库文件...', 1)
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('仓库文件查询成功')
  } catch (error) {
    message.error('仓库文件查询失败')
  }
}

// 确认开启代码库
const handleConfirmRepository = async () => {
  if (!formData.value.gitUrl || !formData.value.gitUrl.trim()) {
    message.error('请先配置仓库地址')
    handleCancelRepository()
    return
  }
  
  formData.value.enableCodeRepository = true
  showRepositoryModal.value = false
  isRepositoryUrlLocked.value = true
  await fetchRepositoryFiles()
}

// 取消开启代码库
const handleCancelRepository = () => {
  formData.value.enableCodeRepository = false
  showRepositoryModal.value = false
}

// 监听仓库类型变化
watch(() => formData.value.repositoryType, (newType) => {
  if (newType === '切换仓库' && formData.value.enableCodeRepository) {
    isRepositoryUrlLocked.value = false
    message.info('已解锁仓库地址，请重新输入')
    nextTick(() => {
      formData.value.repositoryType = '代码仓库'
    })
  }
})

// 仓库地址输入框失焦处理
const handleRepositoryUrlBlur = () => {
  if (formData.value.enableCodeRepository && !isRepositoryUrlLocked.value) {
    const url = formData.value.gitUrl?.trim()
    if (url) {
      isRepositoryUrlLocked.value = true
      fetchRepositoryFiles()
    }
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
      currentStep.value = 1
      scrollToTop()
    } catch (error) {
      message.error('请完善必填信息')
      scrollToTop()
    }
  } else if (currentStep.value === 1) {
    // 第二步：代码仓库验证
    if (formData.value.enableCodeRepository) {
      if (!formData.value.gitUrl || formData.value.gitUrl.trim() === '') {
        message.error('请输入仓库地址')
        return
      }
    }
    // 更新项目基本信息
    await handleUpdateProject(false)
    currentStep.value = 2
    scrollToTop()
  } else if (currentStep.value === 2) {
    // 第三步：评测设置验证
    if (!evaluationSaved.value) {
      message.error('请先保存评测设置后再进行下一步')
      return
    }
    
    if (!referenceAnswerSaved.value) {
      message.error('请先保存参考答案后再进行下一步')
      return
    }
    
    currentStep.value = 3
    scrollToTop()
  } else if (currentStep.value === 3) {
    // 第四步：实验环境验证并完成更新
    await handleCompleteUpdate()
  }
}

// 更新项目
const handleUpdateProject = async (isComplete: boolean = false) => {
  try {
    loading.value = true
    
    const submitData: any = {
      id: projectId.value,
      projectType: 3, // JupyterLab环境实训项目
      environment: formData.value.environment,
      name: formData.value.name,
      tag: formData.value.tag,
      fieldType: formData.value.fieldType,
      difficulty: formData.value.difficulty,
      classHour: formData.value.classHour,
      topCover: formData.value.topCover,
      cover: formData.value.cover,
      description: formData.value.description,
      showTaskRequire: formData.value.showTaskRequire ? 1 : 2,
      authType: formData.value.authType,
      enableCodeRepository: formData.value.enableCodeRepository,
      secondType: formData.value.secondType,
    }

    if (formData.value.enableCodeRepository) {
      submitData.repositoryType = formData.value.repositoryType
      submitData.gitUrl = formData.value.gitUrl
    }

    await updateProjectApi(submitData)
    
    if (isComplete) {
      message.success('项目更新成功！')
      setTimeout(() => {
        router.push('/dashboard/analysis')
      }, 500)
    } else {
      message.success('保存成功！')
    }
  } catch (error: any) {
    console.error('更新失败：', error)
    message.error(error.message || '项目更新失败，请稍后重试')
    throw error
  } finally {
    loading.value = false
  }
}

// 保存评测设置
const handleSaveEvaluation = async () => {
  try {
    if (!taskId.value) {
      message.error('任务ID不存在')
      return
    }
    
    // 如果启用了评测功能，进行非空校验
    if (evaluationData.value.openTestValidate === 1) {
      if (!evaluationData.value.testValidateFiles || evaluationData.value.testValidateFiles.trim() === '') {
        message.error('请上传评测文件')
        return
      }
      
      if (!evaluationData.value.timeLimitM) {
        message.error('请输入评测时长限制')
        return
      }
      
      if (!evaluationData.value.testSets || evaluationData.value.testSets.length === 0) {
        message.error('请至少添加一个测试集')
        return
      }
      
      const selectedTestSets = evaluationData.value.testSets.filter(item => item.select === 1)
      if (selectedTestSets.length === 0) {
        message.error('请至少选中一个测试集')
        return
      }
      
      for (let i = 0; i < selectedTestSets.length; i++) {
        const testSet = selectedTestSets[i]
        if (!testSet.args || testSet.args.trim() === '') {
          message.error(`测试集${i + 1}的输入内容不能为空`)
          return
        }
        if (!testSet.answer || testSet.answer.trim() === '') {
          message.error(`测试集${i + 1}的期望输出不能为空`)
          return
        }
      }
    }
    
    const testContentArray = evaluationData.value.testSets.map(item => ({
      args: item.args,
      answer: item.answer,
      select: item.select,
    }))
    
    const taskUpdateData: any = {
      taskId: taskId.value,
      projectId: projectId.value,
      openTestValidate: evaluationData.value.openTestValidate,
      testValidateFiles: evaluationData.value.testValidateFiles,
      timeLimitM: evaluationData.value.timeLimitM,
      scoreRule: evaluationData.value.scoreRule,
      testContent: JSON.stringify(testContentArray),
    }
    
    await updateProjectTaskApi(taskUpdateData as any)
    evaluationSaved.value = true
    message.success('评测设置保存成功！')
  } catch (error) {
    console.error('评测设置保存失败：', error)
    message.error('评测设置保存失败，请重试')
  }
}

// 保存参考答案
const handleSaveReferenceAnswer = async () => {
  try {
    if (!taskId.value) {
      message.error('任务ID不存在')
      return
    }
    
    if (!referenceAnswerData.value.referenceAnswer || referenceAnswerData.value.referenceAnswer.trim() === '') {
      message.error('请输入参考答案内容')
      return
    }
    
    const textContent = referenceAnswerData.value.referenceAnswer.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      message.error('请输入参考答案内容')
      return
    }
    
    const taskUpdateData: any = {
      taskId: taskId.value,
      projectId: projectId.value,
      showAnswer: referenceAnswerData.value.showAnswer,
      prohibitCopyAnswer: referenceAnswerData.value.prohibitCopyAnswer,
      referenceAnswer: referenceAnswerData.value.referenceAnswer,
    }
    
    await updateProjectTaskApi(taskUpdateData as any)
    referenceAnswerSaved.value = true
    message.success('参考答案保存成功！')
  } catch (error) {
    console.error('参考答案保存失败：', error)
    message.error('参考答案保存失败，请重试')
  }
}

// 完成更新
const handleCompleteUpdate = async () => {
  try {
    if (!projectId.value || !taskId.value) {
      message.error('项目ID或任务ID不存在')
      return
    }
    
    if (!evaluationSaved.value) {
      message.error('请先保存评测设置后再完成更新')
      return
    }
    
    if (!referenceAnswerSaved.value) {
      message.error('请先保存参考答案后再完成更新')
      return
    }
    
    if (!environmentConfig.value.dockerImage) {
      message.error('请选择实验环境')
      return
    }
    
    if (!environmentConfig.value.timeLimitM) {
      message.error('请输入实验环境使用时长')
      return
    }
    
    // 更新任务的实验环境配置
    await updateProjectTaskApi({
      taskId: taskId.value,
      projectId: projectId.value,
      dockerImage: environmentConfig.value.dockerImage,
      secondType: environmentConfig.value.secondType,
      timeLimitM: environmentConfig.value.timeLimitM,
    } as any)
    
    // 完成项目更新
    await handleUpdateProject(true)
  } catch (error) {
    console.error('完成更新失败：', error)
    message.error('完成更新失败，请重试')
  }
}

// 页面加载时获取项目详情
onMounted(async () => {
  // 先加载环境选项
  await loadEnvironmentOptions()
  
  // 从路由参数获取项目ID
  const id = route.query.id
  if (id) {
    projectId.value = Number(id)
    fetchProjectDetail()
  } else {
    message.error('缺少项目ID')
    router.back()
  }
})
</script>

<template>
  <div class="edit-jupyter-lab-page">
    <div class="page-header">
      <h2>编辑JupyterLab环境实训项目</h2>
    </div>

    <a-spin :spinning="loading">
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
                  <a-form-item label="技能标签" name="tag" required :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <a-input v-model:value="formData.tag" placeholder="请输入技能标签" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="领域类别" name="fieldType" required :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }">
                    <a-select 
                      v-model:value="formData.fieldType" 
                      placeholder="请选择领域类别"
                      :options="domainCategoryOptions" 
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="难度" name="difficulty" required>
                <a-radio-group v-model:value="formData.difficulty" class="custom-radio">
                  <a-radio :value="1">简单</a-radio>
                  <a-radio :value="2">适中</a-radio>
                  <a-radio :value="3">困难</a-radio>
                </a-radio-group>
              </a-form-item>

              <a-row>
                <a-col :span="12">
                  <a-form-item label="实验环境" name="environment" required :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <a-select 
                      v-model:value="formData.environment" 
                      placeholder="请选择实验环境"
                      :options="environmentOptions"
                      :loading="loadingEnvironment"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="小类别" name="secondType" required :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }">
                    <a-select 
                      v-model:value="formData.secondType" 
                      placeholder="请选择小类别"
                      :options="secondTypeOptions"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="学时" name="classHour" required>
                <a-input-number :min="0" class="w-full" v-model:value="formData.classHour" placeholder="请输入学时" />
              </a-form-item>

              <a-form-item label="顶部背景图" name="topCover" required>
                <div class="flex items-top gap-16px">
                  <div class="flex flex-col gap-12px">
                    <a-upload 
                      :before-upload="handleBackgroundUpload" 
                      :show-upload-list="false"
                      accept="image/png,image/jpeg"
                    >
                      <a-button :loading="uploadingTopCover">
                        <template v-if="!uploadingTopCover">选择文件</template>
                        <template v-else>上传中...</template>
                      </a-button>
                    </a-upload>
                    <div v-if="topCoverUrl" class="image-preview">
                      <img :src="topCoverUrl" alt="顶部背景图预览"
                        style="max-width: 290px; max-height: 218px; border-radius: 4px;" />
                    </div>
                  </div>
                  <div class="upload-hint">
                    说明：支持上传png/jpeg等格式文件，文件大小不能超过12M,建议使用290*218像素。
                  </div>
                </div>
              </a-form-item>

              <a-form-item label="封面图" name="cover" required>
                <div class="flex items-top gap-16px">
                  <div class="flex flex-col gap-12px">
                    <a-upload 
                      :before-upload="handleCoverUpload" 
                      :show-upload-list="false" 
                      accept="image/png,image/jpeg"
                    >
                      <a-button :loading="uploadingCover">
                        <template v-if="!uploadingCover">选择文件</template>
                        <template v-else>上传中...</template>
                      </a-button>
                    </a-upload>
                    <div v-if="coverUrl" class="image-preview">
                      <img :src="coverUrl" alt="封面图预览" style="max-width: 290px; max-height: 218px; border-radius: 4px;" />
                    </div>
                  </div>
                  <div class="upload-hint">
                    说明：支持上传png/jpeg等格式文件，文件大小不能超过12M,建议使用290*218像素。
                  </div>
                </div>
              </a-form-item>

              <a-form-item label="简介" name="description">
                <RichTextEditor v-model="formData.description" />
              </a-form-item>

              <a-form-item label="任务要求" name="showTaskRequire">
                <a-checkbox v-model:checked="formData.showTaskRequire">
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
            <a-form 
              ref="trainingScopeFormRef" 
              :model="formData" 
              :rules="formRules" 
              layout="horizontal"
              :label-col="{ span: 2 }" 
              :wrapper-col="{ span: 18 }"
            >
              <a-form-item label="培训公开范围" name="authType" required>
                <a-radio-group v-model:value="formData.authType" class="custom-radio">
                  <a-radio :value="1">完全公开</a-radio>
                  <a-radio :value="2">全院公开</a-radio>
                  <a-radio :value="3">本单位公开</a-radio>
                  <a-radio :value="4">不公开</a-radio>
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
                <a-input 
                  v-model:value="formData.gitUrl" 
                  placeholder="请输入仓库地址" 
                  class="url-input"
                  :disabled="isRepositoryUrlLocked"
                  @blur="handleRepositoryUrlBlur"
                />
              </div>
            </div>

            <!-- 下方：左右布局 -->
            <div class="repository-main-area">
              <!-- 左侧：开关 + 提示 -->
              <div class="repository-left">
                <div class="repository-switch-box flex items-center justify-between">
                  <div class="flex items-center gap-12px">
                    <span class="switch-label">代码仓库</span>
                    <a-switch 
                      :checked="formData.enableCodeRepository" 
                      :disabled="formData.enableCodeRepository"
                      @change="handleRepositorySwitchChange" 
                    />
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
                        <a-radio-group v-model:value="evaluationData.openTestValidate" class="custom-radio">
                          <a-radio :value="1">是</a-radio>
                          <a-radio :value="2">否</a-radio>
                        </a-radio-group>
                      </a-form-item>

                      <template v-if="evaluationData.openTestValidate === 1">
                        <a-form-item label="评测文件" required>
                          <a-upload 
                            v-model:file-list="testValidateFileList"
                            :custom-request="handleLearningResourceCustomRequest"
                            @change="handleTestValidateFilesUpload"
                            :max-count="10"
                          >
                            <a-button type="primary">点击上传</a-button>
                          </a-upload>
                          <div class="upload-hint">
                            说明：支持上传多个文件，每个文件大小不能超过500M。
                          </div>
                        </a-form-item>

                        <a-form-item label="评测时长限制" required>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <a-input-number 
                              v-model:value="evaluationData.timeLimitM" 
                              :min="1"
                              placeholder="请输入评测时长（分钟）" 
                              style="width: 580px"
                            />
                            <span>分钟</span>
                          </div>
                        </a-form-item>

                        <a-form-item label="系统评分规则">
                          <a-radio-group v-model:value="evaluationData.scoreRule" class="custom-radio">
                            <a-radio :value="1">
                              通过全部测试集（仅当所有测试集都正确时，获得项目学时）
                            </a-radio>
                            <a-radio :value="2">
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
                <div v-if="evaluationData.openTestValidate === 1" class="section-block">
                  <div class="block-header">
                    <span>测试集</span>
                    <div class="header-actions">
                      <a-button @click="addTestSet">新增测试集</a-button>
                    </div>
                  </div>
                  <div class="block-content">
                    <div 
                      v-for="(testSet, index) in evaluationData.testSets" 
                      :key="testSet.id"
                      class="test-set-item"
                    >
                      <a-checkbox 
                        :checked="testSet.select === 1"
                        @change="(e) => handleTestSetSelectChange(testSet, e.target.checked)"
                        class="test-set-checkbox" 
                      />
                      <span class="test-set-label">测试集{{ index + 1 }}</span>
                      <a-input 
                        v-model:value="testSet.args" 
                        placeholder="请输入输入内容"
                        class="test-set-input"
                      />
                      <a-input 
                        v-model:value="testSet.answer" 
                        placeholder="请输入期望输出"
                        class="test-set-input"
                      />
                      <DeleteOutlined 
                        class="delete-test-set-icon" 
                        @click="removeTestSet(testSet.id)" 
                      />
                    </div>
                  </div>
                </div>
                
                <!-- 保存按钮 -->
                <div class="tab-footer-buttons">
                  <a-button type="primary" @click="handleSaveEvaluation">
                    {{ evaluationSaved ? '更新' : '保存' }}
                  </a-button>
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
                      <a-form-item label="是否显示参考答案模块" required>
                        <a-radio-group v-model:value="referenceAnswerData.showAnswer" class="custom-radio">
                          <a-radio :value="1">是</a-radio>
                          <a-radio :value="2">否</a-radio>
                        </a-radio-group>
                      </a-form-item>

                      <a-form-item label="是否禁止复制参考答案" required>
                        <a-radio-group v-model:value="referenceAnswerData.prohibitCopyAnswer" class="custom-radio">
                          <a-radio :value="1">是</a-radio>
                          <a-radio :value="2">否</a-radio>
                        </a-radio-group>
                      </a-form-item>

                      <a-form-item label="参考答案" required>
                        <RichTextEditor v-model="referenceAnswerData.referenceAnswer" />
                      </a-form-item>
                    </a-form>
                  </div>
                </div>
                
                <!-- 保存按钮 -->
                <div class="tab-footer-buttons">
                  <a-button type="primary" @click="handleSaveReferenceAnswer">
                    {{ referenceAnswerSaved ? '更新' : '保存' }}
                  </a-button>
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
                      v-model:value="environmentConfig.secondType"
                      placeholder="请选择附带环境"
                    >
                      <a-select-option value="Bwapp">Bwapp</a-select-option>
                      <a-select-option value="Css">Css</a-select-option>
                      <a-select-option value="DataTurks">DataTurks</a-select-option>
                    </a-select>
                  </a-form-item>

                  <a-form-item label="实验环境使用时长">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <a-input-number 
                        v-model:value="environmentConfig.timeLimitM"
                        :min="1"
                        placeholder="请输入实验环境使用时长"
                        style="flex: 1;"
                      />
                      <span>分</span>
                    </div>
                  </a-form-item>
                </a-form>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="page-footer">
          <a-button @click="handleBack">{{ currentStep === 0 ? '返回' : '上一步' }}</a-button>
          <a-button type="primary" :loading="loading" @click="handleNext">
            {{ currentStep === 3 ? '完成' : '下一步' }}
          </a-button>
        </div>
      </div>
    </a-spin>

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
.edit-jupyter-lab-page {
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

/* 图片预览样式 */
.image-preview {
  img {
    border: 1px solid #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
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

.w-full {
  width: 100%;
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

  .tab-footer-buttons {
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

    .test-set-checkbox {
      flex-shrink: 0;
    }

    .test-set-label {
      min-width: 70px;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      flex-shrink: 0;
    }

    .test-set-input {
      flex: 1;
    }

    .delete-test-set-icon {
      flex-shrink: 0;
      color: #ff4d4f;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;

      &:hover {
        color: #ff7875;
        transform: scale(1.1);
      }
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

