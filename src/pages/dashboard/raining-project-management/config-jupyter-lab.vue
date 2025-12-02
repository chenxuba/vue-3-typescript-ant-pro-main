<script setup lang="ts">
import { ref, nextTick, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { uploadFileApi } from '@/api/common/file'
import { createProjectApi, updateProjectApi, createProjectTaskApi, updateProjectTaskApi, getPodApi, stopPodApi } from '@/api/project'
import { useFieldCategoryDictionary, useDifficultyDictionary, useSubcategoryDictionary } from '@/composables/dictionary'
import { getDicGroupApi, getEnvironmentDicCode } from '@/api/common/dictionary'
import { useMultiTab } from '@/stores/multi-tab'
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
// import FileTreeComponent from './components/FileTreeComponent.vue'
// import FilePreview from './components/FilePreview.vue'
import RichTextEditor from './components/RichTextEditor.vue'
// import NewFileModal from './components/NewFileModal.vue'
// import NewFolderModal from './components/NewFolderModal.vue'
// import RepositoryModal from './components/RepositoryModal.vue'
import FileSelectModal from './components/FileSelectModal.vue'

// Composables
// import { useFileTree } from './composables/useFileTree'

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
const multiTabStore = useMultiTab()
const PROJECT_LIST_PATH = '/dashboard/analysis'
const redirectToProjectList = async () => {
  await router.push(PROJECT_LIST_PATH)
  multiTabStore.closeOther(PROJECT_LIST_PATH)
}

// 当前步骤
const currentStep = ref(0)

// 项目ID
const projectId = ref<number | null>(null)

// 任务ID
const taskId = ref<number | null>(null)

// 表单引用
const formRef = ref<FormInstance>()
const trainingScopeFormRef = ref<FormInstance>()

// Jupyter编辑器
const jupyterUrl = ref<string>('')
const isFullscreen = ref(false)
const loadingPodUrl = ref(false) // 加载Pod URL状态

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 图片上传相关
const topCoverUrl = ref<string>('')
const coverUrl = ref<string>('')
const uploadingTopCover = ref(false)
const uploadingCover = ref(false)
const imageUrlPrefix = window.location.origin

// 表单数据
interface FormData {
  name: string
  tag: string
  fieldType?: number
  difficulty: number
  environment?: number | string // 支持数字和字符串
  secondType?: number
  classHour: number
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
  classHour: 0,
  topCover: '',
  cover: '',
  description: '',
  showTaskRequire: true,
  authType: 1,
  enableCodeRepository: false,
  repositoryType: '代码仓库',
  gitUrl: '',
})

// 从路由接收数据并填充表单
onMounted(async () => {
  // 加载领域类别字典、难度字典和小类别字典
  fieldCategory.load()
  difficulty.load()
  subcategory.load()
  
  // 先加载环境选项
  await loadEnvironmentOptions()
  
  const routeData = history.state as any
  console.log('接收到的路由数据:', routeData)

  if (routeData && routeData.name) {
    // 填充基础信息
    formData.value.name = routeData.name || ''
    formData.value.description = routeData.description || ''
    formData.value.difficulty = routeData.difficulty || 1
    formData.value.environment = routeData.environment
    formData.value.secondType = routeData.secondType
    formData.value.classHour = routeData.classHour || 0
    formData.value.showTaskRequire = routeData.showTaskRequire || true

    console.log('已自动填充表单数据:', {
      name: formData.value.name,
      description: formData.value.description,
      descriptionLength: formData.value.description?.length || 0,
      difficulty: formData.value.difficulty,
      environment: formData.value.environment,
      secondType: formData.value.secondType,
      classHour: formData.value.classHour,
      showTaskRequire: formData.value.showTaskRequire,
    })
  } else {
    console.log('未接收到路由数据')
  }
})

