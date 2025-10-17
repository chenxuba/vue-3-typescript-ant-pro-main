export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟获取角色分配详情
  const mockData = {
    id,
    userCode: 'ceshi123456',
    userName: '李清照',
    organization: '管理信息化技术与应用发展部',
    roles: ['学员'],
    roleIds: ['1'],
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockData,
  }
})

