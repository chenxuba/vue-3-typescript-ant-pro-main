export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟字典项数据
  const mockDataMap: Record<number, any[]> = {
    1: [ // 用户性别
      {
        id: 1,
        typeId: 1,
        typeCode: 'user_gender',
        label: '男',
        value: 'male',
        description: '男性',
        status: 1,
        sort: 1,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 2,
        typeId: 1,
        typeCode: 'user_gender',
        label: '女',
        value: 'female',
        description: '女性',
        status: 1,
        sort: 2,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 3,
        typeId: 1,
        typeCode: 'user_gender',
        label: '保密',
        value: 'secret',
        description: '保密',
        status: 1,
        sort: 3,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
    ],
    2: [ // 用户状态
      {
        id: 4,
        typeId: 2,
        typeCode: 'user_status',
        label: '正常',
        value: 'active',
        description: '账号正常',
        status: 1,
        sort: 1,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 5,
        typeId: 2,
        typeCode: 'user_status',
        label: '禁用',
        value: 'disabled',
        description: '账号已禁用',
        status: 1,
        sort: 2,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 6,
        typeId: 2,
        typeCode: 'user_status',
        label: '锁定',
        value: 'locked',
        description: '账号已锁定',
        status: 1,
        sort: 3,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
    ],
    3: [ // 订单状态
      {
        id: 7,
        typeId: 3,
        typeCode: 'order_status',
        label: '待支付',
        value: 'pending',
        description: '等待支付',
        status: 1,
        sort: 1,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 8,
        typeId: 3,
        typeCode: 'order_status',
        label: '已支付',
        value: 'paid',
        description: '已完成支付',
        status: 1,
        sort: 2,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 9,
        typeId: 3,
        typeCode: 'order_status',
        label: '已发货',
        value: 'shipped',
        description: '已发货',
        status: 1,
        sort: 3,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 10,
        typeId: 3,
        typeCode: 'order_status',
        label: '已完成',
        value: 'completed',
        description: '订单已完成',
        status: 1,
        sort: 4,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 11,
        typeId: 3,
        typeCode: 'order_status',
        label: '已取消',
        value: 'cancelled',
        description: '订单已取消',
        status: 1,
        sort: 5,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
    ],
    4: [ // 支付方式
      {
        id: 12,
        typeId: 4,
        typeCode: 'payment_method',
        label: '微信支付',
        value: 'wechat',
        description: '使用微信支付',
        status: 1,
        sort: 1,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 13,
        typeId: 4,
        typeCode: 'payment_method',
        label: '支付宝',
        value: 'alipay',
        description: '使用支付宝',
        status: 1,
        sort: 2,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 14,
        typeId: 4,
        typeCode: 'payment_method',
        label: '银行卡',
        value: 'bank_card',
        description: '使用银行卡支付',
        status: 1,
        sort: 3,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 15,
        typeId: 4,
        typeCode: 'payment_method',
        label: '现金',
        value: 'cash',
        description: '现金支付',
        status: 0,
        sort: 4,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
    ],
    5: [ // 数据权限
      {
        id: 16,
        typeId: 5,
        typeCode: 'data_permission',
        label: '全部数据',
        value: 'all',
        description: '可以访问所有数据',
        status: 1,
        sort: 1,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 17,
        typeId: 5,
        typeCode: 'data_permission',
        label: '本单位及下属单位',
        value: 'org_and_sub',
        description: '本单位及下属单位数据',
        status: 1,
        sort: 2,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 18,
        typeId: 5,
        typeCode: 'data_permission',
        label: '仅本单位',
        value: 'org_only',
        description: '仅本单位数据',
        status: 1,
        sort: 3,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
      {
        id: 19,
        typeId: 5,
        typeCode: 'data_permission',
        label: '仅本人',
        value: 'self_only',
        description: '仅本人数据',
        status: 1,
        sort: 4,
        createTime: new Date('2024-01-01 10:00:00').getTime(),
        updateTime: new Date('2024-01-01 10:00:00').getTime(),
      },
    ],
  }
  
  // 根据类型ID获取数据
  let filteredData = mockDataMap[body.typeId] || []
  
  // 根据查询参数过滤数据
  if (body.label) {
    filteredData = filteredData.filter((item: any) => 
      item.label.includes(body.label)
    )
  }
  
  if (body.value) {
    filteredData = filteredData.filter((item: any) => 
      item.value.includes(body.value)
    )
  }
  
  if (body.status !== undefined && body.status !== null) {
    filteredData = filteredData.filter((item: any) => item.status === body.status)
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

