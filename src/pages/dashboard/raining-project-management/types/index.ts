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

