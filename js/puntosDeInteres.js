document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No tienes sesión activa');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`https://touristroutes.onrender.com/api/puntoDeInteres/consultarTodosPuntosDeInteres`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los puntos de interés');
        }

        const puntosDeInteres = await response.json();
        mostrarPuntosDeInteres(puntosDeInteres);
    } catch (error) {
        console.error('Error: ', error);
        alert('Error al cargar puntos de interés');
    }
});

function mostrarPuntosDeInteres(lista) {
    const contenedor = document.getElementById('datos-lista');
    contenedor.innerHTML = '';

    lista.forEach(punto => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
        <div class="card-content">
            <div class="card-header">
                <h3>${punto.nombre}</h3>
                <div class="card-actions">
                    <button class="edit-btn" data-id="${punto.id}" data-nombre="${punto.nombre}" title="Editar">
                        <img src="img/editar.png" alt="Editar" class="icono">
                    </button>
                    <button class="delete-btn" data-id="${punto.id}" title="Eliminar">
                        <img src="img/eliminar.png" alt="Eliminar" class="icono">
                    </button>
                </div>
            </div>
            <p><strong>Descripción:</strong> ${punto.descripcion}</p>
            <p><strong>Categoria:</strong> ${punto.categoria}</p>
        </div>
        `;

        contenedor.appendChild(card);
    });

    //Listeners para eliminar
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const idPuntoDeInteres = button.getAttribute('data-id');
            const confirmacion = confirm('¿Estás seguro que deseas eliminar este punto de interés?');
            if (!confirmacion) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://touristroutes.onrender.com/api/puntoDeInteres/eliminarPuntoDeInteres/${idPuntoDeInteres}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar el punto de interés');
                }

                //Recargar la página después de eliminar
                location.reload();
            } catch (error) {
                console.error('Error al eliminar punto de interés: ', error);
                alert('No se pudo eliminar el punto de interés');
            }
        });
    });

    //Listeners para editar rol
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const idPuntoDeInteres = button.getAttribute('data-id'); 
            const card = button.closest('.card-content'); 
            const descripcionActual = card.querySelector('p:nth-of-type(1)').textContent.replace('Descripción: ', '');
            const categoriaActual = card.querySelector('p:nth-of-type(2)').textContent.replace('Categoria: ', ''); 
            editarPuntoDeInteres(idPuntoDeInteres, descripcionActual, categoriaActual, button)
        });
    });

}

//MODAL
let modal, nombreInput, descripcionInput, categoriaSelect, guardarBtn, cancelarBtn;
let idPuntoEditado = null;
let botonEditActual = null;

function inicializarModal() {
    modal = document.getElementById('modal-editar-punto');
    nombreInput = document.getElementById('nombre-punto');
    descripcionInput = document.getElementById('descripcion-punto');
    categoriaSelect = document.getElementById('categoria-punto');
    guardarBtn = document.getElementById('guardar-cambio');
    cancelarBtn = document.getElementById('cancelar-edicion');

    guardarBtn.addEventListener('click', async () => {
        const nuevoNombre = nombreInput.value;
        const nuevaDescripcion = descripcionInput.value;
        const nuevaCategoria = categoriaSelect.value;
        const token = localStorage.getItem('token');

        //Crear el objeto completo
        const puntoDeInteresActualizado = {
            id: idPuntoEditado,
            nombre: nuevoNombre,
            descripcion: nuevaDescripcion,
            categoria: nuevaCategoria,
        };

        try {
            const response = await fetch(`https://touristroutes.onrender.com/api/puntoDeInteres/actualizarPuntoDeInteres`, {
                method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(puntoDeInteresActualizado)
            });

            if (!response.ok) throw new Error('Error al actualizar punto de interés');

            //Actualizar en la pantalla
            const card = botonEditActual.closest('.card-content');
            card.querySelector('h3').textContent = nuevoNombre
            card.querySelector('p:nth-of-type(1)').textContent = `Descripción: ${nuevaDescripcion}`;
            card.querySelector('p:nth-of-type(2)').textContent = `Categoría: ${nuevaCategoria}`;

            cerrarModalEditarPuntoDeInteres();
        } catch (error) {
            alert('No se pudo actualizar el punto de interés: ' + error.message); 
        }
    });

    cancelarBtn.addEventListener('click', cerrarModalEditarPuntoDeInteres);
}

function editarPuntoDeInteres(id, descripcionActual, categoriaActual, botonEdit) {
    idPuntoEditado = id;
    botonEditActual = botonEdit;

    const card = botonEdit.closest('.card-content');
    const nombre = card.querySelector('h3').textContent;

    nombreInput.value = nombre
    descripcionInput.value = descripcionActual;
    categoriaSelect.value = categoriaActual;
    modal.classList.remove('oculto');
}

function cerrarModalEditarPuntoDeInteres() {
    modal.classList.add('oculto');
    idPuntoEditado = null;
    botonEditActual = null; 
}

inicializarModal(); 