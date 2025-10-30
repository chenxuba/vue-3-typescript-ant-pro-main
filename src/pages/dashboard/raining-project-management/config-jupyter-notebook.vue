<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { uploadFileApi } from '@/api/common/file'
import { createProjectApi, updateProjectApi, createProjectTaskApi, updateProjectTaskApi, getPodApi, stopPodApi } from '@/api/project'
import { useFieldCategoryDictionary, useDifficultyDictionary, useSubcategoryDictionary } from '@/composables/dictionary'
import { getDicGroupApi } from '@/api/common/dictionary'
import RichTextEditor from './components/RichTextEditor.vue'

defineOptions({
  name: 'ConfigJupyterNotebook',
})

const router = useRouter()

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

// 评测设置 - 当前标签页
const evaluationActiveTab = ref('settings')

// 评测设置数据
interface EvaluationData {
  openTestValidate: number // 1开 2不开
  testValidateFiles: string // 评测文件URL
  timeLimitM: number | undefined // 评测时长限制（分钟）
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
  openTestValidate: 1, // 默认开启
  testValidateFiles: '', // 评测文件
  timeLimitM: undefined, // 评测时长限制
  scoreRule: 1, // 默认通过全部测试集
  evaluationSetting: 1, // 1-通过所有代码块评测 2-通过指定代码块评测
  testSets: [
    { id: 1, arg: '', answer: '', select: 1 },
    { id: 2, arg: '', answer: '', select: 1 },
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

// 测试集计数器
let testSetIdCounter = 3

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
// const testValidateFileList = ref<any[]>([])

// 自定义上传请求（用于多文件上传）
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
  
//   // 过滤掉正在上传和失败的文件
//   const validFiles = fileList.filter((file: any) => {
//     if (file.status === 'uploading') return true
//     if (file.status === 'done' || !file.status) return true
//     return false
//   })
  
//   testValidateFileList.value = validFiles
  
//   // 上传所有文件
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
//       // 获取所有已上传文件的URL，用逗号拼接
//       const allUrls = validFiles
//         .filter((file: any) => file.url)
//         .map((file: any) => file.url)
//         .join(',')
      
//       evaluationData.value.testValidateFiles = allUrls
//       message.success(`成功上传 ${successUrls.length} 个文件`)
//     }
//   }
// }

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
})

// 图片上传相关
const topCoverUrl = ref<string>('')
const coverUrl = ref<string>('')
const uploadingTopCover = ref(false)
const uploadingCover = ref(false)
const imageUrlPrefix = 'http://101.200.13.193'

