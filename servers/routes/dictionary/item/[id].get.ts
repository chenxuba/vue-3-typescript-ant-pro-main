export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟字典项数据
  const mockData = {
    id: Number(id),
    typeId: 1,
    typeCode: 'user_gender',
    label: '男',
    value: 'male',
    description: '男性',
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