// 监听步骤变化，自动创建任务
watch(currentStep, async (newStep, oldStep) => {
  // 当从第一步进入第二步（实验内容），且还没有创建任务时，自动创建任务
  if (newStep === 1 && oldStep === 0 && !taskId.value && projectId.value) {
    console.log('进入第二步（实验内容），自动创建任务...')
    await handleCreateTaskAutomatic()
  }
  
  // 当进入第二步（实验内容），且已有任务ID时，获取Pod配置
  if (newStep === 1 && taskId.value) {
    await fetchPodConfig()
  }
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
  environment: [
    { required: true, message: '请选择实验环境', trigger: 'change' },
  ],
  // secondType: [
  //   { required: true, message: '请选择小类别', trigger: 'change' },
  // ],
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

// 小类别选项已改为使用字典 hooks (subcategory)

// 仓库类型选项
// const repositoryTypeOptions = [
//   { label: '切换仓库', value: '切换仓库' },
//   { label: '代码仓库', value: '代码仓库' },
//   { label: '私密代码仓库', value: '私密代码仓库' },
// ]

// 仓库地址是否锁定
// const isRepositoryUrlLocked = ref(false)

// 已加载的文件夹节点（避免重复加载）
// const loadedFolderKeys = ref<Set<string>>(new Set())

// 步骤标题
const steps = [
  { title: '基本信息' },
  { title: '实验内容' },
  { title: '评测设置' },
  { title: '实验环境' },
]

// 使用文件树composable
// const {
//   fileTreeData,
//   expandedKeys,
//   selectedFile,
//   highlightedCode,
//   dynamicFileContents,
//   handleSelectFile,
//   getNodePath,
//   addFileToTree,
//   addFolderToTree,
//   handleRenameNode,
//   handleCopyPath,
//   loadRemoteFileTree,
//   loadChildrenData,
//   getNodePathFromMap,
// } = useFileTree()

// 弹窗状态
// const showRepositoryModal = ref(false)
// const showNewFileModal = ref(false)
// const showNewFolderModal = ref(false)
const showTestValidateFileSelectModal = ref(false) // 评测文件选择器
// const currentParentPath = ref('/')
// const currentFolderParentPath = ref('/')

// 文件上传相关
// const fileUploadInput = ref<HTMLInputElement | null>(null)
// const currentUploadPath = ref('/')

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
// const handleRepositorySwitchChange = (checked: boolean | string | number) => {
//   const isChecked = typeof checked === 'boolean' ? checked : Boolean(checked)
//   if (isChecked) {
//     showRepositoryModal.value = true
//   } else {
//     formData.value.enableCodeRepository = false
//   }
// }

// 请求仓库文件
// const fetchRepositoryFiles = async () => {
//   try {
//     const loadingMsg = message.loading('正在查询仓库文件...', 0)
//     
//     // 调用API获取文件列表
//     const fileList = await getGitFileListApi(formData.value.gitUrl, '')
//     
//     // 加载文件树
//     loadRemoteFileTree(fileList)
//     
//     // 清空已加载文件夹记录
//     loadedFolderKeys.value.clear()
//     
//     loadingMsg()
//     message.success('仓库文件查询成功')
//     console.log('查询仓库地址：', formData.value.gitUrl)
//     console.log('获取到的文件列表：', fileList)
//   } catch (error: any) {
//     message.error(error.message || '仓库文件查询失败')
//     console.error('仓库文件查询失败：', error)
//   }
// }

// 确认开启代码库
// const handleConfirmRepository = async () => {
//   // 校验是否有仓库地址
//   if (!formData.value.gitUrl || !formData.value.gitUrl.trim()) {
//     message.error('请先配置仓库地址')
//     handleCancelRepository()
//     return
//   }
//   
//   formData.value.enableCodeRepository = true
//   showRepositoryModal.value = false
//   
//   // 锁定仓库地址输入框
//   isRepositoryUrlLocked.value = true
//   
//   // 请求接口查询仓库文件（目前模拟）
//   await fetchRepositoryFiles()
// }

// 取消开启代码库
// const handleCancelRepository = () => {
//   formData.value.enableCodeRepository = false
//   showRepositoryModal.value = false
// }

// 监听仓库类型变化
// watch(() => formData.value.repositoryType, (newType) => {
//   if (newType === '切换仓库' && formData.value.enableCodeRepository) {
//     // 选择切换仓库时，解锁仓库地址输入框
//     isRepositoryUrlLocked.value = false
//     message.info('已解锁仓库地址，请重新输入')
//     
//     // 自动切换回代码仓库选项
//     nextTick(() => {
//       formData.value.repositoryType = '代码仓库'
//     })
//   }
// })

// 仓库地址输入框失焦处理
// const handleRepositoryUrlBlur = () => {
//   if (formData.value.enableCodeRepository && !isRepositoryUrlLocked.value) {
//     const url = formData.value.gitUrl?.trim()
//     if (url) {
//       // 重新锁定并请求文件
//       isRepositoryUrlLocked.value = true
//       fetchRepositoryFiles()
//     }
//   }
// }

// 处理文件树展开事件
// const handleTreeExpand = async (_expandedKeys: (string | number)[], info: any) => {
//   const { expanded, node } = info
  
//   // 只处理展开事件，且是文件夹节点
//   if (expanded && !node.isLeaf) {
//     const nodeKey = String(node.key)
    
//     // 如果该文件夹已经加载过，则不再重复加载
//     if (loadedFolderKeys.value.has(nodeKey)) {
//       console.log('文件夹已加载，跳过：', nodeKey)
//       return
//     }
    
//     try {
//       // 获取该节点的路径
//       const nodePath = getNodePathFromMap(nodeKey)
//       console.log('加载文件夹：', nodePath, '节点key:', nodeKey)
      
//       const loadingMsg = message.loading(`正在加载 ${node.title}...`, 0)
      
//       // 调用API获取子文件列表
//       const fileList = await getGitFileListApi(formData.value.gitUrl, nodePath)
      
//       // 加载子文件到树中
//       loadChildrenData(nodeKey, fileList)
      
//       // 标记该文件夹已加载
//       loadedFolderKeys.value.add(nodeKey)
      
//       loadingMsg()
//       console.log('文件夹加载成功：', nodePath, fileList)
//     } catch (error: any) {
//       message.error(error.message || '加载文件夹失败')
//       console.error('加载文件夹失败：', error)
//     }
//   }
// }

// // 处理菜单点击
// const handleMenuClick = (info: any) => {
//   const key = String(info.key)
//   switch (key) {
//     case 'newFile':
//       handleNewFile()
//       break
//     case 'newFolder':
//       handleNewFolder()
//       break
//     case 'upload':
//       triggerFileUpload('/')
//       break
//   }
// }

// // 处理树节点菜单点击
// const handleTreeNodeMenuClick = (info: any, nodeData: any) => {
//   const menuKey = String(info.key)
//   // 优先使用路径映射，如果没有则使用遍历方式
//   const nodePath = getNodePathFromMap(nodeData.key) || getNodePath(nodeData.key)

//   switch (menuKey) {
//     case 'newFile':
//       handleNewFile(nodePath)
//       break
//     case 'newFolder':
//       handleNewFolder(nodePath)
//       break
//     case 'upload':
//       triggerFileUpload(nodePath)
//       break
//     case 'rename':
//       handleRenameNode(nodeData)
//       break
//     case 'copyPath':
//       handleCopyPath(nodeData)
//       break
//     case 'delete':
//       handleDeleteWithApi(nodeData)
//       break
//   }
// }

// 从文件树中删除节点（不显示确认对话框）
// const removeNodeFromTree = (nodeKey: string) => {
//   const deleteNode = (nodes: any[]): boolean => {
//     const index = nodes.findIndex((node: any) => node.key === nodeKey)
//     if (index !== -1) {
//       nodes.splice(index, 1)
//       return true
//     }
//     
//     for (const node of nodes) {
//       if (node.children && deleteNode(node.children)) {
//         return true
//       }
//     }
//     return false
//   }
//   
//   deleteNode(fileTreeData.value)
// }

// 删除文件/文件夹（调用API）
// const handleDeleteWithApi = async (nodeData: any) => {
//   const isFolder = nodeData.children !== undefined || nodeData.isLeaf === false
//   const fileName = nodeData.title
  
//   // 获取节点路径
//   const fullPath = getNodePathFromMap(nodeData.key) || getNodePath(nodeData.key)
  
//   // 计算 path 参数（去除文件名，只保留父路径）
//   const pathParts = fullPath.split('/')
//   pathParts.pop() // 移除最后一个元素（文件/文件夹名）
//   const path = pathParts.join('/') || '' // 如果是根目录，则为空字符串
  
//   const { Modal } = await import('ant-design-vue')
//   Modal.confirm({
//     title: '确认删除',
//     content: `确定要删除${isFolder ? '文件夹' : '文件'} "${fileName}" 吗？${isFolder ? '文件夹下的所有内容也会被删除。' : ''}`,
//     okText: '确定',
//     cancelText: '取消',
//     okType: 'danger',
//     onOk: async () => {
//       let loadingMsg: any = null
//       try {
//         loadingMsg = message.loading('正在删除...', 0)
        
//         // 调用API删除文件/文件夹
//         await deleteGitFileApi({
//           fileName: fileName,
//           gitUrl: formData.value.gitUrl,
//           path: path,
//         })
        
//         // API删除成功后，从本地树中移除节点
//         removeNodeFromTree(nodeData.key)
        
//         loadingMsg()
//         message.success('删除成功')
//         console.log('删除成功：', { fileName, path })
//       } catch (error: any) {
//         if (loadingMsg) loadingMsg() // 确保关闭 loading 提示
//         message.error(error.message || '删除失败')
//         console.error('删除失败：', error)
//       }
//     },
//   })
// }

// // 触发文件选择
// const triggerFileUpload = (path: string) => {
//   currentUploadPath.value = path
//   fileUploadInput.value?.click()
// }

// 处理文件选择
// const handleFileUploadChange = async (event: Event) => {
//   const target = event.target as HTMLInputElement
//   const file = target.files?.[0]
//   
//   if (!file) return
//   
//   try {
//     // 计算上传路径：如果在根目录，path为空；否则去掉前缀斜杠
//     let uploadPath = currentUploadPath.value === '/' ? '' : currentUploadPath.value.replace(/^\//, '')
//     
//     const loadingMsg = message.loading(`正在上传 ${file.name}...`, 0)
//     
//     // 调用API上传文件到Git仓库
//     await uploadFileToGitApi(file, formData.value.gitUrl, uploadPath)
//     
//     // 读取文件内容并添加到本地文件树（用于预览）
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       const content = e.target?.result as string
//       addFileToTree(file.name, content, currentUploadPath.value)
//     }
//     reader.readAsText(file)
//     
//     loadingMsg()
//     message.success(`文件 ${file.name} 上传成功`)
//     console.log('文件上传成功：', { fileName: file.name, path: uploadPath })
//   } catch (error: any) {
//     message.error(error.message || '文件上传失败')
//     console.error('文件上传失败：', error)
//   } finally {
//     // 清空文件选择器，允许重复上传同一文件
//     if (target) {
//       target.value = ''
//     }
//   }
// }

// 打开新建文件弹窗
// const handleNewFile = (parentPath: string = '/') => {
//   showNewFileModal.value = true
//   currentParentPath.value = parentPath
// }

// 确认新建文件
// interface NewFileForm {
//   fileName: string
//   fileContent: string
//   commitMessage: string
// }

// const handleConfirmNewFile = async (newFileData: NewFileForm) => {
//   try {
//     // 计算文件路径：如果在根目录，path为空；否则去掉前缀斜杠
//     let filePath = currentParentPath.value === '/' ? '' : currentParentPath.value.replace(/^\//, '')
//     
//     const loadingMsg = message.loading('正在保存文件...', 0)
//     
//     // 调用API保存文件
//     await saveGitFileContentApi({
//       fileContent: newFileData.fileContent,
//       fileName: newFileData.fileName,
//       gitUrl: formData.value.gitUrl, // 从主表单获取仓库地址
//       path: filePath,
//       commit: newFileData.commitMessage,
//     })
//     
//     // 添加到本地文件树
//     addFileToTree(newFileData.fileName, newFileData.fileContent, currentParentPath.value)
//     
//     loadingMsg()
//     message.success('文件创建成功')
//     showNewFileModal.value = false
//     
//     console.log('文件保存成功：', { fileName: newFileData.fileName, path: filePath })
//   } catch (error: any) {
//     message.error(error.message || '文件创建失败')
//     console.error('文件创建失败：', error)
//   }
// }

// 打开新建文件夹弹窗
// const handleNewFolder = (parentPath: string = '/') => {
//   showNewFolderModal.value = true
//   currentFolderParentPath.value = parentPath
// }

// 确认新建文件夹
// interface NewFolderForm {
//   folderName: string
//   commitMessage: string
// }

// const handleConfirmNewFolder = async (newFolderData: NewFolderForm) => {
//   try {
//     // 计算文件夹路径：如果在根目录，path为文件夹名；否则拼接路径
//     let folderPath = currentFolderParentPath.value === '/' 
//       ? newFolderData.folderName 
//       : `${currentFolderParentPath.value.replace(/^\//, '')}/${newFolderData.folderName}`
//     
//     const loadingMsg = message.loading('正在创建文件夹...', 0)
//     
//     // 调用API创建文件夹
//     await createGitDirApi({
//       commit: newFolderData.commitMessage,
//       gitUrl: formData.value.gitUrl,
//       path: folderPath,
//     })
//     
//     // 添加到本地文件树
//     addFolderToTree(newFolderData.folderName, currentFolderParentPath.value)
//     
//     loadingMsg()
//     message.success('文件夹创建成功')
//     showNewFolderModal.value = false
//     
//     console.log('文件夹创建成功：', { folderName: newFolderData.folderName, path: folderPath })
//   } catch (error: any) {
//     message.error(error.message || '文件夹创建失败')
//     console.error('文件夹创建失败：', error)
//   }
// }

// 评测设置 - 当前标签页
const evaluationActiveTab = ref('settings')

// 评测设置数据
interface EvaluationData {
  openTestValidate: number // 1开 2不开
  testValidateFiles: string // 评测文件URL
  testValidateSh: string // 评测执行命令
  timeLimitM: string | number // 评测时长限制（分钟）
  classHour: number | undefined // 学时
  scoreRule: number // 系统评分规则：1-通过全部测试集 2-通过部分测试集
  evaluationSetting: number // 1-通过所有代码块评测 2-通过指定代码块评测
  testSets: TestSet[]
}

interface TestSet {
  id: number
  answer: string
  select: number
}

const evaluationData = ref<EvaluationData>({
  openTestValidate: 2, // 默认开启
  testValidateFiles: '', // 评测文件
  testValidateSh: '', // 评测执行命令
  timeLimitM: '', // 评测时长限制
  classHour: undefined, // 学时
  scoreRule: 1, // 默认通过全部测试集
  evaluationSetting: 1, // 默认通过所有代码块评测
  testSets: [
    { id: 1, answer: '', select: 1 },
  ],
})

// 参考答案数据
interface ReferenceAnswerData {
  showAnswer: number // 1是显示、2否隐藏
  prohibitCopyAnswer: number // 1是禁止、2否不禁止
  referenceAnswer: string
}

const referenceAnswerData = ref<ReferenceAnswerData>({
  showAnswer: 1, // 默认显示
  prohibitCopyAnswer: 1, // 默认禁止复制
  referenceAnswer: '',
})

// 保存状态标记
const evaluationSaved = ref(false) // 评测设置是否已保存
const referenceAnswerSaved = ref(false) // 参考答案是否已保存

// 处理测试集选中状态变化
const handleTestSetSelectChange = (testSet: TestSet, checked: boolean) => {
  testSet.select = checked ? 1 : 2
}

// 评测文件列表
const testValidateFileList = ref<any[]>([])

// // 自定义上传请求（用于多文件上传）
// const handleLearningResourceCustomRequest = (options: any) => {
//   const { onSuccess } = options
//   // 直接调用成功回调，实际上传在 change 事件中处理
//   setTimeout(() => {
//     onSuccess('ok')
//   }, 0)
// }

// // 处理评测文件上传
// const handleTestValidateFilesUpload = async (info: any) => {
//   const { fileList } = info
  
//   const validFiles = fileList.filter((file: any) => {
//     if (file.status === 'uploading') return true
//     if (file.status === 'done' || !file.status) return true
//     return false
//   })
  
//   testValidateFileList.value = validFiles
  
//   const uploadPromises = validFiles
//     .filter((file: any) => file.originFileObj && !file.url)
//     .map(async (file: any) => {
//       try {
//         const url = await uploadFileApi(file.originFileObj)
//         file.url = url
//         return url
//       } catch (error) {
//         console.error('文件上传失败:', error)
//         message.error(`文件 ${file.name} 上传失败`)
//         return null
//       }
//     })
  
//   if (uploadPromises.length > 0) {
//     const urls = await Promise.all(uploadPromises)
//     const successUrls = urls.filter(url => url !== null)
    
//     if (successUrls.length > 0) {
//       const allUrls = validFiles
//         .filter((file: any) => file.url)
//         .map((file: any) => file.url)
//         .join(',')
      
//       evaluationData.value.testValidateFiles = allUrls
//       message.success(`成功上传 ${successUrls.length} 个文件`)
//     }
//   }
// }

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

// 返回
const handleBack = () => {
  if (currentStep.value === 0) {
    router.back()
  } else {
    currentStep.value--
    scrollToTop()
  }
}

// 创建或更新项目
const handleCreateProject = async () => {
  try {
    // 准备提交的数据
    const submitData: any = {
      projectType: 3, // JupyterLab环境实训项目
      environment: formData.value.environment,
      name: formData.value.name,
      tag: formData.value.tag,
      fieldType: formData.value.fieldType,
      difficulty: formData.value.difficulty,
      // classHour: formData.value.classHour,
      topCover: formData.value.topCover,
      cover: formData.value.cover,
      description: formData.value.description,
      showTaskRequire: formData.value.showTaskRequire ? 1 : 2, // 转换为 1 或 2
      authType: formData.value.authType,
      enableCodeRepository: formData.value.enableCodeRepository,
      secondType: formData.value.secondType,
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

    // 跳转到下一步（实验内容）
    currentStep.value = 1
    scrollToTop()
  } catch (error) {
    console.error('操作失败：', error)
    message.error(projectId.value ? '项目更新失败，请稍后重试' : '项目创建失败，请稍后重试')
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
      // 第一步：基本信息验证后创建项目
      await handleCreateProject()
    } catch (error) {
      message.error('请完善必填信息')
      scrollToTop()
    }
  } else if (currentStep.value === 1) {
    // 第二步：实验内容，停止Pod后进入下一步
    if (taskId.value) {
      await handleStopPod()
    }
    
    currentStep.value = 2
    scrollToTop()
  } else if (currentStep.value === 2) {
    // 第三步：评测设置验证
    try {
      // 验证是否有任务ID
      if (!taskId.value) {
        message.error('任务ID不存在，请重新创建任务')
        return
      }
      
      // 如果启用了评测功能，进行非空校验
      if (evaluationData.value.openTestValidate === 1) {
        // 校验评测时长限制
        if (!evaluationData.value.timeLimitM) {
          message.error('请输入评测时长限制')
          scrollToTop()
          return
        }
        
        // 校验学时
        if (!evaluationData.value.classHour || evaluationData.value.classHour <= 0) {
          message.error('请输入有效的学时')
          scrollToTop()
          return
        }
        
        // 校验测试集
        if (!evaluationData.value.testSets || evaluationData.value.testSets.length === 0) {
          message.error('请至少添加一个测试集')
          scrollToTop()
          return
        }
        
        // 校验是否至少有一个测试集被选中
        const selectedTestSets = evaluationData.value.testSets.filter(item => item.select === 1)
        if (selectedTestSets.length === 0) {
          message.error('请至少选中一个测试集')
          scrollToTop()
          return
        }
        
        // 校验选中的测试集是否填写了期望输出
        for (let i = 0; i < selectedTestSets.length; i++) {
          const testSet = selectedTestSets[i]
          if (!testSet.answer || testSet.answer.trim() === '') {
            message.error(`测试集的期望输出不能为空`)
            scrollToTop()
            return
          }
        }
      }
      
      // 准备测试集数据
      const testContentArray = evaluationData.value.testSets.map(item => ({
        answer: item.answer,
        select: item.select,
      }))
      
      // 始终调用更新接口保存数据 - 包含两个tabs的所有参数
      const taskUpdateData: any = {
        taskId: taskId.value,
        projectId: projectId.value,
        // 评测设置参数
        openTestValidate: evaluationData.value.openTestValidate,
        testValidateFiles: evaluationData.value.testValidateFiles,
        testValidateSh: evaluationData.value.testValidateSh,
        timeLimitM: evaluationData.value.timeLimitM,
        classHour: evaluationData.value.classHour,
        scoreRule: evaluationData.value.scoreRule,
        evaluationSetting: evaluationData.value.evaluationSetting,
        testContent: JSON.stringify(testContentArray),
        // 参考答案参数
        showAnswer: referenceAnswerData.value.showAnswer,
        prohibitCopyAnswer: referenceAnswerData.value.prohibitCopyAnswer,
        referenceAnswer: referenceAnswerData.value.referenceAnswer,
      }
      
      console.log('下一步时保存评测设置和参考答案数据：', taskUpdateData)
      
      // 调用更新任务接口
      await updateProjectTaskApi(taskUpdateData as any)
      evaluationSaved.value = true
      referenceAnswerSaved.value = true
      
      // 保存成功后进入下一步
      currentStep.value = 3
      scrollToTop()
    } catch (error) {
      console.error('保存数据失败：', error)
      message.error('保存数据失败，请重试')
      scrollToTop()
    }
  }
}

// 自动创建项目任务（进入第二步时）
const handleCreateTaskAutomatic = async () => {
  try {
    // 检查是否有项目ID
    if (!projectId.value) {
      console.error('项目ID不存在，无法创建任务')
      return
    }

    // 准备提交的任务数据
    const taskData: any = {
      type: 4, // JupyterLab任务类型
      projectId: projectId.value,
      name: 'JupyterLab环境实训任务', // 固定名称
    }

    console.log('自动提交任务数据：', taskData)

    // 调用创建接口
    const response = await createProjectTaskApi(taskData)

    // 保存任务ID
    if (response && response.taskId) {
      taskId.value = response.taskId
      console.log('任务ID已保存：', taskId.value)
      message.success('任务创建成功！')
      
      // 创建任务成功后，立即获取Pod配置
      await fetchPodConfig()
    }
  } catch (error) {
    console.error('任务创建失败：', error)
    message.error('任务创建失败，请稍后重试')
  }
}

// 获取Pod配置
const fetchPodConfig = async () => {
  if (!taskId.value) {
    console.log('taskId不存在，无法获取Pod配置')
    return
  }
  
  try {
    loadingPodUrl.value = true
    console.log('正在获取Pod配置，taskId:', taskId.value)
    
    const podData = await getPodApi({ taskId: taskId.value })
    console.log('获取到Pod数据：', podData)
    
    if (podData && podData.config && podData.config.url) {
      jupyterUrl.value = podData.config.url
      console.log('更新Jupyter URL为：', jupyterUrl.value)
      message.success('实验环境加载成功！')
    } else {
      console.error('Pod配置中没有url字段')
      message.warning('未获取到实验环境URL')
    }
  } catch (error) {
    console.error('获取Pod配置失败：', error)
    message.error('获取实验环境失败，请稍后重试')
  } finally {
    loadingPodUrl.value = false
  }
}

// 停止Pod
const handleStopPod = async () => {
  if (!taskId.value) {
    console.log('taskId不存在，无法停止Pod')
    return
  }
  
  try {
    console.log('正在停止Pod，taskId:', taskId.value)
    
    await stopPodApi({ taskId: taskId.value })
    console.log('Pod停止成功')
    message.success('实验环境已停止')
  } catch (error) {
    console.error('停止Pod失败：', error)
    message.error('停止实验环境失败，请稍后重试')
    // 即使停止失败，也允许继续流程
  }
}

// 保存评测设置
const handleSaveEvaluation = async () => {
  try {
    // 验证是否有任务ID
    if (!taskId.value) {
      message.error('任务ID不存在，请重新创建任务')
      return
    }
    
    // 如果启用了评测功能，进行非空校验
    if (evaluationData.value.openTestValidate === 1) {
      // 校验评测时长限制
      if (!evaluationData.value.timeLimitM) {
        message.error('请输入评测时长限制')
        return
      }
      
      // 校验学时
      if (!evaluationData.value.classHour || evaluationData.value.classHour <= 0) {
        message.error('请输入有效的学时')
        return
      }
      
      // 校验测试集
      if (!evaluationData.value.testSets || evaluationData.value.testSets.length === 0) {
        message.error('请至少添加一个测试集')
        return
      }
      
      // 校验是否至少有一个测试集被选中
      const selectedTestSets = evaluationData.value.testSets.filter(item => item.select === 1)
      if (selectedTestSets.length === 0) {
        message.error('请至少选中一个测试集')
        return
      }
      
      // 校验选中的测试集是否填写了期望输出
      for (let i = 0; i < selectedTestSets.length; i++) {
        const testSet = selectedTestSets[i]
        if (!testSet.answer || testSet.answer.trim() === '') {
          message.error(`测试集的期望输出不能为空`)
          return
        }
      }
    }
    
    // 准备测试集数据
    const testContentArray = evaluationData.value.testSets.map(item => ({
      answer: item.answer,
      select: item.select,
    }))
    
    // 更新任务数据 - 包含两个tabs的所有参数
    const taskUpdateData: any = {
      taskId: taskId.value,
      projectId: projectId.value,
      // 评测设置参数
      openTestValidate: evaluationData.value.openTestValidate,
      testValidateFiles: evaluationData.value.testValidateFiles,
      testValidateSh: evaluationData.value.testValidateSh,
      timeLimitM: evaluationData.value.timeLimitM,
      classHour: evaluationData.value.classHour,
      scoreRule: evaluationData.value.scoreRule,
      evaluationSetting: evaluationData.value.evaluationSetting,
      testContent: JSON.stringify(testContentArray),
      // 参考答案参数
      showAnswer: referenceAnswerData.value.showAnswer,
      prohibitCopyAnswer: referenceAnswerData.value.prohibitCopyAnswer,
      referenceAnswer: referenceAnswerData.value.referenceAnswer,
    }
    
    console.log('保存评测设置和参考答案数据：', taskUpdateData)
    
    // 调用更新任务接口
    await updateProjectTaskApi(taskUpdateData as any)
    evaluationSaved.value = true
    referenceAnswerSaved.value = true
    message.success('评测设置和参考答案保存成功！')
  } catch (error) {
    console.error('评测设置和参考答案保存失败：', error)
    message.error('评测设置和参考答案保存失败，请重试')
  }
}

// 保存参考答案
const handleSaveReferenceAnswer = async () => {
  try {
    // 验证是否有任务ID
    if (!taskId.value) {
      message.error('任务ID不存在，请重新创建任务')
      return
    }
    
    // 如果启用了评测功能，进行非空校验
    if (evaluationData.value.openTestValidate === 1) {
      // 校验评测时长限制
      if (!evaluationData.value.timeLimitM) {
        message.error('请输入评测时长限制')
        return
      }
      
      // 校验学时
      if (!evaluationData.value.classHour || evaluationData.value.classHour <= 0) {
        message.error('请输入有效的学时')
        return
      }
      
      // 校验测试集
      if (!evaluationData.value.testSets || evaluationData.value.testSets.length === 0) {
        message.error('请至少添加一个测试集')
        return
      }
      
      // 校验是否至少有一个测试集被选中
      const selectedTestSets = evaluationData.value.testSets.filter(item => item.select === 1)
      if (selectedTestSets.length === 0) {
        message.error('请至少选中一个测试集')
        return
      }
      
      // 校验选中的测试集是否填写了期望输出
      for (let i = 0; i < selectedTestSets.length; i++) {
        const testSet = selectedTestSets[i]
        if (!testSet.answer || testSet.answer.trim() === '') {
          message.error(`测试集的期望输出不能为空`)
          return
        }
      }
    }
    
    // 准备测试集数据
    const testContentArray = evaluationData.value.testSets.map(item => ({
      answer: item.answer,
      select: item.select,
    }))
    
    // 更新任务数据 - 包含两个tabs的所有参数
    const taskUpdateData: any = {
      taskId: taskId.value,
      projectId: projectId.value,
      // 评测设置参数
      openTestValidate: evaluationData.value.openTestValidate,
      testValidateFiles: evaluationData.value.testValidateFiles,
      testValidateSh: evaluationData.value.testValidateSh,
      timeLimitM: evaluationData.value.timeLimitM,
      classHour: evaluationData.value.classHour,
      scoreRule: evaluationData.value.scoreRule,
      evaluationSetting: evaluationData.value.evaluationSetting,
      testContent: JSON.stringify(testContentArray),
      // 参考答案参数
      showAnswer: referenceAnswerData.value.showAnswer,
      prohibitCopyAnswer: referenceAnswerData.value.prohibitCopyAnswer,
      referenceAnswer: referenceAnswerData.value.referenceAnswer,
    }
    
    console.log('保存评测设置和参考答案数据：', taskUpdateData)
    
    // 调用更新任务接口
    await updateProjectTaskApi(taskUpdateData as any)
    evaluationSaved.value = true
    referenceAnswerSaved.value = true
    message.success('评测设置和参考答案保存成功！')
  } catch (error) {
    console.error('评测设置和参考答案保存失败：', error)
    message.error('评测设置和参考答案保存失败，请重试')
  }
}

// 完成项目创建
const handleSave = async () => {
  try {
    // 验证是否有项目ID和任务ID
    if (!projectId.value) {
      message.error('项目ID不存在，请重新创建项目')
      return
    }
    
    if (!taskId.value) {
      message.error('任务ID不存在，请重新创建任务')
      return
    }
    
    // 校验评测设置和参考答案是否都已保存
    if (!evaluationSaved.value) {
      message.error('请先保存评测设置后再完成创建')
      return
    }
    
    if (!referenceAnswerSaved.value) {
      message.error('请先保存参考答案后再完成创建')
      return
    }
    
    // 校验实验环境配置
    if (!environmentConfig.value.dockerImage) {
      message.error('请选择实验环境')
      return
    }
    
    if (!environmentConfig.value.timeLimitM) {
      message.error('请输入实验环境使用时长')
      return
    }
    
    // 第一步：先更新任务，传入实验环境配置
    await updateProjectTaskApi({
      taskId: taskId.value,
      projectId: projectId.value,
      dockerImage: environmentConfig.value.dockerImage,
      secondType: environmentConfig.value.secondType,
      timeLimitM: environmentConfig.value.timeLimitM,
    } as any)
    
    // 第二步：任务更新成功后，再更新项目状态为已完成
    // 培训公开范围为全院公开（authType === 2）时，不调用此接口
    if (formData.value.authType !== 2) {
      await updateProjectApi({
        id: projectId.value,
        status: 10, // 设置状态为10（已完成）
      } as any)
    }
    
    message.success('项目创建成功！')
    
    setTimeout(() => {
      void redirectToProjectList()
    }, 500)
  } catch (error) {
    console.error('完成创建失败：', error)
    message.error('完成创建失败，请重试')
  }
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
                <a-form-item label="技能标签" name="tag" required :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                  <a-input v-model:value="formData.tag" placeholder="请输入技能标签" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    请使用英文状态下的逗号分隔技能标签，比如html,css,js
                  </div>
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
              <!-- <a-col :span="12">
                <a-form-item label="小类别" name="secondType" required :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }">
                  <a-select 
                    v-model:value="formData.secondType" 
                    placeholder="请选择小类别"
                    :options="subcategory.options.value"
                    :loading="subcategory.loading.value"
                  />
                </a-form-item>
              </a-col> -->
            </a-row>

            <a-form-item label="学时" name="classHour" >
              <a-input-number :min="0" disabled class="w-full" v-model:value="formData.classHour" placeholder="配置任务后自动计算学时" />
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

            <!-- <a-form-item label="任务要求" name="showTaskRequire">
              <a-checkbox v-model:checked="formData.showTaskRequire" disabled>
                显示任务要求（勾选后，将作为任务要求显示在任务项目里）
              </a-checkbox>
            </a-form-item> -->
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

      <!-- 第二步：实验内容 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="jupyter-container" :class="{ 'fullscreen': isFullscreen }">
          <div class="jupyter-header">
            <h3>Jupyter Lab 编辑器</h3>
            <div class="jupyter-actions">
              <a-tooltip :title="isFullscreen ? '退出全屏' : '全屏'">
                <a-button 
                  type="text" 
                  :icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
                  @click="toggleFullscreen"
                >
                  {{ isFullscreen ? '退出全屏' : '全屏' }}
                </a-button>
              </a-tooltip>
            </div>
          </div>
          <div class="jupyter-iframe-wrapper">
            <div v-if="loadingPodUrl" class="loading-container">
              <a-spin size="large" tip="正在加载实验环境..." />
            </div>
            <iframe 
              v-else
              :src="jupyterUrl" 
              class="jupyter-iframe"
              frameborder="0"
              allowfullscreen
            ></iframe>
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

                      <a-form-item label="学时" required>
                        <a-input-number 
                          v-model:value="evaluationData.classHour" 
                          :min="0"
                          placeholder="请输入学时" 
                          style="width: 600px"
                        />
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
                  <!-- 暂不支持新增测试集
                  <div class="header-actions">
                    <a-button @click="addTestSet">新增测试集</a-button>
                  </div>
                  -->
                </div>
                <div class="block-content">
                  <div 
                    v-for="(testSet) in evaluationData.testSets" 
                    :key="testSet.id"
                    class="test-set-item"
                  >
                    <a-checkbox 
                      :checked="testSet.select === 1"
                      @change="(e) => handleTestSetSelectChange(testSet, e.target.checked)"
                      class="test-set-checkbox" 
                    />
                    <span class="test-set-label">测试集</span>
                    <a-textarea 
                      v-model:value="testSet.answer" 
                      placeholder="请输入期望输出"
                      class="test-set-input"
                      :auto-size="{ minRows: 3 }"
                    />
                    <!-- 暂不支持删除测试集
                    <DeleteOutlined 
                      class="delete-test-set-icon" 
                      @click="removeTestSet(testSet.id)" 
                    />
                    -->
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

                    <a-form-item label="参考答案">
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
        <a-button v-if="currentStep === 0" @click="handleBack">返回</a-button>
        <a-button v-else @click="handleBack">上一步</a-button>
        <a-button v-if="currentStep === 3" type="primary" @click="handleSave">完成创建</a-button>
        <a-button v-else type="primary" @click="handleNext">下一步</a-button>
      </div>
    </div>

    <!-- 隐藏的文件上传选择器 -->
    <!-- <input 
      ref="fileUploadInput" 
      type="file" 
      style="display: none" 
      @change="handleFileUploadChange"
    /> -->

    <!-- 弹窗组件 -->
    <!-- <RepositoryModal 
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
    /> -->
    
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

/* Jupyter编辑器样式 */
.jupyter-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    border-radius: 0;
    
    .jupyter-iframe-wrapper {
      height: calc(100vh - 64px);
    }
  }
  
  .jupyter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
    
    .jupyter-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .jupyter-iframe-wrapper {
    width: 100%;
    height: 700px;
    position: relative;
    
    .loading-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }
    
    .jupyter-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  }
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


