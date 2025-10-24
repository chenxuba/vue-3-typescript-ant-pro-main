export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟字典类型数据
  const mockData = [
    {
      id: 1,
      typeName: '用户性别',
      typeCode: 'user_gender',
      description: '用户性别字典',
      status: 1,
      sort: 1,
      createTime: new Date('2024-01-01 10:00:00').getTime(),
      updateTime: new Date('2024-01-01 10:00:00').getTime(),
    },
    {
      id: 2,
      typeName: '用户状态',
      typeCode: 'user_status',
      description: '用户账号状态',
      status: 1,
      sort: 2,
      createTime: new Date('2024-01-01 10:00:00').getTime(),
      updateTime: new Date('2024-01-01 10:00:00').getTime(),
    },
    {
      id: 3,
      typeName: '订单状态',
      typeCode: 'order_status',
      description: '订单状态字典',
      status: 1,
      sort: 3,
      createTime: new Date('2024-01-01 10:00:00').getTime(),
      updateTime: new Date('2024-01-01 10:00:00').getTime(),
    },
    {
      id: 4,
      typeName: '支付方式',
      typeCode: 'payment_method',
      description: '支付方式字典',
      status: 1,
      sort: 4,
      createTime: new Date('2024-01-01 10:00:00').getTime(),
      updateTime: new Date('2024-01-01 10:00:00').getTime(),
    },
    {
      id: 5,
      typeName: '数据权限',
      typeCode: 'data_permission',
      description: '数据权限范围',
      status: 1,
      sort: 5,
      createTime: new Date('2024-01-01 10:00:00').getTime(),
      updateTime: new Date('2024-01-01 10:00:00').getTime(),
    },
    {
      id: 6,
      typeName: '通知类型',
      typeCode: 'notice_type',
      description: '系统通知类型',
      status: 0,
      sort: 6,
      createTime: new Date('2024-01-01 10:00:00').getTime(),
      updateTime: new Date('2024-01-01 10:00:00').getTime(),
    },
  ]
  
  // 根据查询参数过滤数据
  let filteredData = [...mockData]
  
  if (body.typeName) {
    filteredData = filteredData.filter(item => 
      item.typeName.includes(body.typeName)
    )
  }
  
  if (body.typeCode) {
    filteredData = filteredData.filter(item => 
      item.typeCode.includes(body.typeCode)
    )
  }
  
  if (body.status !== undefined && body.status !== null) {
    filteredData = filteredData.filter(item => item.status === body.status)
  }
  
  // 排序
  if (body.orderbyFiled) {
    const [field, order] = body.orderbyFiled.split(':')
    filteredData.sort((a: any, b: any) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1
      } else {
        return a[field] < b[field] ? 1 : -1
      }
    })
  }
  
  const count = filteredData.length
  const page = body.page || 1
  const limit = body.limit || 10
  const start = (page - 1) * limit
  const end = start + limit
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: filteredData.slice(start, end),
      count,
      page,
      limit,
    },
  }
})

