
import express from 'express';
import nunjucks from 'nunjucks';
import { PrismaClient } from '@prisma/client';

import * as dotenv from 'dotenv';
dotenv.config();

const IN = process.env.IN; // 'development' or 'production'
const PORT = process.env.PORT;

const prisma = new PrismaClient();

const app = express();

nunjucks.configure('views', {
  autoescape: true,
  noCache: IN == 'development',
  watch: IN == 'development',
  express: app,
});

app.set('view engine', 'html');

app.use(express.static('views'));

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

// Manejo de ruta no encontrada
app.use((req, res) => {
  res.status(404).render('base', { title: 'Error 404', content: 'Página no encontrada' });
});



app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${IN} ...`);
});
