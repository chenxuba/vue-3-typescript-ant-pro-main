<script setup lang="ts">
import { ref, watch, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

defineOptions({
  name: 'CreateRainingProject',
})

const router = useRouter()

// 富文本编辑器
const editorRef = shallowRef()
const valueHtml = ref('')

// 项目类型
const projectType = ref(1)

// 新建项目表单
const createForm = ref({
  name: '',
  description: '',
  difficulty: undefined,
  environment: undefined,
  subCategory: undefined,
  studyHours: '配置任务后自动计算',
  showTaskRequirement: false,
})

// 难度选项
const difficultyOptions = [
  { label: '简单', value: '简单' },
  { label: '适中', value: '适中' },
  { label: '困难', value: '困难' },
]

// 实验环境选项（根据项目类型不同而不同）
const getEnvironmentOptions = () => {
  if (projectType.value === 1) {
    return [
      { label: 'Python3.6', value: 'Python3.6' },
      { label: 'Python3.13', value: 'Python3.13' },
      { label: 'Python3.12/VNC', value: 'Python3.12/VNC' },
    ]
  } else if (projectType.value === 2) {
    return [
      { label: 'Python3/Jupyter', value: 'Python3/Jupyter' },
      { label: 'Python-GPU/upyter', value: 'Python-GPU/upyter' },
      { label: 'Paddle/Jupyter', value: 'Paddle/Jupyter' },
    ]
  } else if (projectType.value === 3) {
    return [
      { label: 'Python3.6', value: 'Python3.6' },
      { label: 'Python3.13', value: 'Python3.13' },
    ]
  }
  return []
}

// 小类别选项（根据实验环境不同而不同）
const getSubCategoryOptions = () => {
  // 如果不是JupyterNotebook环境，返回空数组
  if (projectType.value !== 2) return []
  
  // 如果没有选择实验环境，返回空数组（但选择框仍然显示）
  if (!createForm.value.environment) return []
  
  // 根据不同的实验环境返回不同的小类别
  const subCategoryMap: Record<string, any[]> = {
    'Python3/Jupyter': [
      { label: 'Bwapp', value: 'Bwapp' },
      { label: 'CSS', value: 'CSS' },
      { label: 'DataTurks', value: 'DataTurks' },
    ],
    'Python-GPU/upyter': [
      { label: 'GPU-Bwapp', value: 'GPU-Bwapp' },
      { label: 'GPU-CSS', value: 'GPU-CSS' },
    ],
    'Paddle/Jupyter': [
      { label: 'Paddle-A', value: 'Paddle-A' },
      { label: 'Paddle-B', value: 'Paddle-B' },
    ],
  }
  
  return subCategoryMap[createForm.value.environment] || []
}

// 返回
const handleBack = () => {
  router.back()
}

// 下一步
const handleNext = () => {
  console.log('下一步', {
    projectType: projectType.value,
    ...createForm.value,
  })
  
  // 根据项目类型跳转到不同的配置页面
  if (projectType.value === 1) {
    router.push('/dashboard/raining-project-management/config-full-stack')
  } else if (projectType.value === 2) {
    router.push('/dashboard/raining-project-management/config-jupyter-notebook')
  } else if (projectType.value === 3) {
    router.push('/dashboard/raining-project-management/config-jupyter-lab')
  }
}

// 监听项目类型变化，清空实验环境和小类别选择
watch(projectType, () => {
  createForm.value.environment = undefined
  createForm.value.subCategory = undefined
  createForm.value.showTaskRequirement = false
})

// 监听实验环境变化，清空小类别选择
watch(() => createForm.value.environment, () => {
  createForm.value.subCategory = undefined
})

// 获取项目类型名称
const getProjectTypeName = computed(() => {
  const typeMap: Record<number, string> = {
    1: '全栈环境',
    2: 'JupyterNotebook环境',
    3: 'JupyterLab环境',
  }
  return typeMap[projectType.value] || ''
})

// 富文本编辑器配置
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'bold',
    'italic',
    'underline',
    'through',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    '|',
    'insertLink',
    'insertImage',
    '|',
    'undo',
    'redo',
  ],
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入简介内容',
  MENU_CONF: {},
}

// 编辑器创建完成
const handleCreated = (editor: any) => {
  editorRef.value = editor
}

