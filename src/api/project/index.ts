/**
 * 项目相关API
 */

/**
 * 创建项目的请求参数
 */
export interface CreateProjectParams {
  name: string
  tag: string
  fieldType?: number
  difficulty: number
  classHour?: string
  topCover: string
  cover: string
  description: string
  showTaskRequire: number // 1: 显示, 2: 不显示
  authType: number
  enableCodeRepository: boolean
  repositoryType?: string
  gitUrl?: string
}

/**
 * 创建项目的响应数据
 */
export interface CreateProjectResponse {
  id: number
  name: string
  categoryId: number | null
  description: string
  authType: number
  date: string | null
  status: number | null
  type: number | null
  topCover: string
  cover: string
  userId: number
  orgId: number | null
  orgName: string | null
  tag: string
  difficulty: number
  backgroundImage: string | null
  fieldType: number
  connectName: string | null
  connectUnit: string | null
  connectPhone: string | null
  connectEmail: string | null
  startTime: string | null
  endTime: string | null
  weight: number | null
  codeType: number | null
  mode: number | null
  createTime: number
  updateTime: number
  userCount: number | null
  classHour: string | null
  gitUrl: string | null
  score: number | null
  secondType: number | null
  showTaskRequire: number
  projectType: number | null
}

/**
 * 创建项目
 * @param params 项目数据
 * @returns 返回创建结果
 */
export async function createProjectApi(params: CreateProjectParams): Promise<CreateProjectResponse> {
  const response = await usePost<CreateProjectResponse>('/admin/api/project/create', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('项目创建失败')
}

