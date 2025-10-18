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

/**
 * 更新项目的请求参数
 */
export interface UpdateProjectParams extends CreateProjectParams {
  id: number // 项目ID
}

/**
 * 更新项目
 * @param params 项目数据
 * @returns 返回更新结果
 */
export async function updateProjectApi(params: UpdateProjectParams): Promise<CreateProjectResponse> {
  const response = await usePost<CreateProjectResponse>('/admin/api/project/update', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('项目更新失败')
}

/**
 * 创建任务关卡的请求参数
 */
export interface CreateProjectTaskParams {
  name: string
  source: string // 学习资源，逗号隔开的字符串
  require: string
  referenceAnswer: string
  difficulty: number
  tag: string
  classHour: string
  jumpUrl?: string
  type: number // 1: 内核链接任务, 2: 选择题任务, 3: 编程任务
  projectId?: number
}

/**
 * 更新任务关卡的请求参数
 */
export interface UpdateProjectTaskParams extends CreateProjectTaskParams {
  taskId: number // 任务关卡ID
}

/**
 * 创建任务关卡的响应数据
 */
export interface CreateProjectTaskResponse {
  taskId: number
  [key: string]: any // 允许其他字段
}

/**
 * 创建任务关卡
 * @param params 任务关卡数据
 * @returns 返回创建结果
 */
export async function createProjectTaskApi(params: CreateProjectTaskParams): Promise<CreateProjectTaskResponse> {
  const response = await usePost<CreateProjectTaskResponse>('/admin/api/projectTask/create', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('任务关卡创建失败')
}

/**
 * 更新任务关卡
 * @param params 任务关卡数据
 * @returns 返回更新结果
 */
export async function updateProjectTaskApi(params: UpdateProjectTaskParams): Promise<CreateProjectTaskResponse> {
  const response = await usePost<CreateProjectTaskResponse>('/admin/api/projectTask/update', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('任务关卡更新失败')
}