// 编辑器内容变化
const handleChange = (editor: any) => {
  createForm.value.description = editor.getHtml()
}

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<template>
  <div class="create-project-page">
    <div class="page-header">
      <h2>新建实训项目</h2>
    </div>

    <div class="page-content">
      <!-- 项目类型选择 -->
      <div class="project-type-section">
        <a-radio-group v-model:value="projectType" class="custom-radio">
          <a-radio :value="1">全栈环境实训项目</a-radio>
          <a-radio :value="2">JupyterNotebook环境实训项目</a-radio>
          <a-radio :value="3">JupyterLab环境实训项目</a-radio>
        </a-radio-group>
      </div>

      <div class="project-type-desc">
        <template v-if="projectType === 1">
          多功能新型实战项目模式，支持图形化桌面、Web IDE、命令行、提供仿真拟真等种实验场景，适用于各类复杂工程项目研发。
        </template>
        <template v-else-if="projectType === 2">
          多功能实时交互实验模式，支持实时代码、数学方程、可视化和MarkDown等。 适用于数据清理、数值模拟、统计建模、机器学习等系列实验。
        </template>
        <template v-else-if="projectType === 3">
          多功能实时交互实验模式，支持实时代码、数学方程、可视化和MarkDown等。 适用于数据清理、数值模拟、统计建模、机器学习等系列实验。
        </template>
      </div>

      <!-- 项目信息表单 -->
      <div class="project-form-section">
        <div class="form-title">
          {{ getProjectTypeName }}实训项目
          <span v-if="createForm.environment"> 实验环境: {{ createForm.environment }}</span>
        </div>

        <a-form
          :model="createForm"
          layout="horizontal"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-form-item label="名称" name="name" required>
            <a-input v-model:value="createForm.name" placeholder="请输入名称" />
          </a-form-item>

          <a-form-item label="简介" name="description">
            <div class="editor-container">
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="'default'"
                class="editor-toolbar"
              />
              <Editor
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="'default'"
                class="editor-content"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </div>
          </a-form-item>

          <a-form-item 
            v-if="projectType === 2" 
            label="任务要求" 
            name="showTaskRequirement"
          >
            <a-checkbox v-model:checked="createForm.showTaskRequirement">
              显示任务要求（勾选后，将简介作为任务要求显示在实践项目挑战页面）
            </a-checkbox>
          </a-form-item>

          <a-form-item label="难度" name="difficulty" required>
            <a-select
              v-model:value="createForm.difficulty"
              placeholder="请选择难度"
              :options="difficultyOptions"
            />
          </a-form-item>

          <a-form-item label="实验环境" name="environment" required>
            <div style="display: flex; gap: 16px;">
              <a-select
                v-model:value="createForm.environment"
                placeholder="请选择实验环境"
                :options="getEnvironmentOptions()"
                style="flex: 1;"
              />
              <a-select
                v-if="projectType === 2"
                v-model:value="createForm.subCategory"
                placeholder="请选择小类别"
                :options="getSubCategoryOptions()"
                style="flex: 1;"
              />
            </div>
          </a-form-item>

          <a-form-item label="学时" name="studyHours">
            <a-input v-model:value="createForm.studyHours" disabled />
          </a-form-item>
        </a-form>
      </div>

      <!-- 底部按钮 -->
      <div class="page-footer">
        <a-button @click="handleBack">返回</a-button>
        <a-button type="primary" @click="handleNext">下一步</a-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.create-project-page {
  background: #f0f2f5;
  min-height: 100vh;

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

    .project-type-section {
      padding: 24px 0;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;

      .ant-radio-group {
        display: flex;
        justify-content: center;
        gap: 48px;

        .ant-radio-wrapper {
          font-size: 14px;
        }
      }
    }

    .project-type-desc {
      padding: 16px 0;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      line-height: 1.6;
      border-bottom: 1px solid #f0f0f0;
    }

    .project-form-section {
      margin-top: 32px;

      .form-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 32px;
        color: rgba(0, 0, 0, 0.85);
        padding-left: 120px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
      }

      .ant-form-item {
        margin-bottom: 24px;

        :deep(.ant-form-item-label) {
          font-weight: 500;

          label {
            &::before {
              display: none !important;
            }
          }
        }

        :deep(.ant-form-item-required) {
          &::before {
            content: '*';
            color: #ff4d4f;
            margin-right: 4px;
          }
        }

        .editor-container {
          border: 1px solid #d9d9d9;
          border-radius: 2px;
          transition: all 0.3s;

          &:hover {
            border-color: #40a9ff;
          }

          &:focus-within {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
          }

          .editor-toolbar {
            border-bottom: 1px solid #e8e8e8;
            background: #fafafa;
          }

          .editor-content {
            height: 200px !important;
            overflow-y: auto;
            background: #fff;

            :deep(.w-e-text-container) {
              background: #fff;
            }

            :deep(.w-e-text-placeholder) {
              color: #bfbfbf;
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
      margin-top: 32px;
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

