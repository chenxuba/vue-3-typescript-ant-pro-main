import { ref, computed, type Ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import type { TaskLevel, TaskLevelForm, EvaluationForm, Question, UploadedFile } from '../types'
import { uploadFileApi } from '@/api/common/file'
import { createProjectTaskApi, updateProjectTaskApi } from '@/api/project'

export function useTaskLevel(projectId?: Ref<number | null>) {
  // 状态
  const taskLevels = ref<TaskLevel[]>([])
  const selectedTaskLevelId = ref<string>('')
  const currentTab = ref('task')
  const taskLevelFormRef = ref<FormInstance>()
  const evaluationFormRef = ref<FormInstance>()

  // 任务关卡表单数据
  const taskLevelFormData = ref<TaskLevelForm>({
    name: '',
    source: '', // 学习资源，逗号隔开的字符串
    require: '',
    referenceAnswer: '',
    difficulty: 2,
    tag: '',
    classHour: '',
    jumpUrl: '',
    type: 3, // 默认为编程任务
    projectId: projectId?.value || undefined,
  })

  // 用于上传组件的临时文件列表
  const learningResourceFileList = ref<UploadedFile[]>([])

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
    name: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
    ],
    source: [
      { required: true, message: '请上传学习资源', trigger: 'change' },
    ],
    require: [
      { required: true, message: '' },
      { validator: validateRichText },
    ],
    referenceAnswer: [
      { required: true, message: '' },
      { validator: validateRichText },
    ],
    difficulty: [
      { required: true, message: '请选择难度系数', trigger: 'change' },
    ],
    tag: [
      { required: true, message: '请输入技能标签', trigger: 'blur' },
    ],
    classHour: [
      { required: true, message: '请输入任务学时', trigger: 'blur' },
    ],
    jumpUrl: [
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
    // 检查是否有未保存的关卡
    const hasUnsavedLevel = taskLevels.value.some(level => !level.taskId)
    if (hasUnsavedLevel) {
      message.warning('请先保存当前未保存的任务关卡，再添加新关卡')
      return
    }
    
    // 检查当前选中的关卡是否是已保存的选择题任务，且没有题目
    if (selectedTaskLevelId.value) {
      const currentLevel = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
      if (currentLevel && currentLevel.type === 'choice' && currentLevel.taskId) {
        // 是已保存的选择题任务，检查是否有题目
        if (!currentLevel.questions || currentLevel.questions.length === 0) {
          message.warning('请至少新增一条题目')
          currentTab.value = 'questions' // 切换到题目标签页
          return
        }
      }
    }
    
    const typeNames = {
      programming: '编程实训任务关卡',
      choice: '选择题实训任务关卡',
      kernel: '内核链接实训任务关卡',
    }
    
    const newLevel: TaskLevel = {
      id: Date.now().toString(),
      name: `第${taskLevels.value.length + 1}关：${typeNames[type]}`,
      type,
      source: '', // 字符串类型
      require: '',
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
      
      // 重新编号所有关卡
      taskLevels.value.forEach((level, idx) => {
        // 使用正则表达式匹配 "第X关：" 格式
        const match = level.name.match(/^第\d+关：(.+)$/)
        if (match) {
          // 如果匹配到标准格式，保留冒号后面的内容，重新编号
          level.name = `第${idx + 1}关：${match[1]}`
        } else {
          // 如果不是标准格式，检查是否有冒号
          const colonIndex = level.name.indexOf('：')
          if (colonIndex !== -1) {
            // 有冒号但不是标准格式，保留冒号后面的内容
            const nameSuffix = level.name.substring(colonIndex + 1)
            level.name = `第${idx + 1}关：${nameSuffix}`
          } else {
            // 完全自定义的名称，在前面添加编号
            level.name = `第${idx + 1}关：${level.name}`
          }
        }
      })
      
      // 处理选中状态
      if (selectedTaskLevelId.value === id) {
        // 如果删除的是当前选中的关卡，切换到第一个关卡
        selectedTaskLevelId.value = taskLevels.value[0]?.id || ''
        if (selectedTaskLevelId.value) {
          loadTaskLevelFormData(selectedTaskLevelId.value)
        }
      } else if (selectedTaskLevelId.value) {
        // 如果删除的不是当前选中的关卡，刷新当前选中关卡的表单数据（因为名称可能变化了）
        loadTaskLevelFormData(selectedTaskLevelId.value)
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
      // 将逗号隔开的字符串转换为文件数组，用于上传组件显示
      if (level.source) {
        const urls = level.source.split(',').filter(url => url.trim())
        learningResourceFileList.value = urls.map((url, index) => {
          const trimmedUrl = url.trim()
          return {
            uid: `${Date.now()}-${index}`,
            name: trimmedUrl.substring(trimmedUrl.lastIndexOf('/') + 1),
            status: 'done' as const,
            url: trimmedUrl,
          }
        })
      } else {
        learningResourceFileList.value = []
      }
      
      // 将 type 字符串转换为数字：kernel -> 1, choice -> 2, programming -> 3
      const typeMap: Record<string, number> = {
        kernel: 1,
        choice: 2,
        programming: 3,
      }
      
      taskLevelFormData.value = {
        name: level.name,
        source: level.source || '', // 直接使用字符串
        require: level.require,
        referenceAnswer: level.referenceAnswer,
        difficulty: level.difficulty,
        tag: level.tag,
        classHour: level.classHour,
        jumpUrl: level.jumpUrl || '',
        type: typeMap[level.type] || 3,
        projectId: projectId?.value || undefined,
        taskId: level.taskId, // 加载已保存的 taskId
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
      
      // 只保存表单中与 TaskLevel 类型匹配的字段，避免覆盖 type 等关键字段
      // 注意：不更新 level.name，保持左侧列表中的关卡名称不变
      // level.name = taskLevelFormData.value.name
      level.source = taskLevelFormData.value.source
      level.require = taskLevelFormData.value.require
      level.referenceAnswer = taskLevelFormData.value.referenceAnswer
      level.difficulty = taskLevelFormData.value.difficulty
      level.tag = taskLevelFormData.value.tag
      level.classHour = taskLevelFormData.value.classHour
      level.jumpUrl = taskLevelFormData.value.jumpUrl
      // 保存 taskId（如果有）
      if (taskLevelFormData.value.taskId) {
        level.taskId = taskLevelFormData.value.taskId
      }
      
      // 恢复 questions 数据
      level.questions = existingQuestions
      // 保存评测设置数据
      level.evaluationSettings = { ...evaluationFormData.value }
    }
  }

  // 自定义上传请求
  const handleLearningResourceCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options
    
    try {
      // 调用上传接口
      const fileUrl = await uploadFileApi(file)
      
      // 上传成功
      onSuccess({ url: fileUrl }, file)
    } catch (error) {
      // 上传失败
      onError(error)
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
    
    // 更新临时文件列表
    learningResourceFileList.value = fileList.map((f: any) => ({
      uid: f.uid,
      name: f.name,
      status: f.status,
      url: f.response?.url || f.url || '',
    }))
    
    // 将文件列表转换为逗号隔开的字符串保存到表单数据，不添加前缀
    const urls = learningResourceFileList.value
      .filter(f => f.url)
      .map(f => f.url!)
      .join(',')
    taskLevelFormData.value.source = urls
    
    // 触发表单验证
    taskLevelFormRef.value?.validateFields(['source'])
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
      
      console.log('准备提交的 taskLevelFormData:', taskLevelFormData.value)
      
      let response
      // 根据是否有 taskId 决定创建还是更新
      if (taskLevelFormData.value.taskId) {
        // 更新任务关卡
        response = await updateProjectTaskApi({
          ...taskLevelFormData.value,
          taskId: taskLevelFormData.value.taskId,
        })
        console.log('任务关卡更新成功，返回数据:', response)
        message.success('更新成功')
      } else {
        // 创建任务关卡
        response = await createProjectTaskApi(taskLevelFormData.value)
        console.log('任务关卡创建成功，返回数据:', response)
        
        // 保存返回的 taskId 到表单数据
        if (response.taskId) {
          taskLevelFormData.value.taskId = response.taskId
          console.log('已保存 taskId:', response.taskId)
        }
        
        message.success('保存成功')
      }
      
      // 保存到本地状态
      if (selectedTaskLevelId.value) {
        saveTaskLevelFormData(selectedTaskLevelId.value)
      }
    } catch (error) {
      console.error('保存任务关卡失败:', error)
      message.error('请完善必填信息')
    }
  }

  // 重置任务关卡表单
  const resetTaskLevel = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置表单吗？所有未保存的数据将会丢失。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 获取当前任务关卡的 type
        let currentType = 3 // 默认为编程任务
        if (selectedTaskLevelId.value) {
          const level = taskLevels.value.find(l => l.id === selectedTaskLevelId.value)
          if (level) {
            const typeMap: Record<string, number> = {
              kernel: 1,
              choice: 2,
              programming: 3,
            }
            currentType = typeMap[level.type] || 3
          }
        }
        
        // 重置任务关卡表单数据为初始值
        taskLevelFormData.value = {
          name: '',
          source: '',
          require: '',
          referenceAnswer: '',
          difficulty: 2,
          tag: '',
          classHour: '',
          jumpUrl: '',
          type: currentType,
          projectId: projectId?.value || undefined,
        }
        
        // 重置评测设置表单数据为初始值
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
        
        // 清空学习资源文件列表
        learningResourceFileList.value = []
        
        // 清除所有表单校验
        taskLevelFormRef.value?.clearValidate()
        evaluationFormRef.value?.clearValidate()
        
        message.success('已重置')
      },
    })
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
    learningResourceFileList,
    
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
    handleLearningResourceCustomRequest,
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

