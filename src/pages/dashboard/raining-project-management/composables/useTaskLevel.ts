import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import type { TaskLevel, TaskLevelForm, EvaluationForm, Question } from '../types'

export function useTaskLevel() {
  // 状态
  const taskLevels = ref<TaskLevel[]>([])
  const selectedTaskLevelId = ref<string>('')
  const currentTab = ref('task')
  const taskLevelFormRef = ref<FormInstance>()
  const evaluationFormRef = ref<FormInstance>()

  // 任务关卡表单数据
  const taskLevelFormData = ref<TaskLevelForm>({
    taskName: '',
    learningResources: [],
    taskRequirement: '',
    referenceAnswer: '',
    difficulty: 2,
    tag: '',
    classHour: '',
    kernelLink: '',
  })

  // 评测设置表单数据
  const evaluationFormData = ref<EvaluationForm>({
    timeLimit: '',
    studentTaskFile: [],
    evaluationFile: [],
    passJudgment: 'output_compare',
    spaceHandling: 'no_ignore',
    scoreRule: 'all_pass',
    caseType: 'text',
    testCases: [],
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

  // 任务关卡表单验证规则
  const taskLevelFormRules: Record<string, Rule[]> = {
    taskName: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
    ],
    learningResources: [
      { required: true, message: '请上传学习资源', trigger: 'change', type: 'array', min: 1 },
    ],
    taskRequirement: [
      { required: true, message: '' },
      { validator: validateRichText },
    ],
    referenceAnswer: [
      { required: true, message: '请输入参考答案' },
      { validator: validateRichText },
    ],
    difficulty: [
      { required: true, message: '请选择难度系数', trigger: 'change' },
    ],
    tag: [
      { required: true, message: '请输入技能标签', trigger: 'blur' },
    ],
    kernelLink: [
      { required: true, message: '请输入内嵌链接', trigger: 'blur' },
    ],
  }

  // 评测设置表单验证规则
  const evaluationFormRules: Record<string, Rule[]> = {
    timeLimit: [
      { required: true, message: '请输入评测时长限制', trigger: 'blur' },
    ],
    studentTaskFile: [
      { required: true, message: '请上传学员任务文件', trigger: 'change', type: 'array', min: 1 },
    ],
    evaluationFile: [
      { required: true, message: '请上传评测执行文件', trigger: 'change', type: 'array', min: 1 },
    ],
  }

  // 判断当前任务类型是否为内核链接
  const isKernelTask = computed(() => {
    if (!selectedTaskLevelId.value) return false
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    return level?.type === 'kernel'
  })

  // 判断当前任务类型是否为选择题
  const isChoiceTask = computed(() => {
    if (!selectedTaskLevelId.value) return false
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    return level?.type === 'choice'
  })

  // 判断当前任务类型是否为编程任务
  const isProgrammingTask = computed(() => {
    if (!selectedTaskLevelId.value) return false
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    return level?.type === 'programming'
  })

  // 添加任务关卡
  const addTaskLevel = (type: 'programming' | 'choice' | 'kernel') => {
    const typeNames = {
      programming: '编程实训任务关卡',
      choice: '选择题实训任务关卡',
      kernel: '内核链接实训任务关卡',
    }
    
    const newLevel: TaskLevel = {
      id: Date.now().toString(),
      name: `第${taskLevels.value.length + 1}关：${typeNames[type]}`,
      type,
      taskName: '',
      learningResources: [],
      taskRequirement: '',
      referenceAnswer: '',
      difficulty: 2,
      tag: '',
      classHour: '',
    }
    
    taskLevels.value.push(newLevel)
    selectedTaskLevelId.value = newLevel.id
    currentTab.value = 'task' // 切换到第一个标签页（关联任务）
    loadTaskLevelFormData(newLevel.id)
    message.success('任务关卡添加成功')
  }

  // 删除任务关卡
  const deleteTaskLevel = (id: string) => {
    const index = taskLevels.value.findIndex(level => level.id === id)
    if (index !== -1) {
      taskLevels.value.splice(index, 1)
      if (selectedTaskLevelId.value === id) {
        selectedTaskLevelId.value = taskLevels.value[0]?.id || ''
        if (selectedTaskLevelId.value) {
          loadTaskLevelFormData(selectedTaskLevelId.value)
        }
      }
      message.success('任务关卡删除成功')
    }
  }

  // 选择任务关卡
  const selectTaskLevel = (id: string) => {
    if (selectedTaskLevelId.value && selectedTaskLevelId.value !== id) {
      saveTaskLevelFormData(selectedTaskLevelId.value)
    }
    selectedTaskLevelId.value = id
    currentTab.value = 'task' // 切换到第一个标签页（关联任务）
    loadTaskLevelFormData(id)
  }

  // 加载任务关卡表单数据
  const loadTaskLevelFormData = (id: string) => {
    const level = taskLevels.value.find(l => l.id === id)
    if (level) {
      taskLevelFormData.value = {
        taskName: level.taskName,
        learningResources: level.learningResources,
        taskRequirement: level.taskRequirement,
        referenceAnswer: level.referenceAnswer,
        difficulty: level.difficulty,
        tag: level.tag,
        classHour: level.classHour,
        kernelLink: level.kernelLink || '',
      }
      
      // 加载评测设置数据
      if (level.evaluationSettings) {
        evaluationFormData.value = { ...level.evaluationSettings }
      } else {
        // 重置为默认值
        evaluationFormData.value = {
          timeLimit: '',
          studentTaskFile: [],
          evaluationFile: [],
          passJudgment: 'output_compare',
          spaceHandling: 'no_ignore',
          scoreRule: 'all_pass',
          caseType: 'text',
          testCases: [],
        }
      }
    }
  }

  // 保存任务关卡表单数据
  const saveTaskLevelFormData = (id: string) => {
    const level = taskLevels.value.find(l => l.id === id)
    if (level) {
      // 保存 questions 数据，避免被覆盖
      const existingQuestions = level.questions
      Object.assign(level, taskLevelFormData.value)
      // 恢复 questions 数据
      level.questions = existingQuestions
      // 保存评测设置数据
      level.evaluationSettings = { ...evaluationFormData.value }
    }
  }

  // 学习资源文件上传处理
  const handleLearningResourceUpload = (info: any) => {
    const { file, fileList } = info
    
    if (file.status === 'done') {
      message.success(`${file.name} 文件上传成功`)
    } else if (file.status === 'error') {
      message.error(`${file.name} 文件上传失败`)
    }
    
    taskLevelFormData.value.learningResources = fileList.map((f: any) => ({
      uid: f.uid,
      name: f.name,
      status: f.status,
      url: f.response?.url || f.url,
    }))
    
    // 触发表单验证
    taskLevelFormRef.value?.validateFields(['learningResources'])
  }

  // 保存任务关卡
  const saveTaskLevel = async () => {
    try {
      // 根据任务类型验证不同的表单
      if (isKernelTask.value || isChoiceTask.value) {
        // 内核链接任务和选择题任务只验证关联任务表单
        await taskLevelFormRef.value?.validate()
      } else if (isProgrammingTask.value) {
        // 编程任务需要验证关联任务表单和评测设置表单
        await Promise.all([
          taskLevelFormRef.value?.validate(),
          evaluationFormRef.value?.validate()
        ])
      }
      if (selectedTaskLevelId.value) {
        saveTaskLevelFormData(selectedTaskLevelId.value)
      }
      message.success('保存成功')
    } catch (error) {
      message.error('请完善必填信息')
    }
  }

  // 重置任务关卡表单
  const resetTaskLevel = () => {
    if (selectedTaskLevelId.value) {
      loadTaskLevelFormData(selectedTaskLevelId.value)
    }
    // 清除所有表单校验
    taskLevelFormRef.value?.clearValidate()
    evaluationFormRef.value?.clearValidate()
    message.info('已重置')
  }

  // 学员任务文件上传处理
  const handleStudentTaskFileUpload = (info: any) => {
    const { fileList } = info
    evaluationFormData.value.studentTaskFile = fileList.map((f: any) => ({
      uid: f.uid,
      name: f.name,
      status: f.status,
      url: f.response?.url || f.url,
    }))
    
    // 触发表单验证
    evaluationFormRef.value?.validateFields(['studentTaskFile'])
  }

  // 评测执行文件上传处理
  const handleEvaluationFileUpload = (info: any) => {
    const { fileList } = info
    evaluationFormData.value.evaluationFile = fileList.map((f: any) => ({
      uid: f.uid,
      name: f.name,
      status: f.status,
      url: f.response?.url || f.url,
    }))
    
    // 触发表单验证
    evaluationFormRef.value?.validateFields(['evaluationFile'])
  }

  // 新增测试集
  const addTestCase = () => {
    evaluationFormData.value.testCases.push({
      id: Date.now().toString(),
      input: '',
      output: '',
    })
  }

  // 删除测试集
  const removeTestCase = (id: string) => {
    const index = evaluationFormData.value.testCases.findIndex(tc => tc.id === id)
    if (index !== -1) {
      evaluationFormData.value.testCases.splice(index, 1)
      message.success('删除成功')
    }
  }

  // 一键删除测试用例
  const clearAllTestCases = () => {
    evaluationFormData.value.testCases = []
    message.success('已清空所有测试用例')
  }

  // 下载测试用例模板
  const downloadTemplate = () => {
    message.info('下载功能开发中...')
  }

  // 批量上传测试用例
  const batchUploadTestCases = () => {
    message.info('批量上传功能开发中...')
  }

  // 获取当前任务关卡的题目列表
  const getCurrentQuestions = computed(() => {
    if (!selectedTaskLevelId.value) return []
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    return level?.questions || []
  })

  // 添加题目
  const addQuestion = (question: Question) => {
    if (!selectedTaskLevelId.value) return
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    if (level) {
      if (!level.questions) {
        level.questions = []
      }
      level.questions.push(question)
      message.success('题目添加成功')
    }
  }

  // 删除题目
  const deleteQuestion = (questionId: string) => {
    if (!selectedTaskLevelId.value) return
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    if (level && level.questions) {
      const index = level.questions.findIndex(q => q.id === questionId)
      if (index !== -1) {
        level.questions.splice(index, 1)
        message.success('题目删除成功')
      }
    }
  }

  // 更新题目
  const updateQuestion = (question: Question) => {
    if (!selectedTaskLevelId.value) return
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    if (level && level.questions) {
      const index = level.questions.findIndex(q => q.id === question.id)
      if (index !== -1) {
        level.questions[index] = question
        message.success('题目更新成功')
      }
    }
  }

  // 更新题目顺序
  const updateQuestionsOrder = (questions: Question[]) => {
    if (!selectedTaskLevelId.value) return
    const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
    if (level) {
      level.questions = questions
    }
  }

  return {
    // 状态
    taskLevels,
    selectedTaskLevelId,
    currentTab,
    taskLevelFormRef,
    evaluationFormRef,
    taskLevelFormData,
    evaluationFormData,
    
    // 验证规则
    taskLevelFormRules,
    evaluationFormRules,
    
    // 计算属性
    isKernelTask,
    isChoiceTask,
    isProgrammingTask,
    
    // 方法
    addTaskLevel,
    deleteTaskLevel,
    selectTaskLevel,
    saveTaskLevel,
    resetTaskLevel,
    handleLearningResourceUpload,
    handleStudentTaskFileUpload,
    handleEvaluationFileUpload,
    addTestCase,
    removeTestCase,
    clearAllTestCases,
    downloadTemplate,
    batchUploadTestCases,
    
    // 题目管理
    getCurrentQuestions,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    updateQuestionsOrder,
  }
}

