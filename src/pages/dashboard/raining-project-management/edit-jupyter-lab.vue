<script setup lang="ts">
import { ref, nextTick, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { uploadFileApi, getGitFileListApi, saveGitFileContentApi, uploadFileToGitApi, createGitDirApi, deleteGitFileApi } from '@/api/common/file'
import { getProjectDetailApi, updateProjectApi, getProjectTaskListApi, updateProjectTaskApi } from '@/api/project'
import { getDicGroupApi, getEnvironmentDicCode } from '@/api/common/dictionary'
import { useFieldCategoryDictionary, useDifficultyDictionary, useSubcategoryDictionary } from '@/composables/dictionary'
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
import FileSelectModal from './components/FileSelectModal.vue'

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
  environment?: number | string // 支持数字和字符串
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
// 使用领域类别字典
const fieldCategory = useFieldCategoryDictionary()

// 使用难度字典
const difficulty = useDifficultyDictionary()

// 使用小类别字典
const subcategory = useSubcategoryDictionary()

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
        value: String(item.value), // 统一转换为 string
      }))
      console.log('加载环境选项:', {
        environmentOptions: environmentOptions.value,
        currentEnvironment: formData.value.environment
      })
      // 如果第一步已经选择了实验环境，使用第一步的选择
      if (formData.value.environment) {
        selectedEnvironment.value = String(formData.value.environment)
        environmentConfig.value.dockerImage = String(formData.value.environment)
        console.log('使用第一步的环境:', formData.value.environment)
      } 
      // 如果还没有选中的环境，默认选中第一个
      else if (!selectedEnvironment.value && environmentOptions.value.length > 0) {
        selectedEnvironment.value = environmentOptions.value[0].value
        environmentConfig.value.dockerImage = environmentOptions.value[0].value
        formData.value.environment = environmentOptions.value[0].value // 直接使用字符串
        console.log('默认选中第一个环境:', environmentOptions.value[0])
      }
    }
  } catch (error) {
    console.error('加载实验环境选项失败：', error)
    message.error('加载实验环境选项失败')
  } finally {
    loadingEnvironment.value = false
  }
}

// 小类别选项
// 小类别选项已改为使用字典 hooks (subcategory)

// 仓库类型选项
const repositoryTypeOptions = [
  { label: '切换仓库', value: '切换仓库' },
  { label: '代码仓库', value: '代码仓库' },
  { label: '私密代码仓库', value: '私密代码仓库' },
]

// 仓库地址是否锁定
const isRepositoryUrlLocked = ref(false)

// 已加载的文件夹节点（避免重复加载）
const loadedFolderKeys = ref<Set<string>>(new Set())

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
  dynamicFileContents,
  handleSelectFile,
  getNodePath,
  addFileToTree,
  addFolderToTree,
  handleRenameNode,
  handleCopyPath,
  loadRemoteFileTree,
  loadChildrenData,
  getNodePathFromMap,
} = useFileTree()

// 弹窗状态
const showRepositoryModal = ref(false)
const showNewFileModal = ref(false)
const showNewFolderModal = ref(false)
const showTestValidateFileSelectModal = ref(false) // 评测文件选择器
const currentParentPath = ref('/')
const currentFolderParentPath = ref('/')

// 文件上传相关
const fileUploadInput = ref<HTMLInputElement | null>(null)
const currentUploadPath = ref('/')

// 评测设置 - 当前标签页
const evaluationActiveTab = ref('settings')

// 评测设置数据
interface EvaluationData {
  openTestValidate: number // 1开 2不开
  testValidateFiles: string // 评测文件URL
  testValidateSh: string // 评测执行命令
  timeLimitM: string | number // 评测时长限制（分钟）
  scoreRule: number // 系统评分规则：1-通过全部测试集 2-通过部分测试集
  evaluationSetting: number // 1-通过所有代码块评测 2-通过指定代码块评测
  testSets: TestSet[]
}

interface TestSet {
  id: number
  arg: string
  answer: string
  select: number
}

