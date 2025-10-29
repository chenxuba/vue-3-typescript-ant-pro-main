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

/**
 * 原始组织接口返回数据类型
 */
interface RawOrganizationModel {
  orgID: number
  orgName: string
  orgCode: string
  parentOrgID: number
  parentOrgName: string
  status: number
  sortID: number
  attachedOrgId?: number
  isOrg: number
  isVirOrg: number
  orglevel: number
  orgTypeID?: string
  logo?: string
  orgSEQ: string
}

/**
 * 组织列表请求参数
 */
interface OrganizationListParams {
  limit: number
  orderbyFiled?: string
  page: number
  startNum: number
  /**
   * 父组织ID，默认传0查询顶级组织
   */
  parentOrgID?: number
  /**
   * 组织名称，用于搜索
   */
  orgName?: string
}

/**
 * 组织列表响应数据
 */
interface OrganizationListResponse {
  total: number
  pageSize: number
  currentPage: number
  list: RawOrganizationModel[]
}

/**
 * 外部 API 响应格式（用于 result 而不是 code）
 */
interface ExternalApiResponse<T = any> {
  result: number
  msg: string
  data?: T
}

type OrganizationParams = Partial<Omit<OrganizationModel, 'id' | 'children'>>

/**
 * 获取组织树形列表
 */
export async function getOrganizationTreeApi(params?: OrganizationParams) {
  return usePost<OrganizationModel[]>('/organization/tree', params)
}

/**
 * 获取所有组织列表（真实接口）
 * 注意：开发环境下会通过 Vite 代理转发到 http://101.200.13.193:8080
 */
export async function getAllOrganizationListApi(params: OrganizationListParams) {
  return usePost<OrganizationListResponse>('/web/api/user/allOrgList', params,{
    customDev:true,
  })
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
  RawOrganizationModel,
  OrganizationListParams,
  OrganizationListResponse,
  ExternalApiResponse,
}

