interface RoleModel {
  id?: string | number
  /**
   * 角色名称
   */
  roleName: string
  /**
   * 角色编号
   */
  roleCode?: string
  /**
   * 是否虚拟机构管理员角色
   */
  isVirtualManagerRole?: boolean
  /**
   * 管理范围类型
   */
  managementScopeType?: string
  /**
   * 管理范围
   */
  managementScope?: string
  /**
   * 创建时间
   */
  createTime?: string
  /**
   * 备注
   */
  remark?: string
  /**
   * 状态 (启用/禁用)
   */
  status: boolean
}

interface RoleQueryParams {
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

interface RoleListResult {
  list: RoleModel[]
  total: number
}

interface CreateRoleParams {
  roleName: string
  roleCode: string
  isVirtualManagerRole: boolean
  managementScopeType: string
  managementScope: string
  remark?: string
  status?: boolean
}

interface UpdateRoleParams {
  id: string | number
  roleName?: string
  roleCode?: string
  isVirtualManagerRole?: boolean
  managementScopeType?: string
  managementScope?: string
  remark?: string
  status?: boolean
}

/**
 * 获取角色列表
 */
export async function getRoleListApi(params?: RoleQueryParams) {
  return usePost<RoleListResult>('/role/list', params)
}

/**
 * 创建角色
 */
export async function createRoleApi(data: CreateRoleParams) {
  return usePost('/role/create', data)
}

/**
 * 更新角色
 */
export async function updateRoleApi(data: UpdateRoleParams) {
  return usePut(`/role/${data.id}`, data)
}

/**
 * 删除角色
 */
export async function deleteRoleApi(id: string | number) {
  return useDelete(`/role/${id}`)
}

/**
 * 批量删除角色
 */
export async function batchDeleteRoleApi(ids: (string | number)[]) {
  return usePost('/role/batch-delete', { ids })
}

/**
 * 更新角色状态
 */
export async function updateRoleStatusApi(id: string | number, status: boolean) {
  return usePut(`/role/${id}/status`, { status })
}

/**
 * 获取角色详情
 */
export async function getRoleDetailApi(id: string | number) {
  return useGet<RoleModel>(`/role/${id}`)
}

/**
 * 获取角色权限
 */
export async function getRolePermissionsApi(id: string | number) {
  return useGet<string[]>(`/role/${id}/permissions`)
}

/**
 * 保存角色权限
 */
export async function saveRolePermissionsApi(id: string | number, permissions: string[]) {
  return usePost(`/role/${id}/permissions`, { permissions })
}

export type {
  RoleModel,
  RoleQueryParams,
  RoleListResult,
  CreateRoleParams,
  UpdateRoleParams,
}

