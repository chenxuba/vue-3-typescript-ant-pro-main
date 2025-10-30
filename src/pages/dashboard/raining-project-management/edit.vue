<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import RichTextEditor from './components/RichTextEditor.vue'
import { getDicGroupApi, getEnvironmentDicCode } from '@/api/common/dictionary'
import type { DictionaryItem } from '@/api/common/dictionary'
import { getProjectDetailApi, updateProjectApi } from '@/api/project'
import { useDifficultyDictionary, useSubcategoryDictionary } from '@/composables/dictionary'

defineOptions({
  name: 'EditRainingProject',
})

const router = useRouter()
const route = useRoute()

// 项目ID
const projectId = ref<number>()

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)
const loadingEnvironment = ref(false)
const saving = ref(false)

// 项目类型
const projectType = ref(1)

// 完整的项目详情数据（用于更新时合并）
const projectDetail = ref<any>(null)



// 编辑项目表单
const editForm = ref<{
  name: string
  description: string
  difficulty: number | undefined
  environment: string | undefined
  secondType: number | undefined
  classHour: number
  showTaskRequire: boolean
}>({
  name: '',
  description: '',
  difficulty: undefined,
  environment: undefined,
  secondType: undefined,
  classHour: 0,
  showTaskRequire: false,
})

// 验证富文本编辑器内容
const validateDescription = (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject('请输入简介')
  }
  // 检查是否包含图片
  const hasImage = /<img\s+[^>]*src\s*=\s*["'][^"']+["'][^>]*>/i.test(value)
  // 移除所有 HTML 标签和空格，检查是否有实际文本内容
  const textContent = value.replace(/<[^>]*>/g, '').trim()
  
  // 如果既没有图片也没有文本内容，则验证失败
  if (!hasImage && !textContent) {
    return Promise.reject('请输入简介')
  }
  return Promise.resolve()
}

