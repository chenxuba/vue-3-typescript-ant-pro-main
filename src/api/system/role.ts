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

interface RolePagerQueryParams {
  /**
   * 权限代码
   */
  authCode?: string
  /**
   * 权限菜单
   */
  authMenus?: string
  /**
   * 权限类型
   */
  authType?: number
  /**
   * 权限类型内容
   */
  authTypeContent?: string
  /**
   * 角色代码
   */
  code?: string
  /**
   * 创建时间
   */
  createTime?: number
  /**
   * 是否内部角色
   */
  inner?: number
  /**
   * 是否管理员
   */
  isAdmin?: number
  /**
   * 每页数量
   */
  limit?: number
  /**
   * 角色名称
   */
  name?: string
  /**
   * 排序字段 格式: "name:desc,github:asc"
   */
  orderbyFiled?: string
  /**
   * 页码
   */
  page?: number
  /**
   * 备注
   */
  remark?: string
  /**
   * 角色ID
   */
  roleId?: number
  /**
   * 起始数量
   */
  startNum?: number
  /**
   * 更新时间
   */
  updateTime?: number
  /**
   * 用户ID
   */
  userId?: number
}

/**
 * 角色分页接口返回的角色数据模型
 */
interface RolePagerItem {
  roleId: number
  name: string
  code: string
  inner: number | null
  authCode: string | null
  createTime: number
  updateTime: number
  userId: number
  isAdmin: number
  authType: number
  authTypeContent: string
  remark: string
  authMenus: string
}

interface RoleListResult {
  count: any
  list: RoleModel[]
  total: number
}

interface RolePagerListResult {
  count: number
  total: number
  page: number
  limit: number
  totalPage: number
  hasMore: number
  list: RolePagerItem[]
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

interface CreateRolePagerParams {
  /**
   * 权限代码
   */
  authCode?: string
  /**
   * 权限菜单
   */
  authMenus?: string
  /**
   * 权限类型 / 管理范围类型
   */
  authType?: number
  /**
   * 权限类型内容 / 管理范围
   */
  authTypeContent?: string
  /**
   * 角色代码
   */
  code?: string
  /**
   * 创建时间
   */
  createTime?: number
  /**
   * 是否内部角色
   */
  inner?: number
  /**
   * 是否管理员 / 是否虚拟机构管理员角色
   */
  isAdmin?: number
  /**
   * 角色名称
   */
  name: string
  /**
   * 备注
   */
  remark?: string
  /**
   * 角色ID
   */
  roleId?: number
  /**
   * 更新时间
   */
  updateTime?: number
  /**
   * 用户ID / 角色编号
   */
  userId?: number
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

interface UpdateRolePagerParams {
  /**
   * 角色ID
   */
  roleId: string | number
  /**
   * 权限代码
   */
  authCode?: string
  /**
   * 权限菜单
   */
  authMenus?: string
  /**
   * 权限类型 / 管理范围类型
   */
  authType?: number
  /**
   * 权限类型内容 / 管理范围
   */
  authTypeContent?: string
  /**
   * 角色代码
   */
  code?: string
  /**
   * 是否内部角色
   */
  inner?: number
  /**
   * 是否管理员 / 是否虚拟机构管理员角色
   */
  isAdmin?: number
  /**
   * 角色名称
   */
  name?: string
  /**
   * 备注
   */
  remark?: string
}

/**
 * 获取角色列表
 */
export async function getRoleListApi(params?: RoleQueryParams) {
  return usePost<RoleListResult>('/role/list', params)
}

/**
 * 获取角色分页列表
 */
export async function getRoleListPagerApi(params?: RolePagerQueryParams) {
  return usePost<RolePagerListResult>('/admin/api/role/getListPager', params, {
    customDev: true,
  })
}

/**
 * 创建角色
 */
export async function createRoleApi(data: CreateRoleParams) {
  return usePost('/role/create', data)
}

/**
 * 创建角色 (新接口)
 */
export async function createRolePagerApi(data: CreateRolePagerParams) {
  return usePost('/admin/api/role/create', data, {
    customDev: true,
  })
}

/**
 * 更新角色
 */
export async function updateRoleApi(data: UpdateRoleParams) {
  return usePut(`/role/${data.id}`, data)
}

/**
 * 更新角色 (新接口)
 */
export async function updateRolePagerApi(data: UpdateRolePagerParams) {
  return usePost('/admin/api/role/update', data, {
    customDev: true,
  })
}

/**
 * 删除角色
 */
export async function deleteRoleApi(id: string | number) {
  return useDelete(`/role/${id}`)
}

/**
 * 删除角色 (新接口)
 */
export async function deleteRolePagerApi(roleId: string | number) {
  return usePost('/admin/api/role/del', { roleId }, {
    customDev: true,
  })
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
  RolePagerQueryParams,
  RoleListResult,
  RolePagerItem,
  RolePagerListResult,
  CreateRoleParams,
  CreateRolePagerParams,
  UpdateRoleParams,
  UpdateRolePagerParams,
}

