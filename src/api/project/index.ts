/**
 * 项目相关API
 */

/**
 * 获取项目列表的请求参数
 */
export interface GetProjectListParams {
  limit: number // 每页条数
  page: number // 当前页
  startNum?: number // 起始数
  name?: string // 项目名称
  orgName?: string // 主办单位
  environment?: string // 实验环境
  orderbyFiled?: string // 排序字段，如 "name:desc,github:asc"
}

/**
 * 项目列表项数据结构
 */
export interface ProjectListItem {
  id: number
  name: string
  tag: string
  fieldType?: number
  difficulty: number
  classHour?: string
  topCover: string
  cover: string
  description: string
  authType: number
  status?: number
  createTime: number
  updateTime: number
  connectUnit?: string // 主办单位
  [key: string]: any // 允许其他字段
}

/**
 * 获取项目列表的响应数据
 */
export interface GetProjectListResponse {
  result: number
  msg: string
  data: {
    list: ProjectListItem[]
    count: number // 数据总条数
    total: number
    page: number
    limit: number
    hasMore: number
    totalPage: number
  }
}

/**
 * 获取项目列表（分页）
 * @param params 查询参数
 * @returns 返回项目列表数据
 */
export async function getProjectListPagerApi(params: GetProjectListParams): Promise<GetProjectListResponse['data']> {
  const response = await usePost<GetProjectListResponse['data']>('/admin/api/project/getListPager', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  return {
    list: [],
    count: 0,
    total: 0,
    page: 1,
    limit: 10,
    hasMore: 0,
    totalPage: 0,
  }
}

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
 * 更新项目的请求参数（实验环境）
 */
export interface UpdateProjectEnvironmentParams {
  title: string // 环境名称
  dockerImage: number // 实验镜像
  viewTypes: string // 实验界面（逗号隔开的字符串，如："1,2,3"）
  secondType?: string // 附带环境
  taskId?: number // 任务关卡
  codeType?: string // 编程语言
  shellBegin?: string // 开启时触发命令
  containerPort?: string // 容器端口
  containerPath?: string // 路由
  projectId: number // 项目ID
  envisDel?: number // 是否删除：0-保存/更新 1-删除，默认0
}

/**
 * 更新项目的请求参数
 */
export interface UpdateProjectParams extends CreateProjectParams {
  id: number // 项目ID
  status?: number // 项目状态：1-已发布, 0-未发布
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
 * 获取项目详情的请求参数
 */
export interface GetProjectDetailParams {
  id: number // 项目ID
}

/**
 * 获取项目详情的响应数据
 */
export interface GetProjectDetailResponse {
  result: number
  msg: string
  data: ProjectListItem
}

/**
 * 获取项目详情
 * @param params 包含项目ID的参数
 * @returns 返回项目详情数据
 */
export async function getProjectDetailApi(params: GetProjectDetailParams): Promise<ProjectListItem> {
  const response = await usePost<ProjectListItem>('/admin/api/project/get', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('获取项目详情失败')
}

/**
 * 删除项目的请求参数
 */
export interface DeleteProjectParams {
  id: number // 项目ID
}

/**
 * 删除项目的响应数据
 */
export interface DeleteProjectResponse {
  result: number
  msg: string
  [key: string]: any
}

/**
 * 删除项目
 * @param params 删除参数
 * @returns 返回删除结果
 */
export async function deleteProjectApi(params: DeleteProjectParams): Promise<DeleteProjectResponse> {
  const response = await usePost<DeleteProjectResponse>('/admin/api/project/del', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('项目删除失败')
}

/**
 * 更新项目实验环境
 * @param params 实验环境数据
 * @returns 返回更新结果
 */
export async function updateProjectEnvironmentApi(params: UpdateProjectEnvironmentParams): Promise<CreateProjectResponse> {
  const response = await usePost<CreateProjectResponse>('/admin/api/projectTask/update', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('实验环境更新失败')
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
  type: number // 1: 编程, 2: 选择题, 4: 内嵌链接
  projectId?: number
  weight?: number // 排序权重，默认从小到大
  // 评测设置相关字段（编程任务使用）
  timeLimitM?: number // 评测时长限制（单位：分钟）
  userFiles?: string // 学员任务文件（多个文件URL，逗号隔开）
  testValidateFiles?: string // 评测执行文件（多个文件URL，逗号隔开）
  passType?: number // 通关判定：1-实际输出与期望输出对比 2-实际输出满足规则
  blankCode?: number // 空格处理：1-不忽略空格 2-忽略首尾空格 3-忽略所有空格
  scoreRule?: number // 得分规则：1-通过全部测试集 2-通过部分测试集
  testValidateSh?: string // 评测执行命令
  testValidateType?: number // 用例类型：1-文本 2-文件
  testContent?: string // 测试集（JSON字符串格式）
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
 * 获取任务关卡列表的请求参数
 */
export interface GetProjectTaskListParams {
  projectId: number // 项目ID
  orderbyFiled?: string // 排序字段，如 "task_id:asc"
}

/**
 * 项目任务关卡数据结构
 */
export interface ProjectTaskItem {
  taskId: number
  name: string
  source: string
  require: string
  referenceAnswer: string
  difficulty: number
  tag: string
  classHour: string
  jumpUrl?: string
  type: number
  projectId: number
  weight?: number // 排序权重，默认从小到大
  // 评测设置相关字段
  timeLimitM?: number
  userFiles?: string
  testValidateFiles?: string
  passType?: number
  blankCode?: number
  scoreRule?: number
  testValidateSh?: string
  testValidateType?: number
  testContent?: string
  // 题目列表
  questions?: any[]
  // 实验环境
  environment?: any
  [key: string]: any
}

/**
 * 获取任务关卡列表
 * @param params 查询参数
 * @returns 返回任务关卡列表
 */
export async function getProjectTaskListApi(params: GetProjectTaskListParams): Promise<ProjectTaskItem[] | any> {
  const response = await usePost<any>('/admin/api/projectTask/getList', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  return []
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

/**
 * 获取Pod配置的请求参数
 */
export interface GetPodParams {
  taskId: number // 任务ID
}

/**
 * Pod配置数据结构
 */
export interface PodConfig {
  podId: string
  url: string
}

/**
 * Pod数据结构
 */
export interface PodData {
  podId: number
  name: string
  userId: number
  podImage: string
  limitM: number
  createTime: number
  updateTime: number
  taskId: number
  beginTime: number
  endTime: number
  input: string | null
  output: string | null
  status: number
  podPort: string | null
  podConfig: string
  podType: string | null
  config: PodConfig
}

/**
 * 获取Pod配置的响应数据
 */
export interface GetPodResponse {
  result: number
  msg: string
  data: PodData
}

/**
 * 获取Pod配置
 * @param params 包含taskId的参数
 * @returns 返回Pod配置数据
 */
export async function getPodApi(params: GetPodParams): Promise<PodData> {
  const response = await usePost<PodData>('/admin/api/runningPod/getPod', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('获取Pod配置失败')
}

/**
 * 停止Pod的请求参数
 */
export interface StopPodParams {
  taskId: number // 任务ID
}

/**
 * 停止Pod的响应数据
 */
export interface StopPodResponse {
  result: number
  msg: string
  data?: any
}

/**
 * 停止Pod
 * @param params 包含taskId的参数
 * @returns 返回停止结果
 */
export async function stopPodApi(params: StopPodParams): Promise<StopPodResponse> {
  const response = await usePost<StopPodResponse>('/admin/api/runningPod/stop', params, {
    customDev: true,
  })
  
  if (response) {
    return response as any
  }
  
  throw new Error('停止Pod失败')
}

/**
 * 获取项目用户列表的请求参数
 */
export interface GetProjectUserListParams {
  limit: number
  page: number
  projectId?: number
  // 筛选条件
  userId?: number | string // 用户编号
  nickName?: string // 用户姓名
  orgName?: string // 单位
  status?: string // 参训状态（已完成/进行中/未开始）
  currentTask?: number // 当前任务（用于筛选参训状态）
  // 其他可选参数
  createTime?: number
  joinTime?: number
  id?: number
  orderbyFiled?: string // 排序字段，如 "name:desc,github:asc"
  startNum?: number
  updateTime?: number
}

/**
 * 项目用户列表项数据结构
 */
export interface ProjectUserListItem {
  id: number
  projectId: number
  userId: number
  joinTime: number
  currentTask: number
  createTime: number
  updateTime: number
  nickName: string
  avatar: string | null
  orgName: string
}

/**
 * 获取项目用户列表的响应数据
 */
export interface GetProjectUserListResponse {
  result: number
  msg: string
  data: {
    count: number
    cursor: number
    hasMore: number
    limit: number
    list: ProjectUserListItem[]
    page: number
    total: number
    totalPage: number
  }
  ext: Record<string, any>
}

/**
 * 获取项目用户列表（分页）- 参训整体情况
 * @param params 查询参数
 * @returns 返回项目用户列表数据
 */
export async function getProjectUserListPagerApi(params: GetProjectUserListParams): Promise<GetProjectUserListResponse['data']> {
  const response = await usePost<GetProjectUserListResponse['data']>('/admin/api/projectUser/getListPager', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  return {
    count: 0,
    cursor: 0,
    hasMore: 0,
    limit: params.limit || 20,
    list: [],
    page: params.page || 1,
    total: 0,
    totalPage: 0,
  }
}

/**
 * AI润色接口
 * @param content 需要润色的内容
 * @returns 返回润色后的内容
 */
export interface AIEmbellishParams {
  content: string
}

export interface AIEmbellishResponse {
  result: number
  msg: string
  data: string
}

export async function aiEmbellishApi(content: string): Promise<string> {
  const response = await usePost<string>('/admin/api/ai/aiEmbellish', { content }, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  return content
}

/**
 * AI出题接口
 * @param content 题干内容
 * @returns 返回生成的题目数据
 */
export interface AICreateQuestionParams {
  content: string
}

export interface AICreateQuestionResponse {
  result: number
  msg: string
  data: {
    title?: string // 题干
    options?: string[] // 选项数组
    answer?: string // 正确答案
    analysis?: string // 答案解析
  }
}

export async function aiCreateQuestionApi(content: string): Promise<AICreateQuestionResponse['data']> {
  const response = await usePost<AICreateQuestionResponse['data']>('/admin/api/ai/aiCreateQuestion', { content }, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  throw new Error('AI出题失败')
}

/**
 * 获取任务完成情况列表的请求参数
 */
export interface GetProjectUserTaskListParams {
  beginTime?: number
  createTime?: number
  endTime?: number
  id?: number
  limit: number
  orderbyFiled?: string // 排序字段，如 "name:desc,github:asc"
  page: number
  projectId: number // 项目ID（必填）
  score?: number
  startNum?: number
  status?: number
  taskContent?: string
  taskId: number // 任务ID（必填）
  updateTime?: number
  userId?: number | string
  nickName?: string // 用户姓名（筛选条件）
  orgName?: string // 单位（筛选条件）
}

/**
 * 任务完成情况列表项数据结构
 */
export interface ProjectUserTaskListItem {
  beginTime: number
  createTime: number
  endTime: number
  id: number
  projectId: number
  score: number
  status: number // 10: 已完成
  taskContent: string
  taskId: number
  updateTime: number
  userId: number
  nickName: string // 用户姓名
  orgName: string // 单位
}

/**
 * 获取任务完成情况列表的响应数据
 */
export interface GetProjectUserTaskListResponse {
  result: number
  msg: string
  data: {
    count: number
    cursor: number
    hasMore: number
    limit: number
    list: ProjectUserTaskListItem[]
    page: number
    total: number
    totalPage: number
  }
}

/**
 * 获取任务完成情况列表（分页）
 * @param params 查询参数
 * @returns 返回任务完成情况列表数据
 */
export async function getProjectUserTaskListPagerApi(params: GetProjectUserTaskListParams): Promise<GetProjectUserTaskListResponse['data']> {
  const response = await usePost<GetProjectUserTaskListResponse['data']>('/admin/api/projectUserTask/getListPager', params, {
    customDev: true,
  })
  
  if (response && response.data) {
    return response.data
  }
  
  return {
    count: 0,
    cursor: 0,
    hasMore: 0,
    limit: params.limit || 20,
    list: [],
    page: params.page || 1,
    total: 0,
    totalPage: 0,
  }
}

