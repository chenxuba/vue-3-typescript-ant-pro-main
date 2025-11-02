export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟数据
  const mockData = [
    {
      id: '1',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '管理信息化技术与应用发展部',
      roles: ['学员'],
      roleIds: ['1'],
    },
    {
      id: '2',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '管理信息化技术与应用发展部',
      roles: ['学员'],
      roleIds: ['1'],
    },
    {
      id: '3',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '管理信息化技术与应用发展部',
      roles: ['学员'],
      roleIds: ['1'],
    },
    {
      id: '4',
      userCode: 'ceshi123456',
      userName: '李清照',
      organization: '管理信息化技术与应用发展部',
      roles: ['学员'],
      roleIds: ['1'],
    },
    {
      id: '5',
      userCode: 'user001',
      userName: '张三',
      organization: '大数据技术与应用发展部',
      roles: ['系统管理员', '项目协调员'],
      roleIds: ['2', '4'],
    },
    {
      id: '6',
      userCode: 'user002',
      userName: '王芳',
      organization: '高性能计算技术与应用发展部',
      roles: ['部门管理员'],
      roleIds: ['3'],
    },
    {
      id: '7',
      userCode: 'user003',
      userName: '赵丽',
      organization: '计算机网络信息中心',
      roles: ['审核员', '学员'],
      roleIds: ['5', '1'],
    },
    {
      id: '8',
      userCode: 'user004',
      userName: '孙梅',
      organization: '管理信息化技术与应用发展部',
      roles: ['项目管理员'],
      roleIds: ['1'],
    },
    {
      id: '9',
      userCode: 'user005',
      userName: '周强',
      organization: '大数据技术与应用发展部',
      roles: ['部门管理员', '审核员'],
      roleIds: ['3', '5'],
    },
    {
      id: '10',
      userCode: 'user006',
      userName: '吴静',
      organization: '高性能计算技术与应用发展部',
      roles: ['学员'],
      roleIds: ['1'],
    },
  ]
  
  // 创建更多数据以满足123条的需求
  const additionalData = []
  for (let i = 11; i <= 123; i++) {
    additionalData.push({
      id: String(i),
      userCode: `ceshi123456`,
      userName: '李清照',
      organization: '管理信息化技术与应用发展部',
      roles: ['学员'],
      roleIds: ['1'],
    })
  }
  
  const allData = [...mockData, ...additionalData]
  
  // 根据查询参数过滤数据
  let filteredData = [...allData]
  
  if (body.userName) {
    filteredData = filteredData.filter(item => 
      item.userName.includes(body.userName)
    )
  }
  
  if (body.roleName) {
    filteredData = filteredData.filter(item => 
      item.roles.some((role: string) => role.includes(body.roleName))
    )
  }
  
  const total = filteredData.length
  const pageNum = body.pageNum || 1
  const pageSize = body.pageSize || 10
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: filteredData.slice(start, end),
      total,
    },
  }
})

