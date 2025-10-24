/**
 * 字典类型模型
 */
interface DictionaryTypeModel {
  id?: string | number
  /**
   * 字典类型名称
   */
  typeName: string
  /**
   * 字典类型编码
   */
  typeCode: string
  /**
   * 描述
   */
  description?: string
  /**
   * 状态（1: 启用, 0: 禁用）
   */
  status: number
  /**
   * 排序
   */
  sort: number
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
   * 字典类型ID
   */
  typeId: string | number
  /**
   * 字典类型编码
   */
  typeCode?: string
  /**
   * 字典项标签
   */
  label: string
  /**
   * 字典项值
   */
  value: string
  /**
   * 描述
   */
  description?: string
  /**
   * 状态（1: 启用, 0: 禁用）
   */
  status: number
  /**
   * 排序
   */
  sort: number
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
 * 字典类型分页查询参数
 */
interface DictionaryTypeQueryParams {
  typeName?: string
  typeCode?: string
  status?: number
  page: number
  limit: number
  orderbyFiled?: string
}

/**
 * 字典项分页查询参数
 */
interface DictionaryItemQueryParams {
  typeId?: string | number
  typeCode?: string
  label?: string
  value?: string
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
  page: number
  limit: number
}

type DictionaryTypeParams = Partial<Omit<DictionaryTypeModel, 'id' | 'createTime' | 'updateTime'>>
type DictionaryItemParams = Partial<Omit<DictionaryItemModel, 'id' | 'createTime' | 'updateTime'>>

// ==================== 字典类型接口 ====================

/**
 * 获取字典类型列表（分页）
 */
export async function getDictionaryTypeListApi(params: DictionaryTypeQueryParams) {
  return usePost<PagerResponse<DictionaryTypeModel>>('/dictionary/type/list', params)
}

/**
 * 获取所有字典类型列表（不分页）
 */
export async function getAllDictionaryTypeListApi() {
  return useGet<DictionaryTypeModel[]>('/dictionary/type/all')
}

/**
 * 获取字典类型详情
 */
export async function getDictionaryTypeDetailApi(id: string | number) {
  return useGet<DictionaryTypeModel>(`/dictionary/type/${id}`)
}

/**
 * 创建字典类型
 */
export async function createDictionaryTypeApi(data: DictionaryTypeParams) {
  return usePost('/dictionary/type/create', data)
}

/**
 * 更新字典类型
 */
export async function updateDictionaryTypeApi(id: string | number, data: DictionaryTypeParams) {
  return usePut(`/dictionary/type/${id}`, data)
}

/**
 * 删除字典类型
 */
export async function deleteDictionaryTypeApi(id: string | number) {
  return useDelete(`/dictionary/type/${id}`)
}

// ==================== 字典项接口 ====================

/**
 * 获取字典项列表（分页）
 */
export async function getDictionaryItemListApi(params: DictionaryItemQueryParams) {
  return usePost<PagerResponse<DictionaryItemModel>>('/dictionary/item/list', params)
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
  return usePost('/dictionary/item/create', data)
}

/**
 * 更新字典项
 */
export async function updateDictionaryItemApi(id: string | number, data: DictionaryItemParams) {
  return usePut(`/dictionary/item/${id}`, data)
}

/**
 * 删除字典项
 */
export async function deleteDictionaryItemApi(id: string | number) {
  return useDelete(`/dictionary/item/${id}`)
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

