export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟数据
  const mockData = [
    {
      id: '1',
      roleName: '实训项目管理员',
      roleCode: 'ROLE_001',
      isVirtualManagerRole: false,
      managementScopeType: '本单位及下属单位',
      managementScope: '计算机网络信息中心',
      createTime: '2025-07-02 12:12:12',
      remark: '-',
      status: true,
    },
    {
      id: '2',
      roleName: '系统管理员',
      roleCode: 'ROLE_002',
      isVirtualManagerRole: false,
      managementScopeType: '所有单位',
      managementScope: '全部',
      createTime: '2025-07-02 12:12:12',
      remark: '系统最高权限管理员',
      status: true,
    },
    {
      id: '3',
      roleName: '部门管理员',
      roleCode: 'ROLE_003',
      isVirtualManagerRole: false,
      managementScopeType: '本单位',
      managementScope: '大数据技术与应用发展部',
      createTime: '2025-07-02 12:12:12',
      remark: '负责部门日常管理',
      status: true,
    },
    {
      id: '4',
      roleName: '项目协调员',
      roleCode: 'ROLE_004',
      isVirtualManagerRole: true,
      managementScopeType: '本单位及下属单位',
      managementScope: '计算机网络信息中心',
      createTime: '2025-07-02 12:12:12',
      remark: '协调项目相关事务',
      status: false,
    },
    {
      id: '5',
      roleName: '审核员',
      roleCode: 'ROLE_005',
      isVirtualManagerRole: false,
      managementScopeType: '指定单位',
      managementScope: '高性能计算技术与应用发展部',
      createTime: '2025-07-02 12:12:12',
      remark: '负责审核流程',
      status: true,
    },
  ]
  
  // 根据查询参数过滤数据
  let filteredData = [...mockData]
  
  if (body.roleName) {
    filteredData = filteredData.filter(item => 
      item.roleName.includes(body.roleName)
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

