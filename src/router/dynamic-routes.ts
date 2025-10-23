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
      hideChildrenInMenu:true,
      // access: [AccessEnum.PROJECT_VIEW],
    },
    component: basicRouteMap.RouteView,
    children: [
      {
        path: '/dashboard/analysis',
        name: 'DashboardAnalysis',
        component: () => import('~/pages/dashboard/raining-project-management/index.vue'),
        meta: {
          title: '实训项目管理',
          parentKeys:['/dashboard'],
          // access: [AccessEnum.PROJECT_LIST],
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
          // access: [AccessEnum.PROJECT_CREATE],
        },
      },
      {
        path: '/dashboard/raining-project-management/edit',
        name: 'RainingProjectEdit',
        component: () => import('~/pages/dashboard/raining-project-management/edit.vue'),
        meta: {
          title: '编辑实训项目',
          parentKeys:['/dashboard'],
          hideInMenu: true,
          // access: [AccessEnum.PROJECT_EDIT],
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
          // access: [AccessEnum.PROJECT_CONFIG_FULLSTACK],
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
          // access: [AccessEnum.PROJECT_CONFIG_NOTEBOOK],
        },
      },
      {
        path: '/dashboard/raining-project-management/config-jupyter-lab',
        name: 'ConfigJupyterLab',
        component: () => import('~/pages/dashboard/raining-project-management/config-jupyter-lab.vue'),
        meta: {
          title: 'JupyterLab环境实训项目配置',
          parentKeys:['/dashboard'],
          hideInMenu: true,
          // access: [AccessEnum.PROJECT_CONFIG_LAB],
        },
      },
      {
        path: '/dashboard/raining-project-management/statistics',
        name: 'ProjectStatistics',
        component: () => import('~/pages/dashboard/raining-project-management/statistics.vue'),
        meta: {
          title: '实训项目管理详情',
          parentKeys:['/dashboard'],
          hideInMenu: true,
          // access: [AccessEnum.PROJECT_STATISTICS],
        },
      },
      {
        path: '/dashboard/raining-project-management/edit-full-stack',
        name: 'EditFullStack',
        component: () => import('~/pages/dashboard/raining-project-management/edit-full-stack.vue'),
        meta: {
          title: '编辑全栈环境实训项目',
          parentKeys:['/dashboard'],
          hideInMenu: true,
          // access: [AccessEnum.PROJECT_EDIT_FULLSTACK],
        },
      },
      {
        path: '/dashboard/raining-project-management/edit-jupyter-notebook',
        name: 'EditJupyterNotebook',
        component: () => import('~/pages/dashboard/raining-project-management/edit-jupyter-notebook.vue'),
        meta: {
          title: '编辑JupyterNotebook环境实训项目',
          parentKeys:['/dashboard'],
          hideInMenu: true,
          // access: [AccessEnum.PROJECT_EDIT_NOTEBOOK],
        },
      },
      {
        path: '/dashboard/raining-project-management/edit-jupyter-lab',
        name: 'EditJupyterLab',
        component: () => import('~/pages/dashboard/raining-project-management/edit-jupyter-lab.vue'),
        meta: {
          title: '编辑JupyterLab环境实训项目',
          parentKeys:['/dashboard'],
          hideInMenu: true,
          // access: [AccessEnum.PROJECT_EDIT_LAB],
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
      // access: [AccessEnum.SYSTEM_VIEW],
    },
    component: basicRouteMap.RouteView,
    children: [
      {
        path: '/system-management/organization-management',
        name: 'System-management-organization-management',
        component: () => import('~/pages/dashboard/system-management/organization-management.vue'),
        meta: {
          title: '组织机构管理',
          // access: [AccessEnum.SYSTEM_ORGANIZATION_VIEW],
        },
      },
      {
        path: '/system-management/personnel-management',
        name: 'System-management-personnel-management',
        component: () => import('~/pages/dashboard/system-management/personnel-management.vue'),
        meta: {
          title: '人员管理',
          // access: [AccessEnum.SYSTEM_PERSONNEL_VIEW],
        },
      },
      {
        path: '/system-management/role-management',
        name: 'System-management-role-management',
        component: () => import('~/pages/dashboard/system-management/role-management.vue'),
        meta: {
          title: '角色管理',
          // access: [AccessEnum.SYSTEM_ROLE_VIEW],
        },
      },
      {
        path: '/system-management/role-assignment',
        name: 'System-management-role-assignment',
        component: () => import('~/pages/dashboard/system-management/role-assignment.vue'),
        meta: {
          title: '角色分配',
          // access: [AccessEnum.SYSTEM_ROLE_ASSIGN],
        },
      },
    ],
  },
 
 
 
] as RouteRecordRaw[]
