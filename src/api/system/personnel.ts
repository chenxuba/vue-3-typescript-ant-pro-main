interface PersonnelModel {
  id?: string | number
  /**
   * 用户编号
   */
  userCode: string
  /**
   * 用户姓名
   */
  userName: string
  /**
   * 单位
   */
  organization: string
  /**
   * 单位ID
   */
  organizationId?: string | number
  /**
   * 是否自然人
   */
  isNaturalPerson: boolean
  /**
   * 手机号
   */
  phone?: string
  /**
   * 邮箱
   */
  email: string
  /**
   * 状态 (启用/禁用)
   */
  status: boolean
}

/**
 * 全量用户数据模型（来自 /web/api/user/getAllUsers）
 */
interface AllUserModel {
  /**
   * 操作员ID
   */
  operatorID: number
  /**
   * 用户ID
   */
  userID: string
  /**
   * 操作员名称
   */
  operatorName: string
  /**
   * 操作员标识
   */
  operatorTag: string
  /**
   * 组织名称
   */
  orgName: string
  /**
   * 组织ID
   */
  orgID: number
  /**
   * 组织编码
   */
  orgCode: string
  /**
   * 组织序列
   */
  orgSEQ: string
  /**
   * 租户ID
   */
  tenantId: number
  /**
   * 租户名称
   */
  tenantName: string
  /**
   * 租户组织ID
   */
  tenantOrgId: number
  /**
   * 租户组织名称
   */
  tenantOrgName: string
  /**
   * 性别 (1: 男, 2: 女)
   */
  gender: number
  /**
   * 邮箱
   */
  oEmail: string
  /**
   * 身份证号
   */
  idCard: string
  /**
   * 头像
   */
  headPic: string
  /**
   * 是否继续教育要求
   */
  isCtnEduRequire: number
  /**
   * 是否党员
   */
  isCpc: number
  /**
   * 是否实名
   */
  isreal: number
  /**
   * 状态
   */
  status: number
  /**
   * 员工编码
   */
  empCode: string
  /**
   * 创建时间
   */
  createTime: string
  /**
   * 最后修改时间
   */
  lastModifyTime: string
  /**
   * 状态修改时间
   */
  statusModifyDate: string
}

/**
 * 全量用户查询参数
 */
interface AllUsersQueryParams {
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 起始数量
   */
  startNum: number
  /**
   * 排序字段 (例如: "name:desc,github:asc")
   */
  orderbyFiled?: string
  /**
   * 组织名称
   */
  orgName?: string
  /**
   * 操作员名称
   */
  operatorName?: string
  /**
   * 操作员ID
   */
  operatorID?: number
}

/**
 * 全量用户列表返回数据
 */
interface AllUsersResult {
  /**
   * 总数
   */
  total: number
  /**
   * 每页数量
   */
  pageSize: number
  /**
   * 当前页码
   */
  currentPage: number
  /**
   * 用户列表
   */
  list: AllUserModel[]
}

/**
 * 全量用户接口响应（适配实际后端返回格式）
 */
interface AllUsersResponse {
  result: number
  msg: string
  data: AllUsersResult
}

interface UserDetailModel {
  operatorID?: number
  operatorName?: string
  operatorTag?: string
  userID?: string
  mobileNO?: string
  gender?: number
  orgName?: string
  orgID?: number
  orgCode?: string
  orgSEQ?: string
  tenantId?: number
  tenantName?: string
  tenantOrgId?: number
  tenantOrgName?: string
  empCode?: string
  regDate?: string
  birthDate?: string
  createTime?: string
  lastModifyTime?: string
  status?: number
  isCtnEduRequire?: number
  isCpc?: number
  isreal?: number
}

interface UserDetailResponse {
  result: number
  msg: string
  data: UserDetailModel
}

interface PersonnelQueryParams {
  /**
   * 用户编号
   */
  userCode?: string
  /**
   * 用户姓名
   */
  userName?: string
  /**
   * 单位
   */
  organization?: string
  /**
   * 单位ID
   */
  organizationId?: string | number
  /**
   * 分页参数
   */
  pageNum?: number
  pageSize?: number
}

interface PersonnelListResult {
  list: PersonnelModel[]
  total: number
}

/**
 * 获取人员列表
 */
export async function getPersonnelListApi(params?: PersonnelQueryParams) {
  return usePost<PersonnelListResult>('/personnel/list', params)
}

/**
 * 更新人员状态
 */
export async function updatePersonnelStatusApi(id: string | number, status: boolean) {
  return usePut(`/personnel/${id}/status`, { status })
}

/**
 * 获取人员详情
 */
export async function getPersonnelDetailApi(id: string | number) {
  return useGet<PersonnelModel>(`/personnel/${id}`)
}

/**
 * 获取全量用户列表
 * 调用接口: /web/api/user/getAllUsers
 * 注意：此接口返回格式特殊，直接返回 AllUsersResponse 结构
 */
export async function getAllUsersApi(params: AllUsersQueryParams): Promise<AllUsersResponse> {
  // 由于此接口返回格式特殊，需要直接处理响应
  const response = await usePost<any>('/web/api/user/getAllUsers', params,{
    customDev:true
  })
  // 否则假设后端直接返回完整格式
  return response as unknown as AllUsersResponse
}

/**
 * 获取单个用户详情
 */
export async function getUserDetailApi(operatorID: number | string): Promise<UserDetailResponse> {
  const response = await usePost<any>(
    '/web/api/user/getUser',
    { operatorID },
    {
      customDev: true,
    }
  )
  return response as unknown as UserDetailResponse
}

export type {
  PersonnelModel,
  PersonnelQueryParams,
  PersonnelListResult,
  AllUserModel,
  AllUsersQueryParams,
  AllUsersResult,
  AllUsersResponse,
  UserDetailModel,
}

