export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟数据库查询
  const mockData: Record<string, any> = {
    '1': {
      id: '1',
      name: '计算机网络信息中心',
      code: '241711',
      parentId: null,
      parentName: '中国科学院',
      isActive: true,
      order: 0,
      isIndependentTraining: true,
      isVirtual: false,
    },
    '1-1': {
      id: '1-1',
      name: '大数据技术与应用发展部',
      code: '241711001',
      parentId: '1',
      parentName: '计算机网络信息中心',
      isActive: true,
      order: 1,
      isIndependentTraining: false,
      isVirtual: false,
    },
  }

  return mockData[id || '1'] || mockData['1']
})