// 表单验证规则
const formRules: any = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  description: [{ required: true, validator: validateDescription, trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  environment: [{ required: true, message: '请选择实验环境', trigger: 'change' }],
  secondType: [{ required: true, message: '请选择小类别', trigger: 'change' }],
}

// 使用难度字典
const difficulty = useDifficultyDictionary()

// 使用小类别字典
const subcategory = useSubcategoryDictionary()

// 实验环境选项数据
const environmentOptionsMap = ref<Record<number, DictionaryItem[]>>({
  1: [], // 全栈环境
  2: [], // JupyterNotebook环境
  3: [], // JupyterLab环境
})

// 获取实验环境选项（根据项目类型不同而不同）
const getEnvironmentOptions = () => {
  const options = environmentOptionsMap.value[projectType.value] || []
  const result = options.map(item => ({
    label: item.name,
    value: item.value,
  }))
  return result
}

// 加载实验环境字典数据
const loadEnvironmentOptions = async (type: number) => {
  if (environmentOptionsMap.value[type].length > 0) {
    // 如果已经加载过，直接返回
    return
  }
  
  try {
    loadingEnvironment.value = true
    const code = getEnvironmentDicCode(type)
    if (!code) return
    
    const data = await getDicGroupApi({ code })
    if (data && data.list) {
      environmentOptionsMap.value[type] = data.list
    }
  } catch (error) {
    message.error('加载实验环境选项失败')
  } finally {
    loadingEnvironment.value = false
  }
}

// 小类别选项（使用字典 hooks）
const getSecondTypeOptions = () => {
  // 如果不是JupyterNotebook环境或JupyterLab环境，返回空数组
  if (projectType.value !== 2 && projectType.value !== 3) return []
  
  return subcategory.options.value
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
    
    // 保存完整的项目详情
    projectDetail.value = detail
    
    // 先设置项目类型并加载字典选项
    if (detail.projectType) {
      projectType.value = detail.projectType
      // 先加载对应的环境选项，再回填表单数据
      await loadEnvironmentOptions(detail.projectType)
    }
    
    // 回填表单数据（必须在字典数据加载完成后）
    editForm.value = {
      name: detail.name || '',
      description: detail.description || '',
      difficulty: detail.difficulty || undefined,
      environment: detail.environment || undefined,
      secondType: detail.secondType || undefined,
      classHour: detail.classHour ? Number(detail.classHour) : 0,
      showTaskRequire: detail.showTaskRequire === 1,
    }
  } catch (error: any) {
    message.error(error.message || '获取项目详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 下一步
const handleNext = async () => {
  // 验证表单
  try {
    await formRef.value?.validate()
  } catch (error) {
    return
  }
  
  // 基础字段必填校验
  if (!editForm.value.name) {
    message.error('请输入名称')
    return
  }
  // 验证简介内容（检查是否有文本或图片）
  const descValue = editForm.value.description || ''
  const hasImage = /<img\s+[^>]*src\s*=\s*["'][^"']+["'][^>]*>/i.test(descValue)
  const descTextContent = descValue.replace(/<[^>]*>/g, '').trim()
  if (!hasImage && !descTextContent) {
    message.error('请输入简介')
    return
  }
  if (!editForm.value.difficulty) {
    message.error('请选择难度')
    return
  }
  if (!editForm.value.environment) {
    message.error('请选择实验环境')
    return
  }
  
  // 如果是 JupyterNotebook 或 JupyterLab 环境，小类别也是必填
  if ((projectType.value === 2 || projectType.value === 3) && !editForm.value.secondType) {
    message.error('请选择小类别')
    return
  }
  
  // 保存修改的数据到后端
  if (!projectId.value || !projectDetail.value) {
    message.error('项目信息缺失')
    return
  }
  
  try {
    saving.value = true
    
    // 合并原始项目数据和修改后的表单数据
    const updateParams = {
      id: projectId.value,
      name: editForm.value.name,
      tag: projectDetail.value.tag || '',
      fieldType: editForm.value.secondType,
      difficulty: editForm.value.difficulty,
      classHour: editForm.value.classHour,
      topCover: projectDetail.value.topCover || '',
      cover: projectDetail.value.cover || '',
      description: editForm.value.description,
      showTaskRequire: editForm.value.showTaskRequire ? 1 : 2,
      authType: projectDetail.value.authType || 1,
      enableCodeRepository: projectDetail.value.enableCodeRepository || false,
      repositoryType: projectDetail.value.repositoryType || '',
      gitUrl: projectDetail.value.gitUrl || '',
      environment: editForm.value.environment,
    }
    
    await updateProjectApi(updateParams)
    message.success('保存成功')
    
    // 根据项目类型跳转到不同的编辑页面
    const routeMap: Record<number, string> = {
      1: '/dashboard/raining-project-management/edit-full-stack', // 全栈环境
      2: '/dashboard/raining-project-management/edit-jupyter-notebook', // JupyterNotebook环境
      3: '/dashboard/raining-project-management/edit-jupyter-lab', // JupyterLab环境
    }
    
    const targetRoute = routeMap[projectType.value]
    if (targetRoute) {
      router.push({
        path: targetRoute,
        query: { id: projectId.value },
      })
    } else {
      message.error('未知的项目类型')
    }
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 监听项目类型变化，清空实验环境和小类别选择，并加载对应的环境选项
watch(projectType, (newType) => {
  editForm.value.environment = undefined
  editForm.value.secondType = undefined
  editForm.value.showTaskRequire = false
  // 加载新类型的环境选项
  loadEnvironmentOptions(newType)
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

// 获取实验环境名称
const getEnvironmentName = computed(() => {
  if (!editForm.value.environment) return ''
  const items = environmentOptionsMap.value[projectType.value] || []
  const item = items.find(opt => opt.value === editForm.value.environment)
  return item?.name || ''
})

// 页面加载时获取项目详情
onMounted(() => {
  // 加载难度字典和小类别字典
  difficulty.load()
  subcategory.load()
  
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
  <div class="edit-project-page">
    <div class="page-header">
      <h2>编辑实训项目</h2>
    </div>

    <a-spin :spinning="loading">
      <div class="page-content">
        <!-- 项目类型显示（编辑时不可更改） -->
        <div class="project-type-section">
          <a-radio-group v-model:value="projectType" class="custom-radio" disabled>
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
            <span v-if="editForm.environment"> 实验环境: {{ getEnvironmentName }}</span>
          </div>

          <a-form
            ref="formRef"
            :model="editForm"
            :rules="formRules"
            layout="horizontal"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item label="名称" name="name" required>
              <a-input v-model:value="editForm.name" placeholder="请输入名称" />
            </a-form-item>

            <a-form-item label="简介" name="description" required>
              <RichTextEditor 
                v-model="editForm.description" 
                placeholder="请输入简介内容"
                :height="200"
              />
            </a-form-item>

            <a-form-item 
              v-if="projectType === 2" 
              label="任务要求" 
              name="showTaskRequire"
            >
              <a-checkbox v-model:checked="editForm.showTaskRequire">
                显示任务要求（勾选后，将简介作为任务要求显示在实践项目挑战页面）
              </a-checkbox>
            </a-form-item>

            <a-form-item label="难度" name="difficulty" required>
              <a-select
                v-model:value="editForm.difficulty"
                placeholder="请选择难度"
                :options="difficulty.options.value"
                :loading="difficulty.loading.value"
              />
            </a-form-item>

            <a-form-item label="实验环境" name="environment" required>
              <a-select
                v-model:value="editForm.environment"
                placeholder="请选择实验环境"
                :options="getEnvironmentOptions()"
                :loading="loadingEnvironment"
              />
            </a-form-item>

            <a-form-item 
              v-if="projectType === 2 || projectType === 3"
              label="小类别" 
              name="secondType" 
              required
            >
              <a-select
                v-model:value="editForm.secondType"
                placeholder="请选择小类别"
                :options="getSecondTypeOptions()"
              />
            </a-form-item>

            <a-form-item label="学时" name="classHour">
              <a-input-number 
                :min="0" 
                class="w-full" 
                v-model:value="editForm.classHour" 
                disabled
                placeholder="配置任务后自动计算" 
              />
            </a-form-item>
          </a-form>
        </div>

        <!-- 底部按钮 -->
        <div class="page-footer">
          <a-button @click="handleBack">返回</a-button>
          <a-button type="primary" :loading="saving" @click="handleNext">下一步</a-button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped lang="less">
.edit-project-page {
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
