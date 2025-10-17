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

// Jupyter编辑器
const jupyterUrl = 'http://101.200.13.193:8888/jupyter3a88a3/lab?token=jupyter3a88a3'
const isFullscreen = ref(false)

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
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
      evaluation: evaluationData.value,
      referenceAnswer: referenceAnswerData.value,
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
            <iframe 
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
</style>

