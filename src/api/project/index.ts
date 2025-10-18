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

/**
 * 创建题目的请求参数
 */
export interface CreateTaskQuestionParams {
  name: string // 题干
  answer: string // 答案
  answerKey: string // 答案解析
  selects: string // 选项（JSON字符串）
  projectId: number // 项目ID
  taskId: number // 任务关卡ID
  weight: number // 排序权重
}

/**
 * 创建题目的响应数据
 */
export interface CreateTaskQuestionResponse {
  id: number
  [key: string]: any // 允许其他字段
}

/**
 * 创建题目
 * @param params 题目数据
 * @returns 返回创建结果
 */
export async function createTaskQuestionApi(params: CreateTaskQuestionParams): Promise<CreateTaskQuestionResponse> {
  const response = await usePost<CreateTaskQuestionResponse>('/admin/api/taskQuestion/create', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('题目创建失败')
}

/**
 * 获取题目列表的请求参数
 */
export interface GetTaskQuestionListParams {
  projectId: number // 项目ID
  taskId: number // 任务关卡ID
}

/**
 * 题目数据结构
 */
export interface TaskQuestionItem {
  id: number
  name: string
  content: string | null
  selects: string
  answer: string
  answerKey: string
  weight: number
  projectId: number
  taskId: number
  tag: string | null
  classHour: string | null
  config: string | null
  createTime: number
  updateTime: number
  userId: number
}

/**
 * 获取题目列表的响应数据
 */
export interface GetTaskQuestionListResponse {
  result: number
  msg: string
  data: TaskQuestionItem[]
}

/**
 * 获取题目列表
 * @param params 查询参数
 * @returns 返回题目列表
 */
export async function getTaskQuestionListApi(params: GetTaskQuestionListParams): Promise<TaskQuestionItem[]> {
  const response = await usePost<TaskQuestionItem[]>('/admin/api/taskQuestion/getList', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  return []
}

/**
 * 更新题目的请求参数
 */
export interface UpdateTaskQuestionParams {
  id: number // 题目ID
  name: string // 题干
  answer: string // 答案
  answerKey: string // 答案解析
  selects: string // 选项（JSON字符串）
  projectId: number // 项目ID
  taskId: number // 任务关卡ID
  weight: number // 排序权重
}

/**
 * 更新题目的响应数据
 */
export interface UpdateTaskQuestionResponse {
  id: number
  [key: string]: any // 允许其他字段
}

/**
 * 更新题目
 * @param params 题目数据
 * @returns 返回更新结果
 */
export async function updateTaskQuestionApi(params: UpdateTaskQuestionParams): Promise<UpdateTaskQuestionResponse> {
  const response = await usePost<UpdateTaskQuestionResponse>('/admin/api/taskQuestion/update', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('题目更新失败')
}

/**
 * 删除题目的请求参数
 */
export interface DeleteTaskQuestionParams {
  id: number // 题目ID
}

/**
 * 删除题目的响应数据
 */
export interface DeleteTaskQuestionResponse {
  [key: string]: any
}

/**
 * 删除题目
 * @param params 删除参数
 * @returns 返回删除结果
 */
export async function deleteTaskQuestionApi(params: DeleteTaskQuestionParams): Promise<DeleteTaskQuestionResponse> {
  const response = await usePost<DeleteTaskQuestionResponse>('/admin/api/taskQuestion/del', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('题目删除失败')
}

