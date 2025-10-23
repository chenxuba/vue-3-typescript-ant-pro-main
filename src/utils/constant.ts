export enum AccessEnum {
  // 基础角色权限
  ADMIN = 'ADMIN',
  USER = 'USER',
  
  // 实训项目管理权限
  PROJECT_VIEW = 'project:view',
  // PROJECT_LIST = 'project:list',
  // PROJECT_CREATE = 'project:create',
  // PROJECT_EDIT = 'project:edit',
  // PROJECT_DELETE = 'project:delete',
  // PROJECT_CONFIG_FULLSTACK = 'project:config:fullstack',
  // PROJECT_CONFIG_NOTEBOOK = 'project:config:notebook',
  // PROJECT_CONFIG_LAB = 'project:config:lab',
  // PROJECT_STATISTICS = 'project:statistics',
  // PROJECT_EDIT_FULLSTACK = 'project:edit:fullstack',
  // PROJECT_EDIT_NOTEBOOK = 'project:edit:notebook',
  // PROJECT_EDIT_LAB = 'project:edit:lab',
  
  // 系统管理权限
  SYSTEM_VIEW = 'system:view',
  SYSTEM_ORGANIZATION_VIEW = 'system:organization:view',
  // SYSTEM_ORGANIZATION_CREATE = 'system:organization:create',
  // SYSTEM_ORGANIZATION_EDIT = 'system:organization:edit',
  // SYSTEM_ORGANIZATION_DELETE = 'system:organization:delete',
  SYSTEM_PERSONNEL_VIEW = 'system:personnel:view',
  // SYSTEM_PERSONNEL_CREATE = 'system:personnel:create',
  // SYSTEM_PERSONNEL_EDIT = 'system:personnel:edit',
  // SYSTEM_PERSONNEL_DELETE = 'system:personnel:delete',
  SYSTEM_ROLE_VIEW = 'system:role:view',
  // SYSTEM_ROLE_CREATE = 'system:role:create',
  // SYSTEM_ROLE_EDIT = 'system:role:edit',
  // SYSTEM_ROLE_DELETE = 'system:role:delete',
  SYSTEM_ROLE_ASSIGN = 'system:role:assign',
}

export enum DynamicLoadEnum {
  FRONTEND = 'FRONTEND', // 前端动态加载菜单，使用这种方式将从dynamic-routes.ts中加载菜单和路由信息
  BACKEND = 'BACKEND', // 后端动态加载菜单， 使用这种方式将从后端接口加载菜单和路由信息
}

export enum STATUS {
  OFF = '0',
  RUNNING = '1',
  ONLINE = '2',
  ERROR = '3',

}
// 默认情况下我们提供从后端加载的逻辑
export const DYNAMIC_LOAD_WAY = import.meta.env.VITE_APP_LOAD_ROUTE_WAY ?? DynamicLoadEnum.BACKEND
