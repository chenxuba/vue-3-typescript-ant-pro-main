export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟人员数据
  const mockPersonnelData = [
    {
      id: '1',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '大数据技术与应用发展部',
      organizationId: '1-1',
      isNaturalPerson: true,
      phone: '',
      email: 'ceshizhanghao@qq.com',
      status: true,
    },
    {
      id: '2',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '大数据技术与应用发展部',
      organizationId: '1-1',
      isNaturalPerson: true,
      phone: '',
      email: 'ceshizhanghao@qq.com',
      status: false,
    },
    {
      id: '3',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '大数据技术与应用发展部',
      organizationId: '1-1',
      isNaturalPerson: true,
      phone: '13812345678',
      email: 'ceshizhanghao@qq.com',
      status: true,
    },
    {
      id: '4',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '大数据技术与应用发展部',
      organizationId: '1-1',
      isNaturalPerson: true,
      phone: '13812345678',
      email: 'ceshizhanghao@qq.com',
      status: true,
    },
    {
      id: '5',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '大数据技术与应用发展部',
      organizationId: '1-1',
      isNaturalPerson: true,
      phone: '13812345678',
      email: 'ceshizhanghao@qq.com',
      status: true,
    },
    {
      id: '6',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '大数据技术与应用发展部',
      organizationId: '1-1',
      isNaturalPerson: true,
      phone: '',
      email: 'ceshizhanghao@qq.com',
      status: true,
    },
    {
      id: '7',
      userCode: 'test789012',
      userName: '王维',
      organization: '高性能计算技术与应用发展部',
      organizationId: '1-2',
      isNaturalPerson: true,
      phone: '13987654321',
      email: 'wangwei@qq.com',
      status: true,
    },
    {
      id: '8',
      userCode: 'test345678',
      userName: '杜甫',
      organization: '管理信息化技术与应用发展部',
      organizationId: '1-3',
      isNaturalPerson: false,
      phone: '13765432109',
      email: 'dufu@qq.com',
      status: true,
    },
    {
      id: '9',
      userCode: 'user111222',
      userName: '白居易',
      organization: '广州中心',
      organizationId: '1-3-1',
      isNaturalPerson: true,
      phone: '13654321098',
      email: 'baijuyi@qq.com',
      status: false,
    },
    {
      id: '10',
      userCode: 'admin999888',
      userName: '李白',
      organization: '党群办公室',
      organizationId: '1-1-1',
      isNaturalPerson: true,
      phone: '13543210987',
      email: 'libai@qq.com',
      status: true,
    },
  ]
  
  // 根据查询条件过滤
  let filteredData = [...mockPersonnelData]
  
  // 根据组织ID过滤
  if (body.organizationId) {
    filteredData = filteredData.filter(item => item.organizationId === body.organizationId)
  }
  
  // 根据用户编号过滤
  if (body.userCode) {
    filteredData = filteredData.filter(item => 
      item.userCode.toLowerCase().includes(body.userCode.toLowerCase())
    )
  }
  
  // 根据用户姓名过滤
  if (body.userName) {
    filteredData = filteredData.filter(item => 
      item.userName.includes(body.userName)
    )
  }
  
  // 根据单位过滤
  if (body.organization) {
    filteredData = filteredData.filter(item => 
      item.organization.includes(body.organization)
    )
  }
  
  // 分页处理
  const pageNum = body.pageNum || 1
  const pageSize = body.pageSize || 10
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  const paginatedData = filteredData.slice(startIndex, endIndex)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: paginatedData,
      total: filteredData.length,
    },
  }
})

