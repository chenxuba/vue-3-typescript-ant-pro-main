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

