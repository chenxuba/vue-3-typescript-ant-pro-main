interface RoleAssignmentModel {
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
   * 授予的角色
   */
  roles: string[]
  /**
   * 角色ID列表
   */
  roleIds?: (string | number)[]
}

interface RoleAssignmentQueryParams {
  /**
   * 用户姓名
   */
  nickName?: string
  /**
   * 角色名称
   */
  roleName?: string
  /**
   * 分页参数
   */
  pageNum?: number
  pageSize?: number
}

interface RoleUserListPagerParams {
  /**
   * 用户姓名
   */
  nickName?: string
  /**
   * 角色名称
   */
  roleName?: string
  /**
   * 分页参数
   */
  page?: number
  limit?: number
}

interface RoleAssignmentListResult {
  list: RoleAssignmentModel[]
  total: number
}

/**
 * 角色用户列表项
 */
interface RoleUserItem {
  id: number
  roleId: number
  roleName: string | null
  userId: number
  nickName: string | null
  orgName: string | null
}

/**
 * 角色用户列表分页结果
 */
interface RoleUserListPagerResult {
  count: number
  total: number
  page: number
  limit: number
  totalPage: number
  hasMore: number
  list: RoleUserItem[]
}

interface CreateRoleAssignmentParams {
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
   * 角色ID列表
   */
  roleIds: (string | number)[]
}

/**
 * 创建角色用户关系参数（新接口）
 */
interface CreateRoleUserParams {
  /**
   * 角色ID
   */
  roleId: number
  /**
   * 用户ID
   */
  userId: number
}

/**
 * 获取角色分配列表
 */
export async function getRoleAssignmentListApi(params?: RoleAssignmentQueryParams) {
  return usePost<RoleAssignmentListResult>('/role-assignment/list', params)
}

/**
 * 获取角色用户列表（分页）
 */
export async function getRoleUserListPagerApi(params?: RoleUserListPagerParams) {
  return usePost<RoleUserListPagerResult>('/admin/api/roleUser/getListPager', params, {
    customDev: true
  })
}

/**
 * 创建角色分配
 */
export async function createRoleAssignmentApi(data: CreateRoleAssignmentParams) {
  return usePost('/role-assignment/create', data)
}

/**
 * 创建角色用户关系（新接口）
 */
export async function createRoleUserApi(data: CreateRoleUserParams) {
  return usePost('/admin/api/roleUser/create', data, {
    customDev: true
  })
}

/**
 * 批量删除角色分配
 */
export async function batchDeleteRoleAssignmentApi(ids: (string | number)[]) {
  return usePost('/role-assignment/batch-delete', { ids })
}

/**
 * 获取角色分配详情
 */
export async function getRoleAssignmentDetailApi(id: string | number) {
  return useGet<RoleAssignmentModel>(`/role-assignment/${id}`)
}

export type {
  RoleAssignmentModel,
  RoleAssignmentQueryParams,
  RoleUserListPagerParams,
  RoleAssignmentListResult,
  RoleUserItem,
  RoleUserListPagerResult,
  CreateRoleAssignmentParams,
  CreateRoleUserParams,
}

