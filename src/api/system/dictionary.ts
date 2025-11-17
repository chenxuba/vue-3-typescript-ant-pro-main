/**
 * 字典类型模型
 */
interface DictionaryTypeModel {
  dicGroupId?: string | number
  /**
   * 字典类型名称
   */
  name: string
  /**
   * 字典类型编码
   */
  code: string
  /**
   * 备注
   */
  remark?: string
  /**
   * 权重
   */
  weight: number
  /**
   * 内容类型
   */
  contentType?: number
  /**
   * 用户ID
   */
  userId?: number
  /**
   * 创建时间
   */
  createTime?: string | number
  /**
   * 更新时间
   */
  updateTime?: string | number
}

/**
 * 字典项模型
 */
interface DictionaryItemModel {
  id?: string | number
  /**
   * 字典项名称
   */
  name: string
  /**
   * 字典分组ID
   */
  dicGroupId: string | number
  /**
   * 字典项内容
   */
  content: string
  /**
   * 权重
   */
  weight: number
  /**
   * 状态（1: 启用, 0: 禁用）
   */
  status: number
  /**
   * 用户ID
   */
  userId?: number | null
  /**
   * 创建时间
   */
  createTime?: string | number | null
  /**
   * 更新时间
   */
  updateTime?: string | number | null
}

/**
 * 字典类型分页查询参数
 */
interface DictionaryTypeQueryParams {
  name?: string
  code?: string
  page?: number
  limit?: number
  orderbyFiled?: string
}

/**
 * 字典项分页查询参数
 */
interface DictionaryItemQueryParams {
  dicGroupId?: string | number
  name?: string
  content?: string
  status?: number
  page: number
  limit: number
  orderbyFiled?: string
}

/**
 * 分页响应数据
 */
interface PagerResponse<T> {
  list: T[]
  count: number
  total?: number
  page: number
  limit: number
}

type DictionaryTypeParams = Partial<Omit<DictionaryTypeModel, 'dicGroupId' | 'createTime' | 'updateTime' | 'contentType' | 'userId'>>
type DictionaryItemParams = Partial<Omit<DictionaryItemModel, 'id' | 'createTime' | 'updateTime'>>

// ==================== 字典类型接口 ====================

/**
 * 获取字典类型列表（分页）
 */
export async function getDictionaryTypeListApi(params?: DictionaryTypeQueryParams) {
  return usePost<PagerResponse<DictionaryTypeModel>>('/admin/api/dicGroup/getList', params || {},{
    customDev:true
  })
}

/**
 * 获取所有字典类型列表（不分页）
 */
export async function getAllDictionaryTypeListApi() {
  return useGet<DictionaryTypeModel[]>('/admin/api/dicGroup/getList',{},{
    customDev:true
  })
}

/**
 * 获取字典类型详情
 */
export async function getDictionaryTypeDetailApi(dicGroupId: string | number) {
  return useGet<DictionaryTypeModel>(`/admin/api/dicGroup/${dicGroupId}`,{},{
    customDev:true
  })
}

/**
 * 创建字典类型
 */
export async function createDictionaryTypeApi(data: DictionaryTypeParams) {
  return usePost('/admin/api/dicGroup/create', data,{
    customDev:true
  })
}

/**
 * 更新字典类型
 */
export async function updateDictionaryTypeApi(dicGroupId: string | number, data: DictionaryTypeParams) {
  return usePost('/admin/api/dicGroup/update', { dicGroupId, ...data },{
    customDev:true
  })
}

/**
 * 删除字典类型
 */
export async function deleteDictionaryTypeApi(dicGroupId: string | number) {
  return usePost('/admin/api/dicGroup/del', { dicGroupId },{
    customDev:true
  })
}

// ==================== 字典项接口 ====================

/**
 * 获取字典项列表（分页）
 */
export async function getDictionaryItemListApi(params: DictionaryItemQueryParams) {
  return usePost<PagerResponse<DictionaryItemModel>>('/admin/api/dic/getList', params, {
    customDev: true
  })
}

/**
 * 根据字典类型编码获取字典项列表
 */
export async function getDictionaryItemsByTypeCodeApi(typeCode: string) {
  return useGet<DictionaryItemModel[]>(`/dictionary/item/type/${typeCode}`)
}

/**
 * 获取字典项详情
 */
export async function getDictionaryItemDetailApi(id: string | number) {
  return useGet<DictionaryItemModel>(`/dictionary/item/${id}`)
}

/**
 * 创建字典项
 */
export async function createDictionaryItemApi(data: DictionaryItemParams) {
  return usePost('/admin/api/dic/create', data, {
    customDev: true
  })
}

/**
 * 更新字典项
 */
export async function updateDictionaryItemApi(id: string | number, data: DictionaryItemParams) {
  return usePost('/admin/api/dic/update', { id, ...data }, {
    customDev: true
  })
}

/**
 * 删除字典项
 */
export async function deleteDictionaryItemApi(id: string | number) {
  return usePost('/admin/api/dic/del', { id }, {
    customDev: true
  })
}

export type {
  DictionaryTypeModel,
  DictionaryItemModel,
  DictionaryTypeQueryParams,
  DictionaryItemQueryParams,
  DictionaryTypeParams,
  DictionaryItemParams,
  PagerResponse,
}

