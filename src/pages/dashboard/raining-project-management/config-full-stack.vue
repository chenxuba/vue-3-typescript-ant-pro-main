<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined, DeleteOutlined, EditOutlined, HolderOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { uploadFileApi, getGitFileListApi, saveGitFileContentApi, uploadFileToGitApi, createGitDirApi, deleteGitFileApi } from '@/api/common/file'
import { createProjectApi, updateProjectApi, updateProjectEnvironmentApi } from '@/api/project'
import { useFieldCategoryDictionary, useDifficultyDictionary, useCollateralEnvironmentDictionary, useProgrammingLanguageDictionary } from '@/composables/dictionary'
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
import FileSelectModal from './components/FileSelectModal.vue'

// Composables
import { useFileTree } from './composables/useFileTree'
import { useTaskLevel } from './composables/useTaskLevel'

// Types
import type { FormData, NewFileForm, NewFolderForm, ExperimentEnvironmentForm, Question } from './types'

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

// 项目ID
const projectId = ref<number | null>(null)

// 表单引用
const formRef = ref<FormInstance>()
const trainingScopeFormRef = ref<FormInstance>()
const experimentFormRef = ref<FormInstance>()

// 表单数据
const formData = ref<FormData>({
  name: '',
  tag: '',
  fieldType: undefined,
  difficulty: 1,
  classHour: '',
  topCover: '',
  cover: '',
  description: '',
  showTaskRequire: false,
  authType: 1,
  enableCodeRepository: false,
  repositoryType: '代码仓库',
  gitUrl: '',
  environment: undefined,
})

// 图片上传相关
const topCoverUrl = ref<string>('')
const coverUrl = ref<string>('')
const uploadingTopCover = ref(false)
const uploadingCover = ref(false)
const imageUrlPrefix = 'http://101.200.13.193'

// AI润色相关
// const aiEmbellishLoading = ref(false)

// 实验环境相关
const selectedEnvironment = ref<number | undefined>(undefined)

// 获取实验环境名称
const getEnvironmentName = () => {
  const environmentMap: Record<number, string> = {
    1: 'Python3.6',
    2: 'Python3.13',
    3: 'Python3.12/VNC',
  }
  return environmentMap[selectedEnvironment.value || 1] || 'Python3.6'
}

// 从路由接收数据并填充表单
onMounted(() => {
  // 加载领域类别字典、难度字典、附带环境字典和编程语言字典
  fieldCategory.load()
  difficulty.load()
  collateralEnvironment.load()
  programmingLanguage.load()
  
  const routeData = history.state as any
  console.log('接收到的路由数据:', routeData)

  if (routeData && routeData.name) {
    // 填充基础信息
    formData.value.name = routeData.name || ''
    formData.value.description = routeData.description || ''
    formData.value.difficulty = routeData.difficulty || 1
    formData.value.classHour = routeData.classHour || ''
    formData.value.showTaskRequire = routeData.showTaskRequire || false
    // 保存实验环境
    selectedEnvironment.value = routeData.environment || 1

    console.log('已自动填充表单数据:', {
      name: formData.value.name,
      description: formData.value.description,
      descriptionLength: formData.value.description?.length || 0,
      difficulty: formData.value.difficulty,
      classHour: formData.value.classHour,
      showTaskRequire: formData.value.showTaskRequire,
      environment: selectedEnvironment.value
    })
  } else {
    console.log('未接收到路由数据')
    // 如果没有路由数据，默认使用 Python3.6
    selectedEnvironment.value = 1
  }

  // 初始化实验环境（使用接收到的 environment 值）
  initializeExperimentEnvironments()
})

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

// 使用领域类别字典
const fieldCategory = useFieldCategoryDictionary()

// 使用难度字典
const difficulty = useDifficultyDictionary()

// 使用附带环境字典
const collateralEnvironment = useCollateralEnvironmentDictionary()

// 使用编程语言字典
const programmingLanguage = useProgrammingLanguageDictionary()

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

// 实验环境列表
interface ExperimentEnvironment {
  id: string
  name: string
  isEditing: boolean
  isSaved: boolean // 标记是否已保存
  config: ExperimentEnvironmentForm
}

const experimentEnvironments = ref<ExperimentEnvironment[]>([])

// 初始化实验环境（需要在获取到 selectedEnvironment 后）
const initializeExperimentEnvironments = () => {
  if (experimentEnvironments.value.length === 0) {
    experimentEnvironments.value = [{
      id: '1',
      name: '实验环境1',
      isEditing: false,
      isSaved: false,
      config: {
        dockerImage: selectedEnvironment.value || 1,
        viewTypes: [],
        secondType: undefined,
        taskId: undefined,
        codeType: undefined,
        shellBegin: undefined,
        containerPort: undefined,
        containerPath: undefined,
      }
    }]
  }
}

const activeEnvironmentKey = ref('1')
const editingEnvironmentName = ref('')

