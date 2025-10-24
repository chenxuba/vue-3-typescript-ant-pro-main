export default defineEventHandler(async (event) => {
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
  ]
  
  return {
    code: 200,
    message: 'success',
    data: mockData.filter(item => item.status === 1),
  }
})