// 从路由接收数据并填充表单
onMounted(async () => {
  // 加载领域类别字典、难度字典和小类别字典
  fieldCategory.load()
  difficulty.load()
  subcategory.load()
  
  // 加载实验环境选项
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
    formData.value.classHour = routeData.classHour || ''
    formData.value.showTaskRequire = routeData.showTaskRequire || false

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
  // 当从第一步进入第二步，且还没有创建任务时，自动创建任务
  if (newStep === 1 && oldStep === 0 && !taskId.value && projectId.value) {
    console.log('进入第二步，自动创建任务...')
    await handleCreateTaskAutomatic()
  }
  
  // 当进入第二步，且已有任务ID时，获取Pod配置
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

// 实验环境选项（JupyterNotebook环境）- 从字典加载
const environmentOptions = ref<Array<{ label: string; value: string }>>([])
const loadingEnvironment = ref(false)

// 加载实验环境字典数据
const loadEnvironmentOptions = async () => {
  try {
    loadingEnvironment.value = true
    // JupyterNotebook环境使用 project#environment_2
    const data = await getDicGroupApi({ code: 'project#environment_2' })
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

// 小类别选项已改为使用字典 hooks (subcategory)

// 步骤标题
const steps = [
  { title: '基本信息' },
  { title: '实验内容' },
  { title: '评测设置' },
]

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
      // 提交创建项目
      await handleCreateProject()
    } catch (error) {
      message.error('请完善必填信息')
      scrollToTop()
    }
  } else if (currentStep.value === 1) {
    // 第二步：创建项目任务
    await handleCreateTask()
  }
}

// 创建或更新项目
const handleCreateProject = async () => {
  try {
    // 准备提交的数据
    const submitData: any = {
      projectType: 2, // JupyterNotebook环境实训项目
      environment: formData.value.environment,
      secondType: formData.value.secondType,
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
    currentStep.value = 1
    scrollToTop()
  } catch (error) {
    console.error('操作失败：', error)
    message.error(projectId.value ? '项目更新失败，请稍后重试' : '项目创建失败，请稍后重试')
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
      type: 4, // JupyterNotebook任务类型
      projectId: projectId.value,
      name: 'JupyterNotebook环境实训任务', // 固定名称
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
      // 拼接完整的URL - 基础URL + config中的url
      // const baseUrl = 'http://101.200.13.193'
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

// 创建或更新项目任务（点击下一步时）
const handleCreateTask = async () => {
  try {
    // 检查是否有项目ID
    if (!projectId.value) {
      message.error('项目ID不存在，请先创建项目')
      return
    }

    // 如果已经有任务ID，说明任务已创建，需要停止Pod后跳转到下一步
    if (taskId.value) {
      // 停止Pod
      await handleStopPod()
      
      // 跳转到下一步
      currentStep.value = 2
      scrollToTop()
      return
    }

    // 如果没有任务ID，创建任务
    await handleCreateTaskAutomatic()

    // 跳转到下一步
    currentStep.value = 2
    scrollToTop()
  } catch (error) {
    console.error('任务操作失败：', error)
    message.error('任务操作失败，请稍后重试')
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
      if (!evaluationData.value.timeLimitM || evaluationData.value.timeLimitM <= 0) {
        message.error('请输入有效的评测时长限制')
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
      
      // 校验选中的测试集是否填写了输入内容和期望输出
      for (let i = 0; i < selectedTestSets.length; i++) {
        const testSet = selectedTestSets[i]
        if (!testSet.arg || testSet.arg.trim() === '') {
          message.error(`测试集${i + 1}的输入内容不能为空`)
          return
        }
        if (!testSet.answer || testSet.answer.trim() === '') {
          message.error(`测试集${i + 1}的期望输出不能为空`)
          return
        }
      }
    }
    
    // 准备测试集数据（转换为与 config-full-stack.vue 一致的格式）
    // 注意：需要传递所有测试集，包括未选中的（select=2），不包含id字段
    const testContentArray = evaluationData.value.testSets.map(item => ({
      arg: item.arg,
      answer: item.answer,
      select: item.select, // 1=选中, 2=未选中
    }))
    
    // 更新任务数据
    const taskUpdateData: any = {
      taskId: taskId.value,
      projectId: projectId.value,
      openTestValidate: evaluationData.value.openTestValidate,
      testValidateFiles: evaluationData.value.testValidateFiles,
      timeLimitM: evaluationData.value.timeLimitM,
      scoreRule: evaluationData.value.scoreRule,
      testContent: JSON.stringify(testContentArray), // 转换为 JSON 字符串，与 config-full-stack.vue 一致
    }
    
    console.log('保存评测设置数据：', taskUpdateData)
    
    // 调用更新任务接口
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
    // 验证是否有任务ID
    if (!taskId.value) {
      message.error('任务ID不存在，请重新创建任务')
      return
    }
    
    // 校验参考答案内容是否为空
    if (!referenceAnswerData.value.referenceAnswer || referenceAnswerData.value.referenceAnswer.trim() === '') {
      message.error('请输入参考答案内容')
      return
    }
    
    // 去除HTML标签后检查是否有实际内容
    const textContent = referenceAnswerData.value.referenceAnswer.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      message.error('请输入参考答案内容')
      return
    }
    
    // 更新任务数据
    const taskUpdateData: any = {
      taskId: taskId.value,
      projectId: projectId.value,
      showAnswer: referenceAnswerData.value.showAnswer, // 1是显示、2否隐藏
      prohibitCopyAnswer: referenceAnswerData.value.prohibitCopyAnswer, // 1是禁止、2否不禁止
      referenceAnswer: referenceAnswerData.value.referenceAnswer,
    }
    
    console.log('保存参考答案数据：', taskUpdateData)
    
    // 调用更新任务接口
    await updateProjectTaskApi(taskUpdateData as any)
    referenceAnswerSaved.value = true
    message.success('参考答案保存成功！')
  } catch (error) {
    console.error('参考答案保存失败：', error)
    message.error('参考答案保存失败，请重试')
  }
}

// 完成创建
const handleSave = async () => {
  try {
    // 验证是否有项目ID
    if (!projectId.value) {
      message.error('项目ID不存在，请重新创建项目')
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
    
    // 更新项目状态为已完成
    await updateProjectApi({
      id: projectId.value,
      status: 10, // 设置状态为10（已完成）
    } as any)
    
    message.success('项目创建成功！')
    
    setTimeout(() => {
      router.push('/dashboard/analysis')
    }, 500)
  } catch (error) {
    console.error('完成创建失败：', error)
    message.error('完成创建失败，请重试')
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
</script>

<template>
  <div class="config-jupyter-notebook-page">
    <div class="page-header">
      <h2>JupyterNotebook环境实训项目配置</h2>
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

      <!-- 第二步：实验内容 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="jupyter-container" :class="{ 'fullscreen': isFullscreen }">
          <div class="jupyter-header">
            <h3>Jupyter Notebook 编辑器</h3>
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
                        <a-input-number 
                          v-model:value="evaluationData.timeLimitM" 
                          :min="0"
                          placeholder="请输入评测时长（分钟）" 
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
                    <a-textarea 
                      v-model:value="testSet.arg" 
                      placeholder="请输入输入内容"
                      class="test-set-input"
                      :auto-size="{ minRows: 3 }"
                    />
                    <a-textarea 
                      v-model:value="testSet.answer" 
                      placeholder="请输入期望输出"
                      class="test-set-input"
                      :auto-size="{ minRows: 3 }"
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

      <!-- 底部按钮 -->
      <div class="page-footer">
        <a-button v-if="currentStep === 0" @click="handleBack">返回</a-button>
        <a-button v-else @click="handleBack">上一步</a-button>
        <a-button v-if="currentStep === 2" type="primary" @click="handleSave">完成创建</a-button>
        <a-button v-else type="primary" @click="handleNext">下一步</a-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.config-jupyter-notebook-page {
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

.gap-12px {
  gap: 12px;
}

.gap-16px {
  gap: 16px;
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
</style>

