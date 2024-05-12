import express from 'express';
import nunjucks from 'nunjucks';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';

import * as dotenv from 'dotenv';
dotenv.config();

const IN = process.env.IN; // 'development' or 'production'
const PORT = process.env.PORT;

const prisma = new PrismaClient();

// Configuración del logger
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'app.log',
      level: 'info',
    }),    
  ],
});

const app = express();

nunjucks.configure('views', {
  autoescape: true,
  noCache: IN == 'development',
  watch: IN == 'development',
  express: app,
});

app.set('view engine', 'html');

app.use(express.static('views'));

// Middleware para registrar eventos
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Ruta para la página de inicio
app.get('/', async (req, res) => {
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        admin: true,
      },
    });
    res.render('home', { title: 'Home', users: adminUsers });
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar usuarios administradores' });
  }
});

app.get('/P_3_1', async (req, res) => {
  try {
    res.render('p_3_1', { title: 'p_3_1' });
  } catch (error) {
    res.status(500).json({ error: 'Error al renderizar la página' });
  }
});

// Ruta para obtener usuarios con un correo electrónico en un dominio específico
app.get('/usuarios/con-email/de/:dominio', async (req, res) => {
  const dominio = req.params.dominio;
  try {
    const usuarios = await prisma.user.findMany({
      where: {
        email: {
          contains: `.${dominio}`,
        },
      },
    });
    res.render('home', { title: 'Home', users: usuarios });
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar usuarios con el dominio de correo electrónico especificado' });
  }
});

// Redirigir a la página de inicio con los datos obtenidos de la ruta específica
app.use('/usuarios/con-email/de/:dominio', async (req, res, next) => {
  const dominio = req.params.dominio;
  try {
    const usuarios = await prisma.user.findMany({
      where: {
        email: {
          contains: `.${dominio}`,
        },
      },
    });
    res.render('home', { title: 'Home', users: usuarios });
  } catch (error) {
    next(); // Si ocurre un error, pasa al siguiente middleware
  }
});

// Ruta para ver todas las facturas creadas
app.get('/ver-facturas', async (req, res) => {
  try {
    // Obtener todas las facturas
    const facturas = await prisma.factura.findMany();
    res.render('facturas', { title: 'Facturas', facturas: facturas });
  } catch (error) {
    logger.error('Error al recuperar las facturas:', error);
    res.status(500).render('base', { title: 'Error 500', content: 'Error interno del servidor' });
  }
});

// Manejo de ruta no encontrada
app.use((req, res) => {
  res.status(404).render('base', { title: 'Error 404', content: 'Página no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).render('base', { title: 'Error 500', content: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT} in ${IN} ...`);
});