// 实验环境验证规则
const experimentFormRules: Record<string, Rule[]> = {
  dockerImage: [
    { required: true, message: '请选择实验镜像', trigger: 'change' },
  ],
  viewTypes: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个实验界面', trigger: 'change' },
  ],
  secondType: [
    { required: true, message: '请选择附带环境', trigger: 'change' },
  ],
  taskId: [
    { required: true, message: '请选择任务关卡', trigger: 'change' },
  ],
  codeType: [
    { required: true, message: '请选择编程语言', trigger: 'change' },
  ],
  shellBegin: [
    { required: true, message: '请输入开启时触发命令', trigger: 'blur' },
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

// 使用任务关卡composable
const {
  taskLevels,
  selectedTaskLevelId,
  currentTab,
  taskLevelFormRef,
  evaluationFormRef,
  taskLevelFormData,
  evaluationFormData,
  learningResourceFileList,
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
  handleLearningResourceCustomRequest,
  handleLearningResourceUpload,
  handleUserFilesSelect,
  handleTestValidateFilesSelect,
  userFileList,
  testValidateFileList,
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
  loadQuestions,
  saveQuestionsOrder,
} = useTaskLevel(projectId)

// 弹窗状态
const showRepositoryModal = ref(false)
const showNewFileModal = ref(false)
const showNewFolderModal = ref(false)
const showQuestionModal = ref(false)
const showUserFileSelectModal = ref(false) // 学员任务文件选择器
const showTestValidateFileSelectModal = ref(false) // 评测执行文件选择器
const currentEditingQuestion = ref<any>(null) // 当前编辑的题目
const currentParentPath = ref('/')
const currentFolderParentPath = ref('/')

// 文件上传相关
const fileUploadInput = ref<HTMLInputElement | null>(null)
const currentUploadPath = ref('/')

// 文件上传处理
const handleBackgroundUpload = async (file: File) => {
  // 验证文件大小
  const isLt12M = file.size / 1024 / 1024 < 12
  if (!isLt12M) {
    message.error('图片大小不能超过 12MB!')
    return false
  }

  // 验证文件类型
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }

  try {
    uploadingTopCover.value = true
    const fileUrl = await uploadFileApi(file)
    topCoverUrl.value = imageUrlPrefix + fileUrl // 用于显示，加前缀
    formData.value.topCover = fileUrl // 保存原始路径，不加前缀
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
  // 验证文件大小
  const isLt12M = file.size / 1024 / 1024 < 12
  if (!isLt12M) {
    message.error('图片大小不能超过 12MB!')
    return false
  }

  // 验证文件类型
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }

  try {
    uploadingCover.value = true
    const fileUrl = await uploadFileApi(file)
    coverUrl.value = imageUrlPrefix + fileUrl // 用于显示，加前缀
    formData.value.cover = fileUrl // 保存原始路径，不加前缀
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

// 确认开启代码库
const handleConfirmRepository = async () => {
  // 校验是否有仓库地址
  if (!formData.value.gitUrl || !formData.value.gitUrl.trim()) {
    message.error('请先配置仓库地址')
    handleCancelRepository()
    return
  }
  
  formData.value.enableCodeRepository = true
  showRepositoryModal.value = false
  
  // 锁定仓库地址输入框
  isRepositoryUrlLocked.value = true
  
  // 请求接口查询仓库文件（目前模拟）
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
    // 选择切换仓库时，解锁仓库地址输入框
    isRepositoryUrlLocked.value = false
    message.info('已解锁仓库地址，请重新输入')
    
    // 自动切换回代码仓库选项
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
      // 重新锁定并请求文件
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
      // currentStep.value = 1
      scrollToTop()
    }
  } else if (currentStep.value === 1) {
    // 第二步：代码仓库验证并创建项目
    if (formData.value.enableCodeRepository) {
      // 如果开启了代码仓库，验证仓库地址
      if (!formData.value.gitUrl || formData.value.gitUrl.trim() === '') {
        message.error('请输入仓库地址')
        return
      }
    }
    // 提交创建项目
    await handleCreateProject()
  } else if (currentStep.value === 2) {
    // 第三步：任务关卡验证
    // 检查是否有关卡
    if (taskLevels.value.length === 0) {
      message.error('请至少添加一个任务关卡')
      return
    }
    // 检查是否所有关卡都已保存
    const hasUnsavedLevel = taskLevels.value.some(level => !level.taskId)
    if (hasUnsavedLevel) {
      message.error('请先保存所有任务关卡后再进行下一步')
      return
    }
    // 检查所有选择题任务是否都有题目
    const choiceLevelWithoutQuestions = taskLevels.value.find(level =>
      level.type === 'choice' &&
      level.taskId &&
      (!level.questions || level.questions.length === 0)
    )
    if (choiceLevelWithoutQuestions) {
      message.warning('请至少新增一条题目')
      // 选中该关卡并切换到题目标签页
      selectTaskLevel(choiceLevelWithoutQuestions.id)
      currentTab.value = 'questions'
      return
    }
    // 检查所有编程任务是否都配置了评测设置
    const programmingLevelWithoutEvaluation = taskLevels.value.find(level => {
      if (level.type !== 'programming' || !level.taskId || !level.evaluationSettings) {
        return false
      }
      // 如果用例类型为文本（1），必须有至少一条测试集
      if (level.evaluationSettings.testValidateType === 1) {
        return !level.evaluationSettings.testContent || level.evaluationSettings.testContent.length === 0
      }
      return false
    })
    if (programmingLevelWithoutEvaluation) {
      message.warning('用例类型为文本时，必须至少创建一条测试集')
      // 选中该关卡并切换到评测设置标签页
      selectTaskLevel(programmingLevelWithoutEvaluation.id)
      currentTab.value = 'evaluation'
      return
    }
    currentStep.value = 3
    scrollToTop()
  }
}

