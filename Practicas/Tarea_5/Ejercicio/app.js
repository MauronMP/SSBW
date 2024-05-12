// app.js

import express from 'express';
import nunjucks from 'nunjucks';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import flash from 'express-flash';
import dotenv from 'dotenv';
import authRouter from './auth.js'; // Importa el enrutador de autenticación
dotenv.config();

const IN = process.env.IN; // 'development' or 'production'
const PORT = process.env.PORT;

const prisma = new PrismaClient();
const app = express();

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

nunjucks.configure('views', {
    autoescape: true,
    noCache: IN == 'development',
    watch: IN == 'development',
    express: app,
});

app.set('view engine', 'html');

app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));

// Middleware para registrar eventos
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Esta es la inicialización básica de express-session({..}).
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));

// Middleware de passport.
app.use(passport.initialize());
app.use(passport.session());

// Permitir a passport usar "express-session".
app.use(flash());

// authUser es la función para comprobar credenciales y autenticar o no, definida más abajo.
passport.use(new LocalStrategy(authUser));

// información que se añade al request, una vez autenticado
// en req.session.passport.user
passport.serializeUser((userObj, done) => {
    done(null, userObj);
});

passport.deserializeUser((userObj, done) => {
    done(null, userObj);
});

// Un esbozo, habría que comprobar también la contraseña
// async porque dentro hay await
async function authUser(user, password, done) {
    logger.debug(`-----> Autenticando a ${user}`);
    logger.debug(`-----> con password ${password}`);

    // Busca el usuario, contraseña en la base de datos para autenticar al usuario
    const userdb = await prisma.user.findUnique({
        where: {
            username: user,
        },
    });

    // Si no existe el usuario
    if (!userdb) {
        logger.debug(`El usuario ${user} no está en la Base de Datos`);
        return done(null, false);
    }

    // Sí existe, pasa información al request
    const authenticated_user = { username: userdb.username, admin: userdb.admin };
    return done(null, authenticated_user);
}

// Rutas de autenticación
app.use('/auth', authRouter); // Monta el enrutador de autenticación en /auth

// Middleware para asegurar la autenticación antes de acceder a las rutas protegidas
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // Si el usuario está autenticado, continúa con la solicitud
    }
    res.redirect('/auth/login'); // Si el usuario no está autenticado, redirige a la página de inicio de sesión
};

// Aplica el middleware ensureAuthenticated a todas las rutas
app.use(ensureAuthenticated);

// Ruta para la página de inicio
app.get('/', async (req, res) => {
    try {
        const username = req.session.passport.user.username; // Obtener el username
        const adminUsers = await prisma.user.findMany({
            where: {
                admin: true,
            },
        });
        res.render('home', { title: 'Home', users: adminUsers, username: username });
    } catch (error) {
        res.status(500).json({ error: 'Error al recuperar usuarios administradores' });
    }
});

app.get('/P_3_1', async (req, res) => {
    try {
        const username = req.session.passport.user.username; // Obtener el username
        res.render('p_3_1', { title: 'p_3_1', username: username });
    } catch (error) {
        res.status(500).json({ error: 'Error al renderizar la página' });
    }
});

// Ruta para obtener usuarios con un correo electrónico en un dominio específico
app.get('/usuarios/con-email/de/:dominio', async (req, res) => {
    const dominio = req.params.dominio;
    try {
        const username = req.session.passport.user.username; // Obtener el username
        const usuarios = await prisma.user.findMany({
            where: {
                email: {
                    contains: `.${dominio}`,
                },
            },
        });
        res.render('home', { title: 'Home', users: usuarios, username: username });
    } catch (error) {
        res.status(500).json({ error: 'Error al recuperar usuarios con el dominio de correo electrónico especificado' });
    }
});

// Redirigir a la página de inicio con los datos obtenidos de la ruta específica
app.use('/usuarios/con-email/de/:dominio', async (req, res, next) => {
    const dominio = req.params.dominio;
    try {
        const username = req.session.passport.user.username; // Obtener el username
        const usuarios = await prisma.user.findMany({
            where: {
                email: {
                    contains: `.${dominio}`,
                },
            },
        });
        res.render('home', { title: 'Home', users: usuarios, username: username });
    } catch (error) {
        next(); // Si ocurre un error, pasa al siguiente middleware
    }
});

// Ruta para ver todas las facturas creadas
app.get('/ver-facturas', async (req, res) => {
    try {
        // Obtener todas las facturas
        const facturas = await prisma.factura.findMany();
        const username = req.session.passport.user.username; // Obtener el username

        // Pasar el username a la plantilla
        res.render('facturas', { title: 'Facturas', facturas: facturas, username: username });
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
