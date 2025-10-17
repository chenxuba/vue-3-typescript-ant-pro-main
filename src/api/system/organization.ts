interface OrganizationModel {
  id?: string | number
  /**
   * 单位名称
   */
  name: string
  /**
   * 单位编号
   */
  code: string
  /**
   * 上级单位ID
   */
  parentId?: string | number | null
  /**
   * 上级单位名称
   */
  parentName?: string
  /**
   * 是否有效
   */
  isActive: boolean
  /**
   * 序号
   */
  order: number
  /**
   * 是否独立组织培训机构
   */
  isIndependentTraining: boolean
  /**
   * 是否虚拟组织机构
   */
  isVirtual: boolean
  /**
   * 子组织
   */
  children?: OrganizationModel[]
}

type OrganizationParams = Partial<Omit<OrganizationModel, 'id' | 'children'>>

/**
 * 获取组织树形列表
 */
export async function getOrganizationTreeApi(params?: OrganizationParams) {
  return usePost<OrganizationModel[]>('/organization/tree', params)
}

/**
 * 获取组织详情
 */
export async function getOrganizationDetailApi(id: string | number) {
  return useGet<OrganizationModel>(`/organization/${id}`)
}

/**
 * 创建组织
 */
export async function createOrganizationApi(data: OrganizationParams) {
  return usePost('/organization/create', data)
}

/**
 * 更新组织
 */
export async function updateOrganizationApi(id: string | number, data: OrganizationParams) {
  return usePut(`/organization/${id}`, data)
}

/**
 * 删除组织
 */
export async function deleteOrganizationApi(id: string | number) {
  return useDelete(`/organization/${id}`)
}

export type {
  OrganizationModel,
  OrganizationParams,
}

