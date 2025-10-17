export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟获取人员详情
  const mockPersonnel = {
    id,
    userCode: 'ceshi123456',
    userName: '李清照',
    organization: '大数据技术与应用发展部',
    organizationId: '1-1',
    isNaturalPerson: true,
    phone: '13812345678',
    email: 'ceshizhanghao@qq.com',
    status: true,
  }
  
  return {
    code: 200,
    message: 'success',
    data: mockPersonnel,
  }
})

