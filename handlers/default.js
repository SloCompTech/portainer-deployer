/**
 * Default deploy request handler
 */
const Joi = require('@hapi/joi');
const portainer = require('../portainer');

const dataSchema = Joi.object().keys({
  stack: Joi.string().required(),
  env: Joi.object().required(),
}).required();
const handle = async (req, res, data) => {
  const datav = await dataSchema.validateAsync(data);
  const stackptr = await portainer.getStack(req.token, datav.stack);
  if (!stackptr)
    return res.status(404).send({ error: 'Stack not found'});
  
  // Update environment variables (do not create non existing vars)
  const keys = Object.keys(datav.env);
  for (const key of keys) {
    for (const env of stackptr.Env) { // Check if value in list
      if (env.name === key)
        env.value = datav.env[key]; // Update value
    }
  }

  await portainer.updateStack(req.token, stackptr);

  return res.status(200).end();
}

module.exports = {
  handle: handle,
}
