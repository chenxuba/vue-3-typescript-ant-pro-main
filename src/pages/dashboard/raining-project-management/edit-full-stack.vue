<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import { uploadFileApi } from '@/api/common/file'
import { getProjectDetailApi, updateProjectApi } from '@/api/project'
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
import type { FormData, NewFileForm, NewFolderForm } from './types'

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
  name: 'EditFullStack',
})

const router = useRouter()
const route = useRoute()

// 项目ID
const projectId = ref<number | null>(null)

// 当前步骤
const currentStep = ref(0)

// 加载状态
const loading = ref(false)

// 表单引用
const formRef = ref<FormInstance>()
const trainingScopeFormRef = ref<FormInstance>()

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

// 实验环境相关
const selectedEnvironment = ref<number | undefined>(undefined)

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

// 领域类别选项
const domainCategoryOptions = [
  { label: '人工智能', value: 1 },
  { label: '大数据', value: 2 },
  { label: '云计算', value: 3 },
  { label: 'Web开发', value: 4 },
]

// 仓库类型选项
const repositoryTypeOptions = [
  { label: '切换仓库', value: '切换仓库' },
  { label: '代码仓库', value: '代码仓库' },
  { label: '私密代码仓库', value: '私密代码仓库' },
]

// 仓库地址是否锁定
const isRepositoryUrlLocked = ref(false)

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

// 获取实验环境名称
const getEnvironmentName = () => {
  const environmentMap: Record<number, string> = {
    1: 'Python3.6',
    2: 'Python3.13',
    3: 'Python3.12/VNC',
  }
  return environmentMap[selectedEnvironment.value || 1] || 'Python3.6'
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
    
    console.log('项目详情:', detail)
    
    // 回填基本信息表单数据
    formData.value = {
      name: detail.name || '',
      tag: detail.tag || '',
      fieldType: detail.fieldType,
      difficulty: detail.difficulty || 1,
      classHour: detail.classHour || '',
      topCover: detail.topCover || '',
      cover: detail.cover || '',
      description: detail.description || '',
      showTaskRequire: detail.showTaskRequire === 1,
      authType: detail.authType || 1,
      enableCodeRepository: detail.gitUrl ? true : (detail.enableCodeRepository || false),
      repositoryType: detail.repositoryType || '代码仓库',
      gitUrl: detail.gitUrl || '',
      environment: detail.environment,
    }
    
    // 设置图片预览
    if (detail.topCover) {
      topCoverUrl.value = imageUrlPrefix + detail.topCover
    }
    if (detail.cover) {
      coverUrl.value = imageUrlPrefix + detail.cover
    }
    
    // 设置实验环境
    selectedEnvironment.value = detail.environment || 1
    
    // 如果有仓库地址，自动打开开关并锁定输入框
    if (detail.gitUrl) {
      isRepositoryUrlLocked.value = true
    }
    
  } catch (error: any) {
    console.error('获取项目详情失败：', error)
    message.error(error.message || '获取项目详情失败')
    router.back()
  } finally {
    loading.value = false
  }
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
    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('仓库文件查询成功')
    console.log('模拟请求仓库地址：', formData.value.gitUrl)
  } catch (error) {
    message.error('仓库文件查询失败')
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
      scrollToTop()
    }
  } else if (currentStep.value === 1) {
    // 第二步：代码仓库验证并更新项目
    if (formData.value.enableCodeRepository) {
      // 如果开启了代码仓库，验证仓库地址
      if (!formData.value.gitUrl || formData.value.gitUrl.trim() === '') {
        message.error('请输入仓库地址')
        return
      }
    }
    // 保存项目
    await handleUpdateProject()
  }
}

// 更新项目
const handleUpdateProject = async () => {
  try {
    loading.value = true
    
    // 准备提交的数据
    const submitData: any = {
      id: projectId.value,
      projectType: 1, // 全栈环境实训项目
      environment: selectedEnvironment.value,
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
    }

    // 如果开启了代码仓库，才传递仓库相关信息
    if (formData.value.enableCodeRepository) {
      submitData.repositoryType = formData.value.repositoryType
      submitData.gitUrl = formData.value.gitUrl
    }

    console.log('更新项目数据：', submitData)

    await updateProjectApi(submitData)
    message.success('项目更新成功！')
    
    // 返回列表页
    setTimeout(() => {
      router.push('/dashboard/analysis')
    }, 500)
  } catch (error: any) {
    console.error('更新失败：', error)
    message.error(error.message || '项目更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取项目详情
onMounted(() => {
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
  <div class="edit-full-stack-page">
    <div class="page-header">
      <h2>编辑全栈环境实训项目</h2>
    </div>

    <a-spin :spinning="loading">
      <div class="page-content">
        <!-- 步骤条 -->
        <div class="steps-container">
          <a-steps :current="currentStep" class="custom-steps">
            <a-step title="基本信息" />
            <a-step title="代码仓库" />
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
                    <a-select v-model:value="formData.fieldType" placeholder="请选择领域类别" :options="domainCategoryOptions" />
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
                  v-model:expanded-keys="expandedKeys" @select="handleSelectFile" @menu-click="handleTreeNodeMenuClick" />

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
                  :highlighted-code="highlightedCode" />
                <div v-else class="empty-area">
                  在左侧代码仓库区域点击目录打开文件
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="page-footer">
          <a-button @click="handleBack">{{ currentStep === 0 ? '返回' : '上一步' }}</a-button>
          <a-button type="primary" :loading="loading" @click="handleNext">
            {{ currentStep === 1 ? '完成' : '下一步' }}
          </a-button>
        </div>
      </div>
    </a-spin>

    <!-- 弹窗组件 -->
    <RepositoryModal v-model:open="showRepositoryModal" @confirm="handleConfirmRepository"
      @cancel="handleCancelRepository" />
    <!-- 新建文件弹窗 -->
    <NewFileModal v-model:open="showNewFileModal" :parent-path="currentParentPath" @confirm="handleConfirmNewFile" />

    <!-- 新建文件夹弹窗 -->
    <NewFolderModal v-model:open="showNewFolderModal" :parent-path="currentFolderParentPath"
      @confirm="handleConfirmNewFolder" />
  </div>
</template>

<style scoped lang="less">
.edit-full-stack-page {
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
</style>

