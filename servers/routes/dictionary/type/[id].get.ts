export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟字典类型数据
  const mockData = {
    id: Number(id),
    typeName: '用户性别',
    typeCode: 'user_gender',
    description: '用户性别字典',
    status: 1,
    sort: 1,
    createTime: new Date('2024-01-01 10:00:00').getTime(),
    updateTime: new Date('2024-01-01 10:00:00').getTime(),
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockData,
  }
})

