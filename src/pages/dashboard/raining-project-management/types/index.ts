// 表单数据类型
export interface FormData {
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
  enableCodeRepository: boolean
  repositoryType: string
  repositoryUrl: string
}

// 文件树节点类型
export interface FileTreeNode {
  title: string
  key: string
  isLeaf?: boolean
  children?: FileTreeNode[]
}

// 选中文件类型
export interface SelectedFile {
  key: string
  title: string
  content: string
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
  taskName: string
  learningResources: UploadedFile[]
  taskRequirement: string
  referenceAnswer: string
  difficulty: '困难' | '适中' | '简单'
  skillTag: string
  taskHours: string
  kernelLink?: string // 内核链接
  // 评测设置
  evaluationSettings?: {
    timeLimit: string
    studentTaskFile: UploadedFile[]
    evaluationFile: UploadedFile[]
    passJudgment: 'output_compare' | 'rule_match'
    spaceHandling: 'no_ignore' | 'ignore_edge' | 'ignore_all'
    scoreRule: 'all_pass' | 'partial_pass'
    caseType: 'text' | 'file'
    testCases: TestCase[]
  }
}

// 任务关卡表单
export interface TaskLevelForm {
  taskName: string
  learningResources: UploadedFile[]
  taskRequirement: string
  referenceAnswer: string
  difficulty: '困难' | '适中' | '简单'
  skillTag: string
  taskHours: string
  kernelLink?: string // 内核链接
}

// 测试集
export interface TestCase {
  id: string
  input: string
  output: string
}

// 评测设置表单
export interface EvaluationForm {
  timeLimit: string
  studentTaskFile: UploadedFile[]
  evaluationFile: UploadedFile[]
  passJudgment: 'output_compare' | 'rule_match'
  spaceHandling: 'no_ignore' | 'ignore_edge' | 'ignore_all'
  scoreRule: 'all_pass' | 'partial_pass'
  caseType: 'text' | 'file'
  testCases: TestCase[]
}
