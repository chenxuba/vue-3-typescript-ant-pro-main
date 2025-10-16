<script setup lang="ts">
import { ref, nextTick } from 'vue'
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
  }
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
