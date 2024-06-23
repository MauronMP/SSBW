// GeneraFacturas.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function GeneraFacturas() {
  try {
    // Genera 10 facturas
    for (let i = 1; i <= 10; i++) {
      const factura = {
        client: `Cliente ${i}`,
        date: new Date().toISOString(), // Fecha actual
        concept: `Concepto ${i}`,
        cuantity: Math.random() * 10, // Cantidad aleatoria entre 0 y 10
        price: Math.random() * 100, // Precio aleatorio entre 0 y 100
        total: Math.random() * 1000, // Total aleatorio entre 0 y 1000
      };

      // Crea la factura en la base de datos
      const createdFactura = await prisma.factura.create({
        data: factura,
      });

      console.log(`Factura ${i} creada:`, createdFactura);
    }
  } catch (error) {
    console.error('Error al generar las facturas:', error);
  } finally {
    await prisma.$disconnect(); // Cierra la conexión con la base de datos
  }
}

GeneraFacturas();