// 创建或更新项目
const handleCreateProject = async () => {
  try {
    // 准备提交的数据
    const submitData: any = {
      projectType: 1,//全栈环境实训项目
      environment: selectedEnvironment.value,
      name: formData.value.name,
      tag: formData.value.tag,
      fieldType: formData.value.fieldType,
      difficulty: formData.value.difficulty,
      classHour: formData.value.classHour,
      topCover: formData.value.topCover,
      cover: formData.value.cover,
      description: formData.value.description,
      showTaskRequire: formData.value.showTaskRequire ? 1 : 2, // 转换为 1 或 2
      authType: formData.value.authType,
      enableCodeRepository: formData.value.enableCodeRepository,
    }

    // 如果开启了代码仓库，才传递仓库相关信息
    if (formData.value.enableCodeRepository) {
      submitData.repositoryType = formData.value.repositoryType
      submitData.gitUrl = formData.value.gitUrl
    }

    console.log('提交项目数据：', submitData)

    let response
    // 判断是创建还是更新
    if (projectId.value) {
      // 如果已有 projectId，调用更新接口
      submitData.id = projectId.value
      response = await updateProjectApi(submitData)
      message.success('项目更新成功！')
      console.log('更新成功：', response)
    } else {
      // 如果没有 projectId，调用创建接口
      response = await createProjectApi(submitData)

      // 保存项目ID
      if (response && response.id) {
        projectId.value = response.id
        console.log('项目ID已保存：', projectId.value)
      }

      message.success('项目创建成功！')
      console.log('创建成功：', response)
    }

    // 跳转到下一步
    currentStep.value = 2
    scrollToTop()
  } catch (error) {
    console.error('操作失败：', error)
    message.error(projectId.value ? '项目更新失败，请稍后重试' : '项目创建失败，请稍后重试')
  }
}

// 保存单个实验环境
const saveEnvironment = async (env: ExperimentEnvironment, envisDel: number = 0) => {
  try {
    // 如果是删除操作，跳过表单验证
    if (envisDel !== 1) {
      // 根据选中的 viewTypes 清除隐藏字段的校验
      const fieldsToValidate: string[] = ['dockerImage', 'viewTypes', 'secondType', 'taskId']
      const fieldsToClear: string[] = []

      // 判断哪些字段需要校验，哪些需要清除
      if (env.config.viewTypes.includes(1)) {
        // 选中了代码编辑器，需要校验编程语言
        fieldsToValidate.push('codeType')
      } else {
        fieldsToClear.push('codeType')
      }

      if (env.config.viewTypes.includes(2)) {
        // 选中了命令行终端，需要校验开启时触发命令
        fieldsToValidate.push('shellBegin')
      } else {
        fieldsToClear.push('shellBegin')
      }

      if (env.config.viewTypes.includes(3)) {
        // 选中了容器内服务，需要校验容器端口
        fieldsToValidate.push('containerPort')
      } else {
        fieldsToClear.push('containerPort')
      }

      // 清除隐藏字段的校验错误
      if (fieldsToClear.length > 0) {
        experimentFormRef.value?.clearValidate(fieldsToClear)
      }

      // 只验证需要的字段
      await experimentFormRef.value?.validate(fieldsToValidate)
    }

    // 调用更新接口，传递实验环境参数
    if (!projectId.value) {
      message.error('项目ID不存在，无法保存')
      return
    }

    const updateData = {
      title: env.name,
      dockerImage: env.config.dockerImage,
      viewTypes: env.config.viewTypes.join(','), // 数组转为逗号隔开的字符串
      secondType: env.config.secondType,
      taskId: env.config.taskId ? Number(env.config.taskId) : undefined,
      codeType: env.config.codeType,
      shellBegin: env.config.shellBegin,
      containerPort: env.config.containerPort,
      containerPath: env.config.containerPath,
      projectId: projectId.value,
      envisDel: envisDel, // 是否删除：0-保存/更新 1-删除
    }

    console.log('保存实验环境数据：', updateData)

    // 调用后端API更新实验环境
    await updateProjectEnvironmentApi(updateData)

    // 标记为已保存
    if (envisDel !== 1) {
      env.isSaved = true
      message.success('实验环境保存成功！')
    } else {
      message.success('删除成功！')
    }
  } catch (error) {
    console.error('保存失败：', error)
    message.error(envisDel === 1 ? '删除失败' : '请完善必填信息')
  }
}

// 完成项目创建
const completeProject = async () => {
  // 校验每个实验环境是否都已保存
  const unsavedEnvironments = experimentEnvironments.value.filter(env => !env.isSaved)

  if (unsavedEnvironments.length > 0) {
    message.error('请先保存实验环境配置')
    return
  }

  // 校验是否有项目ID
  if (!projectId.value) {
    message.error('项目ID不存在，请先创建项目')
    return
  }

  try {
    // 调用更新接口，将状态设置为10（已完成）
    await updateProjectApi({
      id: projectId.value,
      status: 10, // 设置状态为10（已完成）
    } as any)
    
    message.success('项目创建成功！')

    // 延迟返回列表页，让用户看到成功提示
    setTimeout(() => {
      router.push('/dashboard/analysis')
    }, 500)
  } catch (error: any) {
    console.error('项目发布失败：', error)
    message.error(error.message || '项目发布失败')
  }
}

