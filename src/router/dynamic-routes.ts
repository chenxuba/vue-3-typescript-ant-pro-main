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
        component: () => import('~/pages/dashboard/raining-project-management/index.vue'),
        meta: {
          title: '实训项目管理',
          parentKeys:['/dashboard']
        },
      },
      {
        path: '/dashboard/raining-project-management/create',
        name: 'RainingProjectCreate',
        component: () => import('~/pages/dashboard/raining-project-management/create.vue'),
        meta: {
          title: '新建实训项目',
          parentKeys:['/dashboard'],
          hideInMenu: true,
        },
      },
      {
        path: '/dashboard/raining-project-management/config-full-stack',
        name: 'ConfigFullStack',
        component: () => import('~/pages/dashboard/raining-project-management/config-full-stack.vue'),
        meta: {
          title: '全栈环境实训项目配置',
          parentKeys:['/dashboard'],
          hideInMenu: true,
        },
      },
      {
        path: '/dashboard/raining-project-management/config-jupyter-notebook',
        name: 'ConfigJupyterNotebook',
        component: () => import('~/pages/dashboard/raining-project-management/config-jupyter-notebook.vue'),
        meta: {
          title: 'JupyterNotebook环境实训项目配置',
          parentKeys:['/dashboard'],
          hideInMenu: true,
        },
      },
      
    ],
  },
  {
    path: '/system-management',
    redirect: '/system-management/basic-form',
    name: 'System-management',
    meta: {
      title: '系统管理',
      icon: 'FormOutlined',
    },
    component: basicRouteMap.RouteView,
    children: [
      {
        path: '/system-management/personnel-management',
        name: 'System-management-personnel-management',
        component: () => import('~/pages/dashboard/system-management/personnel-management.vue'),
        meta: {
          title: '人员管理',
        },
      },
      {
        path: '/system-management/organization-management',
        name: 'System-management-organization-management',
        component: () => import('~/pages/dashboard/system-management/organization-management.vue'),
        meta: {
          title: '组织机构管理',
        },
      },
      {
        path: '/system-management/role-management',
        name: 'System-management-role-management',
        component: () => import('~/pages/dashboard/system-management/role-management.vue'),
        meta: {
          title: '角色管理',
        },
      },
      {
        path: '/system-management/role-assignment',
        name: 'System-management-role-assignment',
        component: () => import('~/pages/dashboard/system-management/role-assignment.vue'),
        meta: {
          title: '角色分配',
        },
      },
    ],
  },
 
 
 
] as RouteRecordRaw[]
