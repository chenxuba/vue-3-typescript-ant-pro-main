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
  userName?: string
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

interface RoleAssignmentListResult {
  list: RoleAssignmentModel[]
  total: number
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
 * 获取角色分配列表
 */
export async function getRoleAssignmentListApi(params?: RoleAssignmentQueryParams) {
  return usePost<RoleAssignmentListResult>('/role-assignment/list', params)
}

/**
 * 创建角色分配
 */
export async function createRoleAssignmentApi(data: CreateRoleAssignmentParams) {
  return usePost('/role-assignment/create', data)
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
  RoleAssignmentListResult,
  CreateRoleAssignmentParams,
}

