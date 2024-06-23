// facturas.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function routes(fastify, options) {
    // Obtener todas las facturas
    fastify.get('/', async (req, res) => {
        try {
            const facturas = await prisma.factura.findMany();
            res.send({ data: facturas });
        } catch (error) {
            res.status(500).send({ error: 'Error interno del servidor' });
        }
    });

    // Crear una nueva factura
    fastify.post('/', async (req, res) => {
        const { client, date, concept, cuantity, price, total } = req.body;

        try {
            const nuevaFactura = await prisma.factura.create({
                data: {
                    client,
                    date,
                    concept,
                    cuantity,
                    price,
                    total,
                },
            });

            res.send({ factura: nuevaFactura });
        } catch (error) {
            res.status(500).send({ error: 'Error interno del servidor' });
        }
    });

    // Actualizar una factura existente
    fastify.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { client, date, concept, cuantity, price, total } = req.body;

        try {
            const facturaActualizada = await prisma.factura.update({
                where: { id: Number(id) },
                data: { client, date, concept, cuantity, price, total },
            });

            res.send({ factura: facturaActualizada });
        } catch (error) {
            res.status(500).send({ error: 'Error interno del servidor' });
        }
    });

    // Eliminar una factura
    fastify.delete('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            await prisma.factura.delete({ where: { id: Number(id) } });
            res.send({ message: `Factura con ID ${id} eliminada correctamente` });
        } catch (error) {
            res.status(500).send({ error: 'Error interno del servidor' });
        }
    });
}

export default routes;
