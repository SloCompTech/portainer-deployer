/**
 * Portainer functions
 */
const axios = require('axios').default;

/**
 * Login into portainer
 * @param {string} username User's username
 * @param {string} password User's password
 * @returns {string} Portainer access token
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
 * @param {string} token Portainer access token
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
 * Get Stack Docker compose file content
 * @param {string} token Portainer access token
 * @param {number} stackId 
 */
const getStackComposeFile = async function (token, stackId) {
  // Get current stack file
  const response = await axios.get(`${process.env.PORTAINER_API}/stacks/${stackId}/file`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // React to portainer error
  if (response.err)
    throw new Error(response.err);

  return response.data.StackFileContent;
}

/**
 * Update stack descriptor
 * @param {string} token Portainer access token
 * @param {Stack} stack stack descriptor
 * @param {string} composeFile docker compose file contents
 */
const updateStack = async function (token, stack, composeFile = null) {
  if (!composeFile)
    composeFile = await getStackComposeFile(token, stack.Id);
  
  if (!composeFile || composeFile.trim().length === 0)
    throw new Error('Docker compose file empty');
  
  const response = await axios.put(`${process.env.PORTAINER_API}/stacks/${stack.Id}`, {
    'StackFileContent': composeFile,
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
