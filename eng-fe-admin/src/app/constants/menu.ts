import { Menu } from "../models/model";
import { ROLE_ADMIN, ROLE_USER } from "./roles";

export const listMenus: Menu[] = [
    {
      id: 1,
      name: 'Dashboard',
      url: '/home',
      icon: 'dashboard',
      isSelected: false,
      roles: [ROLE_ADMIN]
    },
    {
      id: 2,
      name: 'User',
      url: '/user',
      icon: 'group',
      isSelected: false,
      roles: [ROLE_ADMIN]
    },
    {
      id: 5,
      name: 'Logout',
      url: '/logout',
      icon: 'logout',
      isSelected: false,
      roles: [ROLE_ADMIN, ROLE_USER]
    }
  ];