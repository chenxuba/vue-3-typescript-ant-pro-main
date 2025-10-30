// 表单数据类型
export interface FormData {
  name: string
  tag: string
  fieldType?: number
  difficulty: number
  classHour: string
  topCover: string
  cover: string
  description: string
  showTaskRequire: boolean
  authType: number
  enableCodeRepository: boolean
  repositoryType: string
  gitUrl: string
  environment?: number // 实验环境
}

// 文件树节点类型
export interface FileTreeNode {
  title: string
  key: string
  isLeaf?: boolean
  children?: FileTreeNode[]
  fileUrl?: string | null // 文件URL路径
}

// 选中文件类型
export interface SelectedFile {
  key: string
  title: string
  content: string
  fileUrl?: string | null // 文件下载URL
}

// 新建文件表单
export interface NewFileForm {
  fileName: string
  commitMessage: string
  fileContent: string
}

// 新建文件夹表单
export interface NewFolderForm {
  folderName: string
  commitMessage: string
}

// 上传的文件
export interface UploadedFile {
  uid: string
  name: string
  status: 'done' | 'uploading' | 'error'
  url?: string
}

// 任务关卡类型
export interface TaskLevel {
  id: string
  name: string
  type: 'programming' | 'choice' | 'kernel'
  source: string // 学习资源，逗号隔开的字符串
  require: string
  referenceAnswer: string
  difficulty: number
  tag: string
  classHour: string
  jumpUrl?: string // 内嵌链接
  taskId?: number // 任务关卡ID，存在表示已保存到服务器
  weight?: number // 排序权重，默认从小到大
  questions?: Question[] // 选择题题目列表
  // 评测设置
  evaluationSettings?: {
    timeLimitM: number // 评测时长限制（单位：分钟）
    userFiles: UploadedFile[] // 学员任务文件（支持多个）
    testValidateFiles: UploadedFile[] // 评测执行文件（支持多个）
    testValidateSh: string // 评测执行命令
    passType: number // 通关判定：1-实际输出与期望输出对比 2-实际输出满足规则
    passTypeRule?: string // 通关判定规则（当passType为2时使用）
    blankCode: number // 空格处理：1-不忽略空格 2-忽略首尾空格 3-忽略所有空格
    scoreRule: number // 得分规则：1-通过全部测试集 2-通过部分测试集
    testValidateType: number // 用例类型：1-文本 2-文件
    testContent: TestCase[]  // 测试集
  }
}

// 任务关卡表单
export interface TaskLevelForm {
  name: string
  source: string // 学习资源，逗号隔开的字符串
  require: string
  referenceAnswer: string
  difficulty: number
  tag: string
  classHour: string
  jumpUrl?: string // 内嵌链接
  type: number // 1: 编程, 2: 选择题, 4: 内嵌链接
  projectId?: number // 项目ID
  taskId?: number // 任务关卡ID，存在表示已保存过
  weight?: number // 排序权重，默认从小到大
}

// 测试集
export interface TestCase {
  id: string
  arg: string  // 输入内容
  answer: string  // 期望输出
  select: number  // 1选中 2未选中
}

// 评测设置表单
export interface EvaluationForm {
  timeLimitM: number // 评测时长限制（单位：分钟）
  userFiles: UploadedFile[] // 学员任务文件（支持多个）
  testValidateFiles: UploadedFile[] // 评测执行文件（支持多个）
  testValidateSh: string // 评测执行命令
  passType: number // 通关判定：1-实际输出与期望输出对比 2-实际输出满足规则
  passTypeRule?: string // 通关判定规则（当passType为2时使用）
  blankCode: number // 空格处理：1-不忽略空格 2-忽略首尾空格 3-忽略所有空格
  scoreRule: number // 得分规则：1-通过全部测试集 2-通过部分测试集
  testValidateType: number // 用例类型：1-文本 2-文件
  testContent: TestCase[]  // 测试集
}

// 选择题选项
export interface QuestionOption {
  id: string
  label: string // A, B, C, D
  content: string
  isCorrect: boolean
}

// 选择题题目
export interface Question {
  id: string
  name: string // 题干
  answer: string // 答案
  answerKey: string // 答案解析
  selects: string // 选项（格式为数组字符串：[{"A":"选项内容A"},{"B":"选项内容B"},{"C":"选项内容C"},{"D":"选项内容D"}]）
  projectId?: number // 项目ID
  taskId?: number // 任务关卡ID
  weight?: number // 排序权重
}

// 实验环境表单
export interface ExperimentEnvironmentForm {
  dockerImage: number // 实验镜像（从 create 页面传递的 environment 值）
  viewTypes: number[] // 实验界面（多选：1-代码编辑器 2-命令行终端 3-容器内服务）
  secondType?: string // 附带环境
  taskId?: string // 任务关卡
  codeType?: string // 编程语言
  shellBegin?: string // 开启时触发命令
  containerPort?: string // 容器端口
  containerPath?: string // 路由（选填）
}
