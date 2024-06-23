// tabla.js
window.onload = async () => {
    console.log("La página está totalmente cargada");

    try {
        // Hacer la solicitud GET para obtener las facturas
        const response = await fetch('http://localhost:3001/api/facturas/');
        const data = await response.json();
        const facturas = data.data;

        // Obtener referencia al tbody de la tabla donde se insertarán los datos
        const tbody = document.querySelector('tbody');
        let tbodyHtml = '';

        // Iterar sobre las facturas para construir el HTML de la tabla
        facturas.forEach(fac => {
            fac.date = fac.date.slice(2, 10); // Asumiendo que fac.date es un string y quieres recortar desde el tercer carácter
            tbodyHtml += `
                <tr>
                    <td>${fac.id}</td>
                    <td><input type="text" value="${fac.client}" name="client" data-id="${fac.id}"></td>
                    <td><input type="text" value="${fac.date}" name="date" data-id="${fac.id}"></td>
                    <td><input type="text" value="${fac.concept}" name="concept" data-id="${fac.id}"></td>
                    <td><input type="number" value="${fac.cuantity}" name="cuantity" data-id="${fac.id}"></td>
                    <td><input type="number" value="${fac.price}" name="price" data-id="${fac.id}"></td>
                    <td><input type="number" value="${fac.total}" name="total" data-id="${fac.id}"></td>
                </tr>
            `;
        });

        // Insertar el HTML generado dentro del tbody
        tbody.innerHTML = tbodyHtml;

        // Agregar un event listener al tbody para escuchar cambios en los inputs
        tbody.addEventListener('change', async (evt) => {
            if (evt.target.tagName === 'INPUT') {
                const value = evt.target.value;
                const name = evt.target.name;
                const id = evt.target.dataset.id;

                console.log(`Cambios en ${id} ${name} ${value}`);

                // Aquí puedes agregar la lógica para enviar los cambios a la base de datos
                // Por ejemplo, podrías hacer una solicitud PUT usando fetch para actualizar la factura correspondiente

                try {
                    const response = await fetch(`http://localhost:3001/api/facturas/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            [name]: value  // Solo envía el campo modificado
                        })
                    });

                    const data = await response.json();
                    console.log('Respuesta del servidor:', data);
                    // Aquí puedes manejar la respuesta del servidor, por ejemplo, mostrar un mensaje de éxito
                } catch (error) {
                    console.error('Error al actualizar la factura:', error.message);
                    // Manejo de errores
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener las facturas:', error.message);
        // Manejo de errores
    }
};
