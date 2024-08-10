document.addEventListener('DOMContentLoaded', function() {
    cargarProductosDesdeLocalStorage();
    actualizarListaCarrito();
});

document.getElementById('agregar').addEventListener('click', function() {
    const codigo = document.getElementById('codigo').value;
    const nombre = document.getElementById('nombre').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);

    if (codigo && nombre && cantidad > 0 && precio > 0) {
        const total = cantidad * precio;
        const producto = {
            codigo,
            nombre,
            cantidad,
            precio,
            total
        };

        agregarProductoATabla(producto);
        guardarProductoEnLocalStorage(producto);
        limpiarCampos();
    } else {
        alert('Por favor, completa todos los campos con valores válidos.');
    }
});

document.getElementById('limpiar').addEventListener('click', function() {
    limpiarCampos();
});

document.getElementById('agregarAlCarrito').addEventListener('click', function() {
    const productosSeleccionados = document.querySelectorAll('.producto-seleccionado:checked');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let productos = JSON.parse(localStorage.getItem('productos')) || [];

    productosSeleccionados.forEach(function(checkbox) {
        const fila = checkbox.parentElement.parentElement;
        const codigo = fila.cells[0].textContent;
        const cantidad = parseInt(fila.cells[2].textContent);
        const precio = parseFloat(fila.cells[3].textContent);

        if (cantidad > 0) {
            const productoExistente = carrito.find(p => p.codigo === codigo);
            if (productoExistente) {
                alert('El producto ya está en el carrito.');
                return;
            }

            const total = cantidad * precio;
            const productoCarrito = {
                codigo,
                nombre: fila.cells[1].textContent,
                cantidad,
                precio,
                total
            };

            carrito.push(productoCarrito);
            fila.querySelector('.producto-seleccionado').checked = false; // Desmarcar checkbox
        }
    });

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarListaCarrito();
});

function agregarProductoATabla(producto) {
    const tableBody = document.querySelector('#carrito tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${producto.codigo}</td>
        <td>${producto.nombre}</td>
        <td>${producto.cantidad}</td>
        <td>${producto.precio.toFixed(2)}</td>
        <td>${producto.total.toFixed(2)}</td>
        <td><input type="checkbox" class="producto-seleccionado"></td>
        <td><button class="btn btn-danger btn-sm eliminar">Eliminar</button></td>
    `;

    tableBody.appendChild(row);
}

function guardarProductoEnLocalStorage(producto) {
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.push(producto);
    localStorage.setItem('productos', JSON.stringify(productos));
}

function cargarProductosDesdeLocalStorage() {
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.forEach(producto => agregarProductoATabla(producto));
}

function actualizarListaCarrito() {
    const tableBody = document.getElementById('listaCarrito').querySelector('tbody');
    const totalCarritoElement = document.getElementById('totalCarrito');
    tableBody.innerHTML = '';  // Limpiar el contenido existente
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    let totalCarrito = 0;

    carrito.forEach(itemCarrito => {
        const producto = productos.find(p => p.codigo === itemCarrito.codigo);
        if (producto) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.nombre}</td>
                <td><input type="number" min="1" class="cantidad-carrito form-control" value="${itemCarrito.cantidad}"></td>
                <td>$${(producto.precio * itemCarrito.cantidad).toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm eliminar-item">Eliminar</button></td>
            `;
            tableBody.appendChild(row);

            // Event listener para actualizar cantidad
            row.querySelector('.cantidad-carrito').addEventListener('input', function() {
                const nuevaCantidad = parseInt(this.value);
                if (nuevaCantidad > producto.cantidad) {
                    alert('La cantidad ingresada excede la cantidad disponible.');
                    this.value = itemCarrito.cantidad;
                    return;
                }
                itemCarrito.cantidad = nuevaCantidad;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarListaCarrito();  // Recalcular el total
            });

            // Event listener para eliminar directamente desde la lista
            row.querySelector('.eliminar-item').addEventListener('click', function() {
                carrito = carrito.filter(c => c.codigo !== producto.codigo);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarListaCarrito();
            });

            // Calcular el total
            totalCarrito += producto.precio * itemCarrito.cantidad;
        }
    });

    // Actualizar el total en el HTML
    totalCarritoElement.textContent = `$${totalCarrito.toFixed(2)}`;
}


function limpiarCampos() {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('precio').value = '';
}
