<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { Question } from '../types'
import RichTextEditor from './RichTextEditor.vue'
import { createTaskQuestionApi, updateTaskQuestionApi } from '@/api/project'

interface Props {
  open: boolean
  question?: Question
  projectId?: number
  taskId?: number
  existingQuestions?: Question[] // 已有的题目列表
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', question: Question): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

// 内部表单数据（用于编辑界面）
interface InternalFormData {
  id: string
  name: string
  options: { id: string; label: string; content: string; isCorrect: boolean }[]
  answerKey: string
}

const formData = ref<InternalFormData>({
  id: '',
  name: '',
  options: [
    { id: '1', label: 'A', content: '', isCorrect: false },
    { id: '2', label: 'B', content: '', isCorrect: false },
    { id: '3', label: 'C', content: '', isCorrect: false },
    { id: '4', label: 'D', content: '', isCorrect: false },
  ],
  answerKey: '',
})

// 自定义校验：检查富文本编辑器内容是否为空
const validateRichText = (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject('请输入内容')
  }
  // 去除HTML标签后检查是否为空
  const text = value.replace(/<[^>]*>/g, '').trim()
  if (!text) {
    return Promise.reject('请输入内容')
  }
  return Promise.resolve()
}

// 表单验证规则
const rules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '请输入题干' },
    { validator: validateRichText },
  ],
  answerKey: [
    { required: true, message: '请输入答案解析', trigger: 'blur' },
  ],
}

// 将 Question 转换为内部表单数据
const convertToInternalFormat = (question: Question): InternalFormData => {
  // 解析 selects 字符串为 options 数组
  let options: { id: string; label: string; content: string; isCorrect: boolean }[] = []
  try {
    const selectsArray = JSON.parse(question.selects || '[]')
    options = selectsArray.map((item: any, index: number) => {
      const key = Object.keys(item)[0]
      return {
        id: (index + 1).toString(),
        label: key,
        content: item[key],
        isCorrect: question.answer.includes(key), // 检查该选项是否为正确答案
      }
    })
  } catch (e) {
    // 如果解析失败，使用默认的空选项
    options = [
      { id: '1', label: 'A', content: '', isCorrect: false },
      { id: '2', label: 'B', content: '', isCorrect: false },
      { id: '3', label: 'C', content: '', isCorrect: false },
      { id: '4', label: 'D', content: '', isCorrect: false },
    ]
  }

  return {
    id: question.id,
    name: question.name,
    options,
    answerKey: question.answerKey,
  }
}

// 监听弹窗打开/关闭
watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.question) {
      // 编辑模式
      formData.value = convertToInternalFormat(props.question)
    } else {
      // 新增模式
      formData.value = {
        id: Date.now().toString(),
        name: '',
        options: [
          { id: '1', label: 'A', content: '', isCorrect: false },
          { id: '2', label: 'B', content: '', isCorrect: false },
          { id: '3', label: 'C', content: '', isCorrect: false },
          { id: '4', label: 'D', content: '', isCorrect: false },
        ],
        answerKey: '',
      }
    }
  }
})

// 取消
const handleCancel = () => {
  emit('update:open', false)
  formRef.value?.resetFields()
}

// 将内部表单数据转换为 Question 格式
const convertToQuestionFormat = (internalData: InternalFormData): Question => {
  // 将 options 数组转换为 selects 字符串
  const selectsArray = internalData.options
    .filter(opt => opt.content.trim()) // 只保留有内容的选项
    .map(opt => ({ [opt.label]: opt.content }))
  
  // 获取正确答案（多个正确答案用逗号分隔）
  const correctAnswers = internalData.options
    .filter(opt => opt.isCorrect)
    .map(opt => opt.label)
    .join(',')

  // 生成 weight 权重值
  let weight = 1
  // 如果是编辑模式，保留原有的 weight
  if (props.question && props.question.weight) {
    weight = props.question.weight
  } else if (props.existingQuestions && props.existingQuestions.length > 0) {
    // 新增模式：从1开始，基于已有题目列表中最后一个题目的 weight + 1
    const maxWeight = Math.max(...props.existingQuestions.map(q => q.weight || 0))
    weight = maxWeight + 1
  }

  return {
    id: internalData.id,
    name: internalData.name,
    answer: correctAnswers,
    answerKey: internalData.answerKey,
    selects: JSON.stringify(selectsArray),
    projectId: props.projectId || props.question?.projectId,
    taskId: props.taskId || props.question?.taskId,
    weight,
  }
}

