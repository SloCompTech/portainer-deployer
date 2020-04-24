/**
 * Portainer functions
 */
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

/**
 * Login into portainer
 * @param {string} username User's username
 * @param {string} password User's password
 * @returns {string} JWT token
 */
const login = async function (username, password) {
  const response = await axios.post(`${process.env.PORTAINER_API}/auth`, {
    Username: username,
    Password: password,
  });

  // React to portainer error
  if (response.err)
    throw new Error(response.err);
  
  return response.data.jwt;
};

/**
 * Get stack descriptor by name
 * @param {string} token JWT token
 * @param {string} name Stack name
 * @returns {Stack} Stack descriptor
 */
const getStack = async function (token, name) {
  const response = await axios.get(`${process.env.PORTAINER_API}/stacks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: {
      filters: { name: name },
    },
  });
  
  // React to portainer error
  if (response.err)
    throw new Error(response.err);

  // Return stack only if exactly one found
  return (response.data && Array.isArray(response.data) && response.data.length == 1) ? response.data[0] : null;
}

/**
 * Update stack descriptor
 * @param {string} token 
 * @param {Stack} stack 
 */
const updateStack = async function (token, stack) {
  const stackfile = await fs.promises.readFile(path.join(process.env.PORTAINER_DIR,`${stack.ProjectPath.replace('/data/', '')}/${stack.EntryPoint}`), 'utf8');
  const response = await axios.put(`${process.env.PORTAINER_API}/stacks/${stack.Id}`, {
    'StackFileContent': stackfile,
    'Env': stack.Env,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: {
      endpointId: stack.EndpointId,
    },
  });

  // React to portainer error
  if (response.err)
   throw new Error(response.err);
}

module.exports = {
  login: login,
  getStack: getStack,
  updateStack: updateStack,
};
