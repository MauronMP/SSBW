import Fastify from 'fastify';
import facturasRoutes from './facturas.js';

const fastify = Fastify({
  logger: true
});

// prueba
fastify.get('/', async (req, res) => {
  res.send({ hello: 'world' });
});

// Register parent error handler
fastify.setErrorHandler((error, req, res) => {
  res.status(500).send({ ok: false, error });
});

// Registering facturas routes
fastify.register(facturasRoutes, { prefix: '/api/facturas' });

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
