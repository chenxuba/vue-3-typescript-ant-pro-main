export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟获取角色详情
  const mockRole = {
    id,
    roleName: '项目管理员',
    roleCode: 'ROLE_001',
    isVirtualManagerRole: false,
    managementScopeType: '本单位及下属单位',
    managementScope: '计算机网络信息中心',
    createTime: '2025-07-02 12:12:12',
    remark: '-',
    status: true,
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockRole,
  }
})

