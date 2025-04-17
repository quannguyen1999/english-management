import { environment } from "../../environments/environment";

export const DURATION_SNACKBAR = 3000;

// API URLs
export const API_CONFIG = {
    baseUrl: environment.apiUrl,
    userService: {
      baseUrl: environment.userServiceUrl,
      endpoints: {
        users: '/users',
        roles: '/roles'
      }
    },
    projectService: {
      baseUrl: environment.projectServiceUrl,
      endpoints: {
        projects: '/projects',
        tasks: '/tasks'
      }
    },
    taskService: {
      baseUrl: environment.taskServiceUrl,
      endpoints: {
        tasks: '/tasks',
        comments: '/comments'
      }
    },
    auth: {
      tokenUrl: `${environment.userServiceUrl}${environment.auth.tokenUrl}`,
      clientId: environment.auth.clientId,
      clientSecret: environment.auth.clientSecret,
      grantType: environment.auth.grantType
    }
  };
  