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

// Ruta para obtener todos los usuarios administradores
app.get('/usuarios/admin', async (req, res) => {
	try {
		const adminUsers = await prisma.user.findMany({
			where: {
				admin: true,
			},
		});
		res.json(adminUsers);
	} catch (error) {
		res.status(500).json({ error: 'Error al recuperar usuarios administradores' });
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
		res.json(usuarios);
	} catch (error) {
		res.status(500).json({ error: 'Error al recuperar usuarios con el dominio de correo electrónico especificado' });
	}
});

// Manejo de ruta no encontrada
app.use((req, res) => {
	res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT} in ${IN} ...`);
});
