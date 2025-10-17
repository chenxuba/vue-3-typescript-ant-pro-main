<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { Question } from '../types'
import RichTextEditor from './RichTextEditor.vue'

interface Props {
  open: boolean
  question?: Question
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', question: Question): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<Question>({
  id: '',
  title: '',
  options: [
    { id: '1', label: 'A', content: '', isCorrect: false },
    { id: '2', label: 'B', content: '', isCorrect: false },
    { id: '3', label: 'C', content: '', isCorrect: false },
    { id: '4', label: 'D', content: '', isCorrect: false },
  ],
  explanation: '',
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
  title: [
    { required: true, message: '请输入题干' },
    { validator: validateRichText },
  ],
  explanation: [
    { required: true, message: '请输入答案解析', trigger: 'blur' },
  ],
}

// 监听弹窗打开/关闭
watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.question) {
      // 编辑模式
      formData.value = JSON.parse(JSON.stringify(props.question))
    } else {
      // 新增模式
      formData.value = {
        id: Date.now().toString(),
        title: '',
        options: [
          { id: '1', label: 'A', content: '', isCorrect: false },
          { id: '2', label: 'B', content: '', isCorrect: false },
          { id: '3', label: 'C', content: '', isCorrect: false },
          { id: '4', label: 'D', content: '', isCorrect: false },
        ],
        explanation: '',
      }
    }
  }
})

// 取消
const handleCancel = () => {
  emit('update:open', false)
  formRef.value?.resetFields()
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
    
    // 创建深拷贝，避免resetFields后数据被清空
    const questionCopy = JSON.parse(JSON.stringify(formData.value))
    
    emit('confirm', questionCopy)
    emit('update:open', false)
    formRef.value?.resetFields()
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
      <a-form-item label="题干" name="title" required>
        <div class="title-input-wrapper">
          <RichTextEditor 
            v-model="formData.title" 
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

      <a-form-item label="答案解析" name="explanation" required>
        <a-textarea 
          v-model:value="formData.explanation" 
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

