export default defineEventHandler(async (event) => {
  const typeCode = getRouterParam(event, 'typeCode')
  
  // 根据类型编码返回对应的字典项
  const mockDataMap: Record<string, any[]> = {
    user_gender: [
      {
        id: 1,
        typeId: 1,
        typeCode: 'user_gender',
        label: '男',
        value: 'male',
        description: '男性',
        status: 1,
        sort: 1,
      },
      {
        id: 2,
        typeId: 1,
        typeCode: 'user_gender',
        label: '女',
        value: 'female',
        description: '女性',
        status: 1,
        sort: 2,
      },
    ],
    user_status: [
      {
        id: 4,
        typeId: 2,
        typeCode: 'user_status',
        label: '正常',
        value: 'active',
        description: '账号正常',
        status: 1,
        sort: 1,
      },
      {
        id: 5,
        typeId: 2,
        typeCode: 'user_status',
        label: '禁用',
        value: 'disabled',
        description: '账号已禁用',
        status: 1,
        sort: 2,
      },
    ],
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockDataMap[typeCode || ''] || [],
  }
})