// 任务要求内容变化处理
const handleTaskRequirementChange = (value: string) => {
  // 去除HTML标签后检查是否有内容
  const textContent = value.replace(/<[^>]*>/g, '').trim()
  if (textContent) {
    taskLevelFormRef.value?.clearValidate(['require'])
  }
}

// 参考答案内容变化处理
const handleReferenceAnswerChange = (value: string) => {
  // 去除HTML标签后检查是否有内容
  const textContent = value.replace(/<[^>]*>/g, '').trim()
  if (textContent) {
    taskLevelFormRef.value?.clearValidate(['referenceAnswer'])
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
const handleConfirmQuestion = async (question: any) => {
  if (currentEditingQuestion.value) {
    // 编辑模式：更新题目
    updateQuestion(question)
  } else {
    // 新增模式：添加题目（由QuestionModal内部调用接口创建）
    addQuestion(question)
  }
  currentEditingQuestion.value = null

  // 刷新题目列表
  if (taskLevelFormData.value.taskId) {
    await loadQuestions(taskLevelFormData.value.taskId)
  }
}

// 解析题目选项
const parseQuestionSelects = (question: Question) => {
  try {
    const selectsArray = JSON.parse(question.selects || '[]')
    return selectsArray.map((item: any) => {
      const key = Object.keys(item)[0]
      return {
        label: key,
        content: item[key]
      }
    })
  } catch (e) {
    return []
  }
}

// 判断是否为正确答案
const isCorrectAnswer = (question: Question, label: string) => {
  return question.answer.includes(label)
}

// 拖拽相关
const draggedIndex = ref<number | null>(null)

const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = async (e: DragEvent, dropIndex: number) => {
  e.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== dropIndex) {
    const questions = [...getCurrentQuestions.value]
    const [draggedItem] = questions.splice(draggedIndex.value, 1)
    questions.splice(dropIndex, 0, draggedItem)

    // 重新分配 weight 值（从1开始）
    questions.forEach((question, index) => {
      question.weight = index + 1
    })

    // 更新题目顺序
    updateQuestionsOrder(questions)

    // 调用接口保存排序
    try {
      console.log('开始保存题目排序...')
      await saveQuestionsOrder(questions)
      message.success('题目顺序已更新')
    } catch (error: any) {
      console.error('保存题目排序失败:', error)
      message.error(error.message || '保存题目排序失败，请重试')
    }
  }
  draggedIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
}

// 实验界面切换
const toggleInterface = (type: number) => {
  const config = currentEnvironmentConfig.value
  if (!config) return

  const index = config.viewTypes.indexOf(type)
  if (index > -1) {
    config.viewTypes.splice(index, 1)
    // 清除对应的条件字段
    if (type === 1) { // 代码编辑器
      config.codeType = undefined
    } else if (type === 2) { // 命令行终端
      config.shellBegin = undefined
    } else if (type === 3) { // 容器内服务
      config.containerPort = undefined
      config.containerPath = undefined
    }
  } else {
    config.viewTypes.push(type)
  }

  // 清除验证错误提示
  nextTick(() => {
    experimentFormRef.value?.clearValidate(['viewTypes'])
  })
}

// 判断任务关卡是否已被其他环境选择
const isTaskLevelSelectedByOther = (currentEnvId: string, taskId: number | string | undefined) => {
  if (!taskId) return false
  
  // 统一转换为数字进行比较
  const taskIdNum = typeof taskId === 'string' ? Number(taskId) : taskId
  
  return experimentEnvironments.value.some(env => {
    if (!env.config.taskId) return false
    const envTaskIdNum = typeof env.config.taskId === 'string' ? Number(env.config.taskId) : env.config.taskId
    return env.id !== currentEnvId && envTaskIdNum === taskIdNum
  })
}

// 添加实验环境
const handleAddEnvironment = () => {
  const newId = String(Date.now())
  const newEnv: ExperimentEnvironment = {
    id: newId,
    name: `实验环境${experimentEnvironments.value.length + 1}`,
    isEditing: false,
    isSaved: false,
    config: {
      dockerImage: selectedEnvironment.value || 1,
      viewTypes: [],
      secondType: undefined,
      taskId: undefined,
      codeType: undefined,
      shellBegin: undefined,
      containerPort: undefined,
      containerPath: undefined,
    }
  }
  experimentEnvironments.value.push(newEnv)
  activeEnvironmentKey.value = newId
  message.success('添加实验环境成功')
}

// 删除实验环境
const handleDeleteEnvironment = async (id: string) => {
  if (experimentEnvironments.value.length === 1) {
    message.warning('至少保留一个实验环境')
    return
  }
  
  const index = experimentEnvironments.value.findIndex(e => e.id === id)
  if (index > -1) {
    const env = experimentEnvironments.value[index]
    
    // 如果环境已保存，先调用更新接口标记删除
    if (env.isSaved) {
      await saveEnvironment(env, 1) // envisDel: 1 表示删除
    }
    
    // 从前端列表中移除
    experimentEnvironments.value.splice(index, 1)
    
    // 如果删除的是当前激活的，切换到第一个
    if (activeEnvironmentKey.value === id) {
      activeEnvironmentKey.value = experimentEnvironments.value[0].id
    }
    
    // 如果未保存，只显示本地删除成功
    if (!env.isSaved) {
      message.success('删除实验环境成功')
    }
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
    // 只有当实验环境已保存时才调用更新接口
    if (env.isSaved) {
      message.success('重命名成功')
      saveEnvironment(env)
    }
  } else {
    message.warning('名称不能为空')
  }
}

// 处理标签页切换
const handleTabChange = async (activeKey: string | number) => {
  const key = String(activeKey)

  // 如果是选择题任务，且要切换到题目标签页
  if (isChoiceTask.value && key === 'questions') {
    // 检查是否已保存
    if (!taskLevelFormData.value.taskId) {
      message.warning('请先保存创建任务后再添加题目')
      // 阻止切换，保持在当前标签页
      return
    }
    // 加载题目列表
    if (taskLevelFormData.value.taskId) {
      await loadQuestions(taskLevelFormData.value.taskId)
    }
  }

  // 如果是编程任务，且要切换到评测设置标签页
  if (isProgrammingTask.value && key === 'evaluation') {
    // 检查是否已保存
    if (!taskLevelFormData.value.taskId) {
      message.warning('请先保存创建任务后再配置评测设置')
      // 阻止切换，保持在当前标签页
      return
    }
  }

  // 允许切换
  currentTab.value = key
}

// 处理测试集选中状态变化
const handleTestCaseSelectChange = (testCase: any, checked: boolean) => {
  testCase.select = checked ? 1 : 2
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
                <a-form-item label="技能标签" name="tag" required :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                  <a-input v-model:value="formData.tag" placeholder="请输入技能标签" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="领域类别" name="fieldType" required :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 12 }">
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

            <a-form-item label="学时" name="classHour">
              <a-input v-model:value="formData.classHour" placeholder="配置任务后自动计算" disabled />
            </a-form-item>

            <a-form-item label="顶部背景图" name="topCover" required>
              <div class="flex items-top gap-16px">
                <div class="flex flex-col gap-12px">
                  <a-upload :before-upload="handleBackgroundUpload" :show-upload-list="false"
                    accept="image/png,image/jpeg">
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
                  <a-upload :before-upload="handleCoverUpload" :show-upload-list="false" accept="image/png,image/jpeg">
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
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <RichTextEditor v-model="formData.description" />
              </div>
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
          <a-form ref="trainingScopeFormRef" :model="formData" :rules="formRules" layout="horizontal"
            :label-col="{ span: 2 }" :wrapper-col="{ span: 18 }">
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
              <FileTreeComponent v-if="formData.enableCodeRepository" :file-tree-data="fileTreeData"
                v-model:expanded-keys="expandedKeys" @select="handleSelectFile" @menu-click="handleTreeNodeMenuClick" 
                @expand="handleTreeExpand" />

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
              <FilePreview v-if="formData.enableCodeRepository" :selected-file="selectedFile"
                :highlighted-code="highlightedCode" :dynamic-file-contents="dynamicFileContents" />
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
              <a-button v-if="formData.enableCodeRepository" type="primary" @click="addTaskLevel('programming')">添加编程任务</a-button>
            </div>
          </div>

          <!-- 主要内容区域 -->
          <div class="task-level-main">
            <!-- 左侧：任务关卡列表 -->
            <div class="task-level-list">
              <div class="list-title">任务关卡 ({{ taskLevels.length }})</div>
              <div class="list-items">
                <div v-for="level in taskLevels" :key="level.id"
                  :class="['list-item', { active: selectedTaskLevelId === level.id }]"
                  @click="selectTaskLevel(level.id)">
                  <span class="item-name">{{ level.name }}</span>
                  <DeleteOutlined class="delete-icon" @click.stop="deleteTaskLevel(level.id)" />
                </div>
              </div>
            </div>

            <!-- 右侧：任务详情 -->
            <div class="task-level-detail">
              <div v-if="selectedTaskLevelId" class="detail-content">
                <a-tabs :activeKey="currentTab" @change="handleTabChange">
                  <!-- 标签栏右侧额外内容 -->
                  <template #tabBarExtraContent v-if="isChoiceTask && currentTab === 'questions'">
                    <a-button type="primary" @click="handleAddQuestion">
                      <PlusOutlined />
                      新增题目
                    </a-button>
                  </template>

                  <!-- 关联任务标签页 -->
                  <a-tab-pane key="task" tab="关联任务">
                    <a-form ref="taskLevelFormRef" :model="taskLevelFormData" :rules="taskLevelFormRules"
                      layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                      <a-form-item label="任务名称" name="name" required>
                        <a-input v-model:value="taskLevelFormData.name" placeholder="请输入任务名称" />
                      </a-form-item>
                      <a-form-item label="学习资源" name="source" required>
                        <a-upload v-model:file-list="learningResourceFileList"
                          :custom-request="handleLearningResourceCustomRequest" @change="handleLearningResourceUpload"
                          accept=".doc,.docx,.pdf,.ppt,.pptx,.mp4" :max-count="10">
                          <a-button type="primary">点击上传</a-button>
                        </a-upload>
                        <div class="upload-hint">
                          说明：支持上传word、pdf、ppt、mp4等格式文件，每个文件大小不能超过500M。
                        </div>
                      </a-form-item>

                      <a-form-item label="任务要求" name="require" required>
                        <RichTextEditor v-model="taskLevelFormData.require" placeholder="请输入任务要求"
                          @change="handleTaskRequirementChange" />
                      </a-form-item>

                      <a-form-item label="参考答案" name="referenceAnswer" required>
                        <RichTextEditor v-model="taskLevelFormData.referenceAnswer" placeholder="请输入参考答案"
                          @change="handleReferenceAnswerChange" />
                      </a-form-item>

                      <a-form-item label="难度系数" name="difficulty" required>
                        <a-radio-group v-model:value="taskLevelFormData.difficulty" class="custom-radio">
                          <a-radio 
                            v-for="item in difficulty.data.value" 
                            :key="item.value" 
                            :value="Number(item.value)"
                          >
                            {{ item.name }}
                          </a-radio>
                        </a-radio-group>
                      </a-form-item>

                      <a-form-item label="技能标签" name="tag" required>
                        <a-input v-model:value="taskLevelFormData.tag" placeholder="请输入技能标签" />
                      </a-form-item>
                      <a-form-item v-if="isKernelTask" label="内嵌链接" name="jumpUrl" required>
                        <a-input v-model:value="taskLevelFormData.jumpUrl" placeholder="请输入内嵌链接" />
                      </a-form-item>

                      <a-form-item label="任务学时" name="classHour" required>
                        <a-input-number style="width:100%;" :min="0" v-model:value="taskLevelFormData.classHour"
                          placeholder="请输入任务学时" />
                      </a-form-item>


                    </a-form>
                  </a-tab-pane>

                  <!-- 题目标签页（选择题任务） -->
                  <a-tab-pane key="questions" tab="题目" v-if="isChoiceTask">
                    <div v-if="getCurrentQuestions.length === 0" class="questions-content">
                      <a-empty description="暂无题目，请点击右上方按钮新增题目" />
                    </div>
                    <div v-else class="questions-list">
                      <div v-for="(question, index) in getCurrentQuestions" :key="question.id" class="question-item"
                        draggable="true" :class="{ 'dragging': draggedIndex === index }"
                        @dragstart="handleDragStart(index)" @dragover="handleDragOver" @drop="handleDrop($event, index)"
                        @dragend="handleDragEnd">
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
                          <div v-if="question.name" class="flex">
                            {{ index + 1 }}、
                            <div v-html="question.name"></div>
                          </div>
                          <div v-else style="color: #bfbfbf;">暂无题干</div>
                        </div>
                        <div class="question-options">
                          <div v-for="(option, optIndex) in parseQuestionSelects(question)" :key="optIndex"
                            class="option-row" :class="{ 'is-correct': isCorrectAnswer(question, option.label) }">
                            <span class="option-label">{{ option.label }}.</span>
                            <span class="option-content">{{ option.content }}</span>
                            <span v-if="isCorrectAnswer(question, option.label)" class="correct-tag">正确答案</span>
                          </div>
                        </div>
                        <div class="question-explanation">
                          <div class="explanation-label">答案解析：</div>
                          <div class="explanation-content">
                            <span v-if="question.answerKey">{{ question.answerKey }}</span>
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
                        <a-form ref="evaluationFormRef" :model="evaluationFormData" :rules="evaluationFormRules"
                          layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                          <a-form-item label="评测时长限制" name="timeLimitM" required>
                            <a-input-number v-model:value="evaluationFormData.timeLimitM" :min="0"
                              placeholder="请输入评测时长限制" style="width: 200px;" />
                            <span style="margin-left: 8px;">分钟</span>
                          </a-form-item>

                          <a-form-item label="学员任务文件" name="userFiles" required>
                            <div class="file-select-wrapper">
                              <a-button type="primary" @click="showUserFileSelectModal = true">点击选择</a-button>
                              <div class="selected-files-list">
                                <a-tag 
                                  v-for="file in userFileList" 
                                  :key="file.uid"
                                  closable
                                  @close="() => {
                                    userFileList = userFileList.filter(f => f.uid !== file.uid)
                                    evaluationFormData.userFiles = [...userFileList]
                                  }"
                                  style="margin: 4px;"
                                >
                                  {{ file.name }}
                                </a-tag>
                              </div>
                            </div>
                            <div class="upload-hint">
                              说明：从代码仓库中选择文件。（学员评测基本任务时名称，查看效果页上需要编辑的文件类型）
                            </div>
                          </a-form-item>

                          <a-form-item label="评测执行文件" name="testValidateFiles" required>
                            <div class="file-select-wrapper">
                              <a-button type="primary" @click="showTestValidateFileSelectModal = true">点击选择</a-button>
                              <div class="selected-files-list">
                                <a-tag 
                                  v-for="file in testValidateFileList" 
                                  :key="file.uid"
                                  closable
                                  @close="() => {
                                    testValidateFileList = testValidateFileList.filter(f => f.uid !== file.uid)
                                    evaluationFormData.testValidateFiles = [...testValidateFileList]
                                  }"
                                  style="margin: 4px;"
                                >
                                  {{ file.name }}
                                </a-tag>
                              </div>
                            </div>
                            <div class="upload-hint">
                              说明：从代码仓库中选择文件。（点击评测按钮时调用的文件，用于检验学员任务结果是否正确，可与"学员任务文件"一致）
                            </div>
                          </a-form-item>

                          <a-form-item label="评测执行命令" name="testValidateSh" required>
                            <a-input v-model:value="evaluationFormData.testValidateSh"
                              placeholder="请输入评测执行命令，例如：python main.py" />
                            <div class="upload-hint">
                              （执行评测文件的命令，如：python main.py、node index.js、java Main 等）
                            </div>
                          </a-form-item>

                        </a-form>
                      </div>

                      <!-- 评测规则 -->
                      <div class="evaluation-section">
                        <div class="section-header">评测规则</div>
                        <a-form layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                          <a-form-item label="通关判定">
                            <a-radio-group v-model:value="evaluationFormData.passType" class="custom-radio">
                              <a-radio :value="1">实际输出与期望输出对比</a-radio>
                              <a-radio :value="2">实际输出满足规则</a-radio>
                            </a-radio-group>
                          </a-form-item>

                          <a-form-item v-if="evaluationFormData.passType === 2" label="判定规则">
                            <a-input 
                              v-model:value="evaluationFormData.passTypeRule" 
                              placeholder="请输入判定规则" 
                            />
                            <div class="upload-hint">
                              （请输入实际输出满足的规则描述）
                            </div>
                          </a-form-item>

                          <a-form-item label="空格处理">
                            <a-radio-group v-model:value="evaluationFormData.blankCode" class="custom-radio">
                              <a-radio :value="1">不忽略空格</a-radio>
                              <a-radio :value="2">忽略首尾空格</a-radio>
                              <a-radio :value="3">忽略所有空格(仅通过空格中自动添加所有空格进行对比)</a-radio>
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
                              <a-radio :value="1">通过全部测试集（所有测试集都正确，才获取对应积分；否则得0学分）</a-radio>
                              <a-radio :value="2">通过部分测试集（选中的测试集全部正确，获取任务学分；否则得0学分）</a-radio>
                            </a-radio-group>
                          </a-form-item>

                          <a-form-item label="用例类型">
                            <div class="case-type-row">
                              <a-radio-group v-model:value="evaluationFormData.testValidateType" class="custom-radio">
                                <a-radio :value="1">文本</a-radio>
                                <a-radio :value="2">文件</a-radio>
                              </a-radio-group>
                              <!-- 只在文本类型时显示操作按钮 -->
                              <div v-if="evaluationFormData.testValidateType === 1" class="test-case-buttons">
                                <a-button type="primary" @click="addTestCase">新增测试集</a-button>
                                <a-button @click="clearAllTestCases">一键删除测试用例</a-button>
                                <!-- <a-button @click="downloadTemplate">下载测试用例模板</a-button>
                                <a-button @click="batchUploadTestCases">批量上传测试用例</a-button> -->
                              </div>
                            </div>
                          </a-form-item>

                          <!-- 测试集列表（只在文本类型时显示） -->
                          <div
                            v-if="evaluationFormData.testValidateType === 1 && evaluationFormData.testContent.length > 0"
                            class="test-cases-list">
                            <div v-for="(testCase, index) in evaluationFormData.testContent" :key="testCase.id"
                              class="test-case-item">
                              <a-checkbox :checked="testCase.select === 1"
                                @change="(e) => handleTestCaseSelectChange(testCase, e.target.checked)"
                                class="test-case-checkbox" />
                              <span class="test-case-label">测试集{{ index + 1 }}</span>
                              <a-input v-model:value="testCase.arg" placeholder="请输入输入内容" class="test-case-input" />
                              <a-input v-model:value="testCase.answer" placeholder="请输入期望输出" class="test-case-output" />
                              <DeleteOutlined class="delete-test-case" @click="removeTestCase(testCase.id)" />
                            </div>
                          </div>
                        </a-form>
                      </div>
                    </div>
                  </a-tab-pane>
                </a-tabs>

                <!-- 底部按钮（题目标签页内隐藏） -->
                <div v-if="currentTab !== 'questions'" class="form-footer-buttons">
                  <a-button v-if="!taskLevelFormData.taskId" @click="resetTaskLevel">重置</a-button>
                  <a-button type="primary" @click="saveTaskLevel">
                    {{ taskLevelFormData.taskId ? '更新' : '保存' }}
                  </a-button>
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
          <a-form ref="experimentFormRef" :model="currentEnvironmentConfig" :rules="experimentFormRules"
            :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
            <a-tabs v-model:activeKey="activeEnvironmentKey">
              <a-tab-pane v-for="env in experimentEnvironments" :key="env.id">
                <template #tab>
                  <div class="tab-label">
                    <template v-if="env.isEditing">
                      <a-input v-model:value="editingEnvironmentName" size="small" style="width: 120px;"
                        @pressEnter="handleSaveEnvironmentName(env)" @blur="handleSaveEnvironmentName(env)" />
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
                <a-form-item label="实验镜像" name="dockerImage" required>
                  <div class="experiment-image-info">
                    系统实验镜像默认为{{ getEnvironmentName() }}。
                  </div>
                </a-form-item>

                <a-form-item label="实验界面" name="viewTypes" required>
                  <div class="experiment-interfaces">
                    <div class="interface-card" :class="{ active: env.config.viewTypes.includes(1) }"
                      @click="toggleInterface(1)">
                      <div class="card-title">代码编辑器</div>
                      <div class="card-desc">提供代码编辑器，编辑器，调试器等工具</div>
                    </div>
                    <div class="interface-card" :class="{ active: env.config.viewTypes.includes(2) }"
                      @click="toggleInterface(2)">
                      <div class="card-title">命令行终端</div>
                      <div class="card-desc">提供命令行窗口</div>
                    </div>
                    <div class="interface-card" :class="{ active: env.config.viewTypes.includes(3) }"
                      @click="toggleInterface(3)">
                      <div class="card-title">容器内服务</div>
                      <div class="card-desc">直接预览容器内部Web服务</div>
                    </div>
                  </div>
                </a-form-item>

                <a-form-item label="附带环境" name="secondType" required>
                  <a-select 
                    v-model:value="env.config.secondType" 
                    placeholder="请选择附带环境" 
                    :options="collateralEnvironment.options.value"
                    :loading="collateralEnvironment.loading.value"
                    allowClear
                  />
                </a-form-item>

                <a-form-item label="任务关卡" name="taskId" required>
                  <a-select v-model:value="env.config.taskId" placeholder="请选择任务关卡" allowClear>
                    <a-select-option v-for="level in taskLevels" :key="level.taskId || level.id" 
                      :value="level.taskId ? String(level.taskId) : undefined"
                      :disabled="!level.taskId || isTaskLevelSelectedByOther(env.id, level.taskId)">
                      {{ level.name }}
                      <span v-if="!level.taskId" style="color: #999;"> (未保存)</span>
                      <span v-else-if="isTaskLevelSelectedByOther(env.id, level.taskId)" style="color: #999;"> (已被使用)</span>
                    </a-select-option>
                  </a-select>
                </a-form-item>

                <!-- 选择代码编辑器时显示编程语言 -->
                <a-form-item v-if="env.config.viewTypes.includes(1)" label="编程语言" name="codeType" required>
                  <a-select 
                    v-model:value="env.config.codeType" 
                    placeholder="请选择编程语言" 
                    :options="programmingLanguage.options.value"
                    :loading="programmingLanguage.loading.value"
                    allowClear
                  />
                </a-form-item>

                <!-- 选择命令行终端时显示开启时触发命令 -->
                <a-form-item v-if="env.config.viewTypes.includes(2)" label="开启时触发命令" name="shellBegin" required>
                  <a-input v-model:value="env.config.shellBegin" placeholder="请输入命令" />
                </a-form-item>

                <!-- 选择容器内服务时显示容器端口和路由 -->
                <a-form-item v-if="env.config.viewTypes.includes(3)" label="容器端口" name="containerPort" required>
                  <a-input v-model:value="env.config.containerPort" placeholder="请输入容器端口" />
                </a-form-item>

                <!-- 选择容器内服务时显示路由（选填） -->
                <a-form-item v-if="env.config.viewTypes.includes(3)" label="路由">
                  <a-input v-model:value="env.config.containerPath" placeholder="请输入路由（选填）" />
                </a-form-item>

                <!-- 保存/更新按钮 -->
                <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
                  <a-button class="w-full" type="primary" @click="saveEnvironment(env)">
                    {{ env.isSaved ? '更新' : '保存' }}
                  </a-button>
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
        <a-button v-if="currentStep === 3" type="primary" @click="completeProject">完成创建</a-button>
        <a-button v-else type="primary" @click="handleNext">下一步</a-button>
      </div>
    </div>

    <!-- 隐藏的文件上传选择器 -->
    <input 
      ref="fileUploadInput" 
      type="file" 
      style="display: none" 
      @change="handleFileUploadChange"
    />

    <!-- 弹窗组件 -->
    <RepositoryModal v-model:open="showRepositoryModal" @confirm="handleConfirmRepository"
      @cancel="handleCancelRepository" />
    <!-- 新建文件弹窗 -->
    <NewFileModal v-model:open="showNewFileModal" :parent-path="currentParentPath" @confirm="handleConfirmNewFile" />

    <!-- 新建文件夹弹窗 -->
    <NewFolderModal v-model:open="showNewFolderModal" :parent-path="currentFolderParentPath"
      @confirm="handleConfirmNewFolder" />

    <!-- 添加题目弹窗 -->
    <QuestionModal v-model:open="showQuestionModal" :question="currentEditingQuestion"
      :project-id="projectId ?? undefined" :task-id="taskLevelFormData.taskId" :existing-questions="getCurrentQuestions"
      @confirm="handleConfirmQuestion" />
    
    <!-- 学员任务文件选择器 -->
    <FileSelectModal 
      v-model:open="showUserFileSelectModal" 
      title="选择学员任务文件"
      :git-url="formData.gitUrl"
      @confirm="handleUserFilesSelect" 
    />
    
    <!-- 评测执行文件选择器 -->
    <FileSelectModal 
      v-model:open="showTestValidateFileSelectModal" 
      title="选择评测执行文件"
      :git-url="formData.gitUrl"
      @confirm="handleTestValidateFilesSelect" 
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

/* 图片预览样式 */
.image-preview {
  img {
    border: 1px solid #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