// 确认
const handleConfirm = async () => {
  try {
    await formRef.value?.validate()
    
    // 检查是否至少填写了一个选项
    const hasOption = formData.value.options.some(opt => opt.content.trim())
    if (!hasOption) {
      message.error('请至少填写一个选项')
      return
    }
    
    // 检查是否至少设置了一个正确答案
    const hasCorrect = formData.value.options.some(opt => opt.isCorrect)
    if (!hasCorrect) {
      message.error('请至少设置一个正确答案')
      return
    }

    // 验证必要参数
    if (!props.projectId) {
      message.error('项目ID不存在')
      return
    }

    if (!props.taskId) {
      message.error('任务关卡ID不存在，请先保存任务关卡')
      return
    }
    
    // 转换为 Question 格式
    const question = convertToQuestionFormat(formData.value)
    // 判断是新增还是编辑模式
    const isEditMode = props.question && props.question.id
    
    console.log('=== 题目参数 ===')
    console.log('操作模式:', isEditMode ? '编辑' : '新增')
    console.log('题目ID (id):', question.id)
    console.log('题目数据:', question)
    console.log('项目ID (projectId):', question.projectId)
    console.log('任务ID (taskId):', question.taskId)
    console.log('排序权重 (weight):', question.weight)
    console.log('已有题目数量:', props.existingQuestions?.length || 0)
    console.log('==================')
    
    try {
      if (isEditMode) {
        // 编辑模式：调用更新接口
        console.log('编辑模式：调用更新接口')
        const response = await updateTaskQuestionApi({
          id: parseInt(question.id), // 将字符串ID转换为数字
          name: question.name,
          answer: question.answer,
          answerKey: question.answerKey,
          selects: question.selects,
          projectId: question.projectId!,
          taskId: question.taskId!,
          weight: question.weight!,
        })
        
        console.log('题目更新成功，返回数据:', response)
        message.success('题目更新成功')
        
        emit('confirm', question)
        emit('update:open', false)
        formRef.value?.resetFields()
      } else {
        // 新增模式：调用接口创建题目
        const response = await createTaskQuestionApi({
          name: question.name,
          answer: question.answer,
          answerKey: question.answerKey,
          selects: question.selects,
          projectId: question.projectId!,
          taskId: question.taskId!,
          weight: question.weight!,
        })
        
        console.log('题目创建成功，返回数据:', response)
        message.success('题目创建成功')
        
        // 更新题目ID
        question.id = response.id.toString()
        
        emit('confirm', question)
        emit('update:open', false)
        formRef.value?.resetFields()
      }
    } catch (error: any) {
      console.error(isEditMode ? '题目更新失败:' : '题目创建失败:', error)
      message.error(error.message || (isEditMode ? '题目更新失败，请重试' : '题目创建失败，请重试'))
    }
  } catch (error) {
    message.error('请完善必填信息')
  }
}

// 切换正确答案（单选模式）
const toggleCorrect = (optionId: string) => {
  // 先将所有选项设为非正确答案
  formData.value.options.forEach(opt => {
    opt.isCorrect = false
  })
  // 将点击的选项设为正确答案
  const option = formData.value.options.find(opt => opt.id === optionId)
  if (option) {
    option.isCorrect = true
  }
}

// 删除选项
const removeOption = (optionId: string) => {
  if (formData.value.options.length <= 2) {
    message.warning('至少保留2个选项')
    return
  }
  const index = formData.value.options.findIndex(opt => opt.id === optionId)
  if (index !== -1) {
    formData.value.options.splice(index, 1)
    // 重新分配标签
    formData.value.options.forEach((opt, idx) => {
      opt.label = String.fromCharCode(65 + idx) // A, B, C, D...
    })
  }
}

// 添加选项
const addOption = () => {
  if (formData.value.options.length >= 10) {
    message.warning('最多添加10个选项')
    return
  }
  const newLabel = String.fromCharCode(65 + formData.value.options.length)
  formData.value.options.push({
    id: Date.now().toString(),
    label: newLabel,
    content: '',
    isCorrect: false
  })
}

// AI出题
// const handleAIGenerate = () => {
//   message.info('AI出题功能开发中...')
// }
</script>

<template>
  <a-modal
    :open="open"
    :title="question ? '编辑题目' : '添加题目'"
    width="900px"
    :mask-closable="false"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="题干" name="name" required>
        <div class="title-input-wrapper">
          <RichTextEditor 
            v-model="formData.name" 
            placeholder="请您输入题干"
            :height="150"
            class="title-input"
          />
          <!-- <a-button type="primary" @click="handleAIGenerate" class="ai-button">
            AI出题
          </a-button> -->
        </div>
      </a-form-item>

      <a-form-item  required>
        <!-- 自定义label内容 -->
        <template #label>
          <span>答案选项 <span class="options-hint ml-12px">点击字母设置正确答案（单选）</span></span>
        </template>
        <div class="options-list">
          <div 
            v-for="option in formData.options" 
            :key="option.id"
            class="option-item"
          >
            <div 
              class="option-label"
              :class="{ 'is-correct': option.isCorrect }"
              @click="toggleCorrect(option.id)"
            >
              {{ option.label }}
            </div>
            <a-input
              v-model:value="option.content"
              placeholder="请输入选项内容"
              class="option-input"
            />
            <CloseCircleOutlined 
              v-if="formData.options.length > 2"
              class="remove-icon" 
              @click="removeOption(option.id)"
            />
            <PlusOutlined
              v-if="option.id === formData.options[formData.options.length - 1].id && formData.options.length < 10"
              class="add-icon"
              @click="addOption"
            />
          </div>
        </div>
      </a-form-item>

      <a-form-item label="答案解析" name="answerKey" required>
        <a-textarea 
          v-model:value="formData.answerKey" 
          placeholder="请输入答案解析"
          :rows="1"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm">保存</a-button>
    </template>
  </a-modal>
</template>

<style scoped lang="less">
.ml-12px {
  margin-left: 12px;
}

.options-hint {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  font-weight: normal;
}

.title-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;

  .title-input {
    flex: 1;
  }

  .ai-button {
    flex-shrink: 0;
  }
}

.options-list {
  .option-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .option-label {
      width: 32px;
      height: 32px;
      background: #f5f5f5;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #40a9ff;
        color: #40a9ff;
      }

      &.is-correct {
        background: #52c41a;
        border-color: #52c41a;
        color: #fff;
      }
    }

    .option-input {
      flex: 1;
    }

    .remove-icon,
    .add-icon {
      flex-shrink: 0;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .remove-icon {
      color: #ff4d4f;

      &:hover {
        color: #ff7875;
      }
    }

    .add-icon {
      color: #1890ff;

      &:hover {
        color: #40a9ff;
      }
    }
  }
}
</style>

