import type { RouteRecordRaw } from 'vue-router'
import { basicRouteMap } from './router-modules'
import { AccessEnum } from '~@/utils/constant'

export default [
  {
    path: '/dashboard',
    redirect: '/dashboard/analysis',
    name: 'Dashboard',
    meta: {
      title: '实训项目管理',
      icon: 'DashboardOutlined',
      hideChildrenInMenu:true
    },
    component: basicRouteMap.RouteView,
    children: [
      {
        path: '/dashboard/analysis',
        name: 'DashboardAnalysis',
        component: () => import('~/pages/dashboard/analysis/index.vue'),
        meta: {
          title: '实训项目管理',
          parentKeys:['/dashboard']
        },
      },
      
    ],
  },
  {
    path: '/form',
    redirect: '/form/basic-form',
    name: 'Form',
    meta: {
      title: '系统管理',
      icon: 'FormOutlined',
    },
    component: basicRouteMap.RouteView,
    children: [
      {
        path: '/form/basic-form',
        name: 'FormBasic',
        component: () => import('~/pages/form/basic-form/index.vue'),
        meta: {
          title: '人员管理',
        },
      },
      {
        path: '/form/step-form',
        name: 'FormStep',
        component: () => import('~/pages/form/step-form/index.vue'),
        meta: {
          title: '组织机构管理',
        },
      },
      {
        path: '/form/advanced-form',
        name: 'FormAdvanced',
        component: () => import('~/pages/form/advanced-form/index.vue'),
        meta: {
          title: '角色管理',
        },
      },
    ],
  },
 
 
 
] as RouteRecordRaw[]
