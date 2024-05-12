import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function routes(fastify, options) {
    // Obtener una factura por su ID
    fastify.get("/:id", async (req, res) => {
        const { id } = req.params;

        try {
            const factura = await prisma.factura.findUnique({
                where: {
                    id: Number(id),
                },
            });

            if (!factura) {
                res.code(404).send({ error: `Factura con ID ${id} no encontrada` });
            } else {
                res.send({ factura });
            }
        } catch (error) {
            res.code(500).send({ error: "Error interno del servidor" });
        }
    });

    // Crear una nueva factura
    fastify.post("/", async (req, res) => {
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
            res.code(500).send({ error: "Error interno del servidor" });
        }
    });


    // Actualizar una factura existente
    fastify.put("/:id", async (req, res) => {
        const { id } = req.params;
        const { concepto, cantidad, precio } = req.body;

        try {
            const facturaActualizada = await prisma.factura.update({
                where: {
                    id: Number(id),
                },
                data: {
                    concepto,
                    cantidad,
                    precio,
                },
            });

            res.send({ factura: facturaActualizada });
        } catch (error) {
            res.code(500).send({ error: "Error interno del servidor" });
        }
    });

    // Eliminar una factura
    fastify.delete("/:id", async (req, res) => {
        const { id } = req.params;

        try {
            await prisma.factura.delete({
                where: {
                    id: Number(id),
                },
            });

            res.send({ message: `Factura con ID ${id} eliminada correctamente` });
        } catch (error) {
            res.code(500).send({ error: "Error interno del servidor" });
        }
    });
}

export default routes;
