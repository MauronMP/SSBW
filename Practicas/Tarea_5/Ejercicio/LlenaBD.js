// LlenaBD.js
// Llena la BD desde 
import fetch from 'node-fetch'; // Importa la función fetch
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const url = 'https://dummyjson.com/users';

LlenaBD(url);

async function LlenaBD(url) {
  try {
    const res = await fetch(url);
    const datos = await res.json(); // json en la respuesta
    const users = datos.users;

    for (const user of users) {
      const { firstName, lastName, email, username, image } = { ...user }; // ES6 Destructuring Assignment
      const usuario = {
        firstName, // como firstName: firstName
        lastName,
        email,
        username,
        image,
        password: '1234' // Establece la contraseña como '1234' para todos los usuarios
      };

      const createUser = await prisma.user.create({ data: usuario });
      console.log(createUser);
    }
  } catch (error) {
    console.error('Error al llenar la base de datos:', error);
  } finally {
    await prisma.$disconnect(); // Cierra la conexión al terminar
  }
}
