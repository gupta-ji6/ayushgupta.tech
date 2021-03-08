// ref - https://github.com/hasura/graphql-engine/blob/master/community/boilerplates/event-triggers/netlify-functions/nodejs/echo/functions/index.js

exports.handler = (event, context, callback) => {
  const {
    event: { op, data },
    table: { name, schema },
  } = JSON.parse(event.body);

  // Send the response
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ msg: 'Received event!', data: { op, data, name, schema } }),
  });
};
