// api.js
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import facturasRoutes from './facturas.js';

const fastify = Fastify({
  logger: true
});

const __dirname = path.resolve();

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public',
  index: 'tabla.html', // Nombre del archivo HTML principal
  list: false
});

// Rutas de las facturas - asegúrate de que coincidan exactamente con las rutas en facturas.js
fastify.register(facturasRoutes, { prefix: '/api/facturas' });

const start = async () => {
  try {
    await fastify.listen(3001);
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
