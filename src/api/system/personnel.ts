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

export type {
  PersonnelModel,
  PersonnelQueryParams,
  PersonnelListResult,
}

