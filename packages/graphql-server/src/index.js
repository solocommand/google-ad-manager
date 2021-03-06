const { ApolloServer } = require('apollo-server-express');
const { get, set, isFunction: isFn } = require('@parameter1/utils');
const { STATUS_CODES } = require('http');
const express = require('express');
const schemas = require('./schemas');
const createSoapClient = require('./soap');

module.exports = ({
  jsonKeyFilePath,
  networkCode,
  applicationName,
  apiVersion,

  path,

  context,
  tracing = false,
  cacheControl = false,
  introspection = true,
  debug = false,
  playground = false,

  formatError,

  beforeApply,
  afterApply,
} = {}) => {
  const app = express();

  const soap = createSoapClient({
    jsonKeyFilePath,
    networkCode,
    applicationName,
    version: apiVersion,
  });

  const server = new ApolloServer({
    schema: schemas(apiVersion),
    context: async (...args) => {
      const ctx = {
        ...(isFn(context) ? await context(...args) : context),
        soap,
      };
      return ctx;
    },
    tracing,
    cacheControl,
    introspection,
    debug,
    playground,
    formatError: isFn(formatError) ? formatError : (err) => {
      const code = get(err, 'extensions.exception.statusCode');
      if (code) set(err, 'extensions.code', STATUS_CODES[code].replace(/\s/g, '_').toUpperCase());
      return err;
    },
  });
  if (isFn(beforeApply)) beforeApply({ app, server });
  server.applyMiddleware({ app, path });
  if (isFn(beforeApply)) afterApply({ app, server });
  return { app, server };
};