const evaluationData = ref<EvaluationData>({
  openTestValidate: 1,
  testValidateFiles: '',
  testValidateSh: '',
  timeLimitM: '',
  scoreRule: 1,
  evaluationSetting: 1, // 默认通过所有代码块评测
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
    arg: '',
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

// 处理评测文件选择（从代码仓库）
const handleTestValidateFilesSelect = (selectedFiles: any[]) => {
  testValidateFileList.value = selectedFiles.map((file: any) => ({
    uid: file.uid,
    name: file.name,
    status: 'done',
    url: file.path, // 使用文件路径作为url
  }))
  
  // 将选中的文件路径拼接成字符串
  const filePaths = selectedFiles.map((file: any) => file.path).join(',')
  evaluationData.value.testValidateFiles = filePaths
  
  message.success(`已选择 ${selectedFiles.length} 个文件`)
  showTestValidateFileSelectModal.value = false
}

// 选中的实验环境
const selectedEnvironment = ref('')

// 环境搜索关键词
const environmentSearchKeyword = ref('')

// 过滤后的环境列表
const filteredEnvironmentList = computed(() => {
  if (!environmentSearchKeyword.value) {
    return environmentOptions.value
  }
  return environmentOptions.value.filter(env => 
    env.label.toLowerCase().includes(environmentSearchKeyword.value.toLowerCase())
  )
})

// 获取选中环境的名称
const selectedEnvironmentLabel = computed(() => {
  const selectedEnv = environmentOptions.value.find(env => env.value === selectedEnvironment.value)
  return selectedEnv ? selectedEnv.label : '未选择'
})

// 实验环境配置
interface EnvironmentConfig {
  dockerImage: string
  secondType: string
  timeLimitM: string | number
}

const environmentConfig = ref<EnvironmentConfig>({
  dockerImage: '',
  secondType: 'Css',
  timeLimitM: '',
})

// 选择实验环境
const handleSelectEnvironment = (envValue: string) => {
  selectedEnvironment.value = envValue
  environmentConfig.value.dockerImage = envValue
  // 同步到第一步的实验环境选择
  if (formData.value.environment !== envValue) {
    formData.value.environment = envValue
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
    
    // 同步第一步选择的实验环境到第四步
    if (detail.environment) {
      await nextTick()
      selectedEnvironment.value = String(detail.environment)
      environmentConfig.value.dockerImage = String(detail.environment)
      console.log('同步环境到第四步:', {
        environment: detail.environment,
        selectedEnvironment: selectedEnvironment.value,
        environmentOptions: environmentOptions.value
      })
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
          testValidateSh: task.testValidateSh || '',
          timeLimitM: task.timeLimitM || '',
          scoreRule: task.scoreRule || 1,
          evaluationSetting: task.evaluationSetting || 1,
          testSets: [],
        }
        
        // 解析测试集
        if (task.testContent) {
          try {
            const testContent = JSON.parse(task.testContent)
            evaluationData.value.testSets = testContent.map((item: any, index: number) => ({
              id: index + 1,
              arg: item.arg || '',
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
            { id: 1, arg: '', answer: '', select: 1 },
            { id: 2, arg: '', answer: '', select: 1 },
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
        
        // 填充实验环境配置（不再从任务中读取 dockerImage，因为应该从项目详情中读取）
        // 只填充其他配置项
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

// 请求仓库文件
const fetchRepositoryFiles = async () => {
  try {
    const loadingMsg = message.loading('正在查询仓库文件...', 0)
    
    // 调用API获取文件列表
    const fileList = await getGitFileListApi(formData.value.gitUrl, '')
    
    // 加载文件树
    loadRemoteFileTree(fileList)
    
    // 清空已加载文件夹记录
    loadedFolderKeys.value.clear()
    
    loadingMsg()
    message.success('仓库文件查询成功')
    console.log('查询仓库地址：', formData.value.gitUrl)
    console.log('获取到的文件列表：', fileList)
  } catch (error: any) {
    message.error(error.message || '仓库文件查询失败')
    console.error('仓库文件查询失败：', error)
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

// 监听第一步实验环境的变化，同步到第四步
watch(() => formData.value.environment, (newEnvironment) => {
  console.log('formData.environment 变化:', newEnvironment, '当前 selectedEnvironment:', selectedEnvironment.value)
  if (newEnvironment && String(newEnvironment) !== selectedEnvironment.value) {
    selectedEnvironment.value = String(newEnvironment)
    environmentConfig.value.dockerImage = String(newEnvironment)
    console.log('已同步到第四步:', selectedEnvironment.value)
  }
})

// 监听 selectedEnvironment 的变化
watch(() => selectedEnvironment.value, (newValue) => {
  console.log('selectedEnvironment 变化为:', newValue)
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

// 处理文件树展开事件
const handleTreeExpand = async (_expandedKeys: (string | number)[], info: any) => {
  const { expanded, node } = info
  
  // 只处理展开事件，且是文件夹节点
  if (expanded && !node.isLeaf) {
    const nodeKey = String(node.key)
    
    // 如果该文件夹已经加载过，则不再重复加载
    if (loadedFolderKeys.value.has(nodeKey)) {
      console.log('文件夹已加载，跳过：', nodeKey)
      return
    }
    
    try {
      // 获取该节点的路径
      const nodePath = getNodePathFromMap(nodeKey)
      console.log('加载文件夹：', nodePath, '节点key:', nodeKey)
      
      const loadingMsg = message.loading(`正在加载 ${node.title}...`, 0)
      
      // 调用API获取子文件列表
      const fileList = await getGitFileListApi(formData.value.gitUrl, nodePath)
      
      // 加载子文件到树中
      loadChildrenData(nodeKey, fileList)
      
      // 标记该文件夹已加载
      loadedFolderKeys.value.add(nodeKey)
      
      loadingMsg()
      console.log('文件夹加载成功：', nodePath, fileList)
    } catch (error: any) {
      message.error(error.message || '加载文件夹失败')
      console.error('加载文件夹失败：', error)
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
      triggerFileUpload('/')
      break
  }
}

// 处理树节点菜单点击
const handleTreeNodeMenuClick = (info: any, nodeData: any) => {
  const menuKey = String(info.key)
  // 优先使用路径映射，如果没有则使用遍历方式
  const nodePath = getNodePathFromMap(nodeData.key) || getNodePath(nodeData.key)

  switch (menuKey) {
    case 'newFile':
      handleNewFile(nodePath)
      break
    case 'newFolder':
      handleNewFolder(nodePath)
      break
    case 'upload':
      triggerFileUpload(nodePath)
      break
    case 'rename':
      handleRenameNode(nodeData)
      break
    case 'copyPath':
      handleCopyPath(nodeData)
      break
    case 'delete':
      handleDeleteWithApi(nodeData)
      break
  }
}

// 触发文件选择
const triggerFileUpload = (path: string) => {
  currentUploadPath.value = path
  fileUploadInput.value?.click()
}

// 处理文件选择
const handleFileUploadChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    // 计算上传路径：如果在根目录，path为空；否则去掉前缀斜杠
    let uploadPath = currentUploadPath.value === '/' ? '' : currentUploadPath.value.replace(/^\//, '')
    
    const loadingMsg = message.loading(`正在上传 ${file.name}...`, 0)
    
    // 调用API上传文件到Git仓库
    await uploadFileToGitApi(file, formData.value.gitUrl, uploadPath)
    
    // 读取文件内容并添加到本地文件树（用于预览）
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      addFileToTree(file.name, content, currentUploadPath.value)
    }
    reader.readAsText(file)
    
    loadingMsg()
    message.success(`文件 ${file.name} 上传成功`)
    console.log('文件上传成功：', { fileName: file.name, path: uploadPath })
  } catch (error: any) {
    message.error(error.message || '文件上传失败')
    console.error('文件上传失败：', error)
  } finally {
    // 清空文件选择器，允许重复上传同一文件
    if (target) {
      target.value = ''
    }
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
  commitMessage: string
}

const handleConfirmNewFile = async (newFileData: NewFileForm) => {
  try {
    // 计算文件路径：如果在根目录，path为空；否则去掉前缀斜杠
    let filePath = currentParentPath.value === '/' ? '' : currentParentPath.value.replace(/^\//, '')
    
    const loadingMsg = message.loading('正在保存文件...', 0)
    
    // 调用API保存文件
    await saveGitFileContentApi({
      fileContent: newFileData.fileContent,
      fileName: newFileData.fileName,
      gitUrl: formData.value.gitUrl, // 从主表单获取仓库地址
      path: filePath,
      commit: newFileData.commitMessage,
    })
    
    // 添加到本地文件树
    addFileToTree(newFileData.fileName, newFileData.fileContent, currentParentPath.value)
    
    loadingMsg()
    message.success('文件创建成功')
    showNewFileModal.value = false
    
    console.log('文件保存成功：', { fileName: newFileData.fileName, path: filePath })
  } catch (error: any) {
    message.error(error.message || '文件创建失败')
    console.error('文件创建失败：', error)
  }
}

// 打开新建文件夹弹窗
const handleNewFolder = (parentPath: string = '/') => {
  showNewFolderModal.value = true
  currentFolderParentPath.value = parentPath
}

// 确认新建文件夹
interface NewFolderForm {
  folderName: string
  commitMessage: string
}

const handleConfirmNewFolder = async (newFolderData: NewFolderForm) => {
  try {
    // 计算文件夹路径：如果在根目录，path为文件夹名；否则拼接路径
    let folderPath = currentFolderParentPath.value === '/' 
      ? newFolderData.folderName 
      : `${currentFolderParentPath.value.replace(/^\//, '')}/${newFolderData.folderName}`
    
    const loadingMsg = message.loading('正在创建文件夹...', 0)
    
    // 调用API创建文件夹
    await createGitDirApi({
      commit: newFolderData.commitMessage,
      gitUrl: formData.value.gitUrl,
      path: folderPath,
    })
    
    // 添加到本地文件树
    addFolderToTree(newFolderData.folderName, currentFolderParentPath.value)
    
    loadingMsg()
    message.success('文件夹创建成功')
    showNewFolderModal.value = false
    
    console.log('文件夹创建成功：', { folderName: newFolderData.folderName, path: folderPath })
  } catch (error: any) {
    message.error(error.message || '文件夹创建失败')
    console.error('文件夹创建失败：', error)
  }
}

// 从文件树中删除节点（不显示确认对话框）
const removeNodeFromTree = (nodeKey: string) => {
  const deleteNode = (nodes: any[]): boolean => {
    const index = nodes.findIndex((node: any) => node.key === nodeKey)
    if (index !== -1) {
      nodes.splice(index, 1)
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
}

// 删除文件/文件夹（调用API）
const handleDeleteWithApi = async (nodeData: any) => {
  const isFolder = nodeData.children !== undefined || nodeData.isLeaf === false
  const fileName = nodeData.title
  
  // 获取节点路径
  const fullPath = getNodePathFromMap(nodeData.key) || getNodePath(nodeData.key)
  
  // 计算 path 参数（去除文件名，只保留父路径）
  const pathParts = fullPath.split('/')
  pathParts.pop() // 移除最后一个元素（文件/文件夹名）
  const path = pathParts.join('/') || '' // 如果是根目录，则为空字符串
  
  const { Modal } = await import('ant-design-vue')
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除${isFolder ? '文件夹' : '文件'} "${fileName}" 吗？${isFolder ? '文件夹下的所有内容也会被删除。' : ''}`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      let loadingMsg: any = null
      try {
        loadingMsg = message.loading('正在删除...', 0)
        
        // 调用API删除文件/文件夹
        await deleteGitFileApi({
          fileName: fileName,
          gitUrl: formData.value.gitUrl,
          path: path,
        })
        
        // API删除成功后，从本地树中移除节点
        removeNodeFromTree(nodeData.key)
        
        loadingMsg()
        message.success('删除成功')
        console.log('删除成功：', { fileName, path })
      } catch (error: any) {
        if (loadingMsg) loadingMsg() // 确保关闭 loading 提示
        message.error(error.message || '删除失败')
        console.error('删除失败：', error)
      }
    },
  })
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
const handleBack = async () => {
  if (currentStep.value > 0) {
    currentStep.value--
    scrollToTop()
    
    // 如果返回到第二步（代码仓库），且有仓库地址且文件树为空，自动加载文件树
    if (currentStep.value === 1 && formData.value.gitUrl && formData.value.enableCodeRepository && fileTreeData.value.length === 0) {
      await fetchRepositoryFiles()
    }
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
      
      // 如果有仓库地址且文件树为空，自动加载文件树
      if (formData.value.gitUrl && formData.value.enableCodeRepository && fileTreeData.value.length === 0) {
        await fetchRepositoryFiles()
      }
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
    // 第三步：评测设置，自动保存评测设置和参考答案
    try {
      await handleSaveEvaluation()
    } catch (error) {
      // 错误已经在 handleSaveEvaluation 中显示过了，这里直接返回
      return
    }
    
    try {
      await handleSaveReferenceAnswer()
    } catch (error) {
      // 错误已经在 handleSaveReferenceAnswer 中显示过了，这里直接返回
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
  // 验证是否有任务ID
  if (!taskId.value) {
    message.error('任务ID不存在，请重新创建任务')
    throw new Error('任务ID不存在')
  }
  
  // 如果启用了评测功能，进行非空校验
  if (evaluationData.value.openTestValidate === 1) {
    // 校验评测文件
    if (!evaluationData.value.testValidateFiles || evaluationData.value.testValidateFiles.trim() === '') {
      message.error('请上传评测文件')
      throw new Error('请上传评测文件')
    }
    
    // 校验评测执行命令
    if (!evaluationData.value.testValidateSh || evaluationData.value.testValidateSh.trim() === '') {
      message.error('请输入评测执行命令')
      throw new Error('请输入评测执行命令')
    }
    
    // 校验评测时长限制
    if (!evaluationData.value.timeLimitM) {
      message.error('请输入评测时长限制')
      throw new Error('请输入评测时长限制')
    }
    
    // 校验测试集
    if (!evaluationData.value.testSets || evaluationData.value.testSets.length === 0) {
      message.error('请至少添加一个测试集')
      throw new Error('请至少添加一个测试集')
    }
    
    // 校验是否至少有一个测试集被选中
    const selectedTestSets = evaluationData.value.testSets.filter(item => item.select === 1)
    if (selectedTestSets.length === 0) {
      message.error('请至少选中一个测试集')
      throw new Error('请至少选中一个测试集')
    }
    
    // 校验选中的测试集是否填写了输入内容和期望输出
    for (let i = 0; i < selectedTestSets.length; i++) {
      const testSet = selectedTestSets[i]
      if (!testSet.arg || testSet.arg.trim() === '') {
        message.error(`测试集${i + 1}的输入内容不能为空`)
        throw new Error(`测试集${i + 1}的输入内容不能为空`)
      }
      if (!testSet.answer || testSet.answer.trim() === '') {
        message.error(`测试集${i + 1}的期望输出不能为空`)
        throw new Error(`测试集${i + 1}的期望输出不能为空`)
      }
    }
  }
  
  // 准备测试集数据
  const testContentArray = evaluationData.value.testSets.map(item => ({
    arg: item.arg,
    answer: item.answer,
    select: item.select,
  }))
  
  // 更新任务数据
  const taskUpdateData: any = {
    taskId: taskId.value,
    projectId: projectId.value,
    openTestValidate: evaluationData.value.openTestValidate,
    testValidateFiles: evaluationData.value.testValidateFiles,
    testValidateSh: evaluationData.value.testValidateSh,
    timeLimitM: evaluationData.value.timeLimitM,
    scoreRule: evaluationData.value.scoreRule,
    evaluationSetting: evaluationData.value.evaluationSetting,
    testContent: JSON.stringify(testContentArray),
  }
  
  try {
    // 调用更新任务接口
    await updateProjectTaskApi(taskUpdateData as any)
    evaluationSaved.value = true
    // message.success('评测设置保存成功！')
  } catch (error) {
    message.error('评测设置保存失败，请重试')
    throw error
  }
}

// 保存参考答案
const handleSaveReferenceAnswer = async () => {
  // 验证是否有任务ID
  if (!taskId.value) {
    message.error('任务ID不存在，请重新创建任务')
    throw new Error('任务ID不存在')
  }
  
  // 校验参考答案内容是否为空
  if (!referenceAnswerData.value.referenceAnswer || referenceAnswerData.value.referenceAnswer.trim() === '') {
    message.error('请输入参考答案内容')
    throw new Error('请输入参考答案内容')
  }
  
  // 去除HTML标签后检查是否有实际内容
  const textContent = referenceAnswerData.value.referenceAnswer.replace(/<[^>]*>/g, '').trim()
  if (!textContent) {
    message.error('请输入参考答案内容')
    throw new Error('请输入参考答案内容')
  }
  
  // 更新任务数据
  const taskUpdateData: any = {
    taskId: taskId.value,
    projectId: projectId.value,
    showAnswer: referenceAnswerData.value.showAnswer,
    prohibitCopyAnswer: referenceAnswerData.value.prohibitCopyAnswer,
    referenceAnswer: referenceAnswerData.value.referenceAnswer,
  }
  
  try {
    // 调用更新任务接口
    await updateProjectTaskApi(taskUpdateData as any)
    referenceAnswerSaved.value = true
    // message.success('参考答案保存成功！')
  } catch (error) {
    message.error('参考答案保存失败，请重试')
    throw error
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
  // 加载领域类别字典、难度字典和小类别字典
  fieldCategory.load()
  difficulty.load()
  subcategory.load()
  
  // 从路由参数获取项目ID
  const id = route.query.id
  if (id) {
    projectId.value = Number(id)
    // 先加载环境选项
    await loadEnvironmentOptions()
    // 再获取项目详情
    await fetchProjectDetail()
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
                      :options="fieldCategory.options.value"
                      :loading="fieldCategory.loading.value" 
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="难度" name="difficulty" required>
                <a-radio-group v-model:value="formData.difficulty" class="custom-radio">
                  <a-radio 
                    v-for="item in difficulty.data.value" 
                    :key="item.value" 
                    :value="Number(item.value)"
                  >
                    {{ item.name }}
                  </a-radio>
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
                      :options="subcategory.options.value"
                      :loading="subcategory.loading.value"
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
                  @expand="handleTreeExpand"
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
                  :dynamic-file-contents="dynamicFileContents"
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
                          <!-- 未开启代码仓库：上传文件 -->
                          <template v-if="!formData.enableCodeRepository">
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
                          </template>
                          
                          <!-- 已开启代码仓库：从仓库选择文件 -->
                          <template v-else>
                            <div class="file-select-wrapper">
                              <a-button type="primary" @click="showTestValidateFileSelectModal = true">点击选择</a-button>
                              <div class="selected-files-list">
                                <a-tag 
                                  v-for="file in testValidateFileList" 
                                  :key="file.uid"
                                  closable
                                  @close="() => {
                                    testValidateFileList = testValidateFileList.filter(f => f.uid !== file.uid)
                                    evaluationData.testValidateFiles = testValidateFileList.map(f => f.url).join(',')
                                  }"
                                  style="margin: 4px;"
                                >
                                  {{ file.name }}
                                </a-tag>
                              </div>
                            </div>
                            <div class="upload-hint">
                              说明：从代码仓库中选择文件。（点击评测按钮时调用的文件，用于检验学员任务结果是否正确）
                            </div>
                          </template>
                        </a-form-item>

                        <a-form-item label="评测执行命令" required>
                          <a-input 
                            v-model:value="evaluationData.testValidateSh"
                            placeholder="请输入评测执行命令，例如：python main.py" 
                          />
                          <div class="upload-hint">
                            （执行评测文件的命令，如：python main.py、node index.js、java Main 等）
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
                            <a-radio :value="1">
                              通过所有代码块评测（对学员任务文件的所有非空代码块进行评测）
                            </a-radio>
                            <a-radio :value="2">
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
                        v-model:value="testSet.arg" 
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
                    :key="env.value"
                    class="environment-item"
                    :class="{ active: selectedEnvironment === env.value }"
                    @click="handleSelectEnvironment(env.value)"
                  >
                    {{ env.label }}
                  </div>
                </div>
              </div>

              <!-- 右侧：环境配置 -->
              <div class="environment-right">
                <div class="environment-config-header">
                  实验环境: {{ selectedEnvironmentLabel }}
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
                      :options="subcategory.options.value"
                      :loading="subcategory.loading.value"
                    />
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

    <!-- 隐藏的文件上传选择器 -->
    <input 
      ref="fileUploadInput" 
      type="file" 
      style="display: none" 
      @change="handleFileUploadChange"
    />

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
    
    <!-- 评测文件选择器 -->
    <FileSelectModal 
      v-model:open="showTestValidateFileSelectModal" 
      title="选择评测文件"
      :git-url="formData.gitUrl"
      @confirm="handleTestValidateFilesSelect" 
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
    overflow-x: hidden;
    max-width: 100%;

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
      max-width: 100%;
      overflow-x: hidden;

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
      
      .file-select-wrapper {
        .selected-files-list {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 32px;
          padding: 8px;
          background: #fafafa;
          border-radius: 4px;
          border: 1px dashed #d9d9d9;
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

