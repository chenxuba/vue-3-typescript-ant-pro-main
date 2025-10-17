<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import RichTextEditor from './components/RichTextEditor.vue'

defineOptions({
  name: 'ConfigJupyterNotebook',
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
      currentStep.value = 1
      scrollToTop()
    } catch (error) {
      message.error('请完善必填信息')
      currentStep.value = 1

    }
  } else if (currentStep.value === 1) {
    currentStep.value = 2
    scrollToTop()
  }
}

// 保存项目
const handleSave = async () => {
  try {
    // 收集所有数据
    const projectData = {
      type: 'JupyterNotebook',
      basicInfo: formData.value,
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

// 滚动到顶部
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// 文件上传处理
const handleBackgroundUpload = (file: File) => {
  formData.value.backgroundImage = file
  return false // 阻止自动上传
}

const handleCoverUpload = (file: File) => {
  formData.value.coverImage = file
  return false // 阻止自动上传
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

            <a-form-item label="学时" name="studyHours" required>
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

      <!-- 第二步：实验内容 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="content-card">
          <a-empty description="实验内容配置开发中..." />
        </div>
      </div>

      <!-- 第三步：评测设置 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="content-card">
          <a-empty description="评测设置配置开发中..." />
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="page-footer">
        <a-button v-if="currentStep === 0" @click="handleBack">返回</a-button>
        <a-button v-else @click="handleBack">上一步</a-button>
        <a-button v-if="currentStep === 2" type="primary" @click="handleSave">保存</a-button>
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

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
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
</style>

