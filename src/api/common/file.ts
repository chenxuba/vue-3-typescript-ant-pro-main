/**
 * 文件上传相关API
 */

/**
 * 文件上传响应数据
 */
export interface FileUploadResponse {
  fileName: string
  fileUrl: string
  fileType: string
}

/**
 * Git文件列表项
 */
export interface GitFileItem {
  fileName: string
  fileUrl: string | null
  fileType: 'dir' | 'file'
}

/**
 * 上传文件
 * @param file 要上传的文件
 * @returns 返回文件URL
 */
export async function uploadFileApi(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await usePost<FileUploadResponse>('/admin/api/file/upload', formData, {
    customDev: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  if (response && response.data) {
    return response.data.fileUrl
  }
  
  throw new Error('文件上传失败')
}

/**
 * 获取Git仓库文件列表
 * @param gitUrl 仓库地址
 * @param path 路径，默认为空字符串（根目录）
 * @returns 返回文件列表
 */
export async function getGitFileListApi(gitUrl: string, path: string = ''): Promise<GitFileItem[]> {
  // usePost 的泛型参数是 data 字段的类型
  const response = await usePost<GitFileItem[]>('/admin/api/gitFile/getFileList', {
    gitUrl,
    path
  }, {
    customDev: true
  })
  
  console.log('API完整响应:', response)
  
  // response 的类型是 ResponseBody<GitFileItem[]>
  // ResponseBody 格式: { code?, result?, data?, msg }
  if (response && response.result === 1 && response.data) {
    console.log('获取到的文件列表:', response.data)
    return response.data
  }
  
  const errorMsg = response?.msg || '获取文件列表失败'
  console.error('获取文件列表失败:', errorMsg, response)
  throw new Error(errorMsg)
}

/**
 * 保存Git文件内容参数
 */
export interface SaveGitFileParams {
  fileContent: string
  fileName: string
  gitUrl: string
  path: string
  commit: string
}

/**
 * 保存Git文件内容
 * @param params 文件保存参数
 * @returns Promise<void>
 */
export async function saveGitFileContentApi(params: SaveGitFileParams): Promise<void> {
  const response = await usePost<any>('/admin/api/gitFile/saveFileContent', params, {
    customDev: true
  })
  
  console.log('保存文件API响应:', response)
  
  if (response && response.result === 1) {
    console.log('文件保存成功')
    return
  }
  
  const errorMsg = response?.msg || '文件保存失败'
  console.error('文件保存失败:', errorMsg, response)
  throw new Error(errorMsg)
}

/**
 * 上传文件到Git仓库
 * @param file 要上传的文件
 * @param gitUrl 仓库地址
 * @param path 文件路径
 * @returns Promise<void>
 */
export async function uploadFileToGitApi(file: File, gitUrl: string, path: string): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('gitUrl', gitUrl)
  formData.append('path', path)
  
  const response = await usePost<any>('/admin/api/gitFile/upload', formData, {
    customDev: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  console.log('上传文件到Git API响应:', response)
  
  if (response && response.result === 1) {
    console.log('文件上传成功')
    return
  }
  
  const errorMsg = response?.msg || '文件上传失败'
  console.error('文件上传失败:', errorMsg, response)
  throw new Error(errorMsg)
}

/**
 * 创建Git文件夹参数
 */
export interface CreateGitDirParams {
  commit: string
  gitUrl: string
  path: string
}

/**
 * 在Git仓库中创建文件夹
 * @param params 创建文件夹参数
 * @returns Promise<void>
 */
export async function createGitDirApi(params: CreateGitDirParams): Promise<void> {
  const response = await usePost<any>('/admin/api/gitFile/createDir', params, {
    customDev: true
  })
  
  console.log('创建文件夹API响应:', response)
  
  if (response && response.result === 1) {
    console.log('文件夹创建成功')
    return
  }
  
  const errorMsg = response?.msg || '文件夹创建失败'
  console.error('文件夹创建失败:', errorMsg, response)
  throw new Error(errorMsg)
}

/**
 * 删除Git文件/文件夹参数
 */
export interface DeleteGitFileParams {
  fileName: string
  gitUrl: string
  path: string
}

/**
 * 删除Git仓库中的文件或文件夹
 * @param params 删除参数
 * @returns Promise<void>
 */
export async function deleteGitFileApi(params: DeleteGitFileParams): Promise<void> {
  const response = await usePost<any>('/admin/api/gitFile/deleteFile', params, {
    customDev: true
  })
  
  console.log('删除文件/文件夹API响应:', response)
  
  if (response && response.result === 1) {
    console.log('删除成功')
    return
  }
  
  const errorMsg = response?.msg || '删除失败'
  console.error('删除失败:', errorMsg, response)
  throw new Error(errorMsg)
}

