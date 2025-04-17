const port = 9000;
const baseUrl = `http://localhost:${port}`;

export const environment = {
  production: false,
  apiUrl: baseUrl,
  userServiceUrl: `${baseUrl}/user-service`,
  projectServiceUrl: `${baseUrl}/project-service`,
  taskServiceUrl: `${baseUrl}/taskService`,
  defaultAvatarUrl: 'https://www.caspianpolicy.org/no-image.png',
  auth: {
    tokenUrl: '/oauth2/token',
    clientId: 'testing',
    clientSecret: 'password',
    grantType: 'custom_password'
  }
};
