document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No tienes sesión activa');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`https://touristroutes.onrender.com/api/touristroutes/ruta/consultarTodasRutas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las rutas');
        }

        const rutas = await response.json();
        mostrarRutas(rutas);
    } catch (error) {
        console.error('Error: ', error);
        alert('Error al cargar rutas');
    }
});

function mostrarRutas(lista) {
    const contenedor = document.getElementById('datos-lista');
    contenedor.innerHTML = '';

    lista.forEach(ruta => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
        <div class="card-content">
            <div class="card-header">
                <h3>${ruta.nombre}</h3>
                <div class="card-actions">
                    <button class="edit-btn" data-id="${ruta.id}" data-nombre="${ruta.nombre}" title="Editar">
                        <img src="img/editar.png" alt="Editar" class="icono">
                    </button>
                    <button class="delete-btn" data-id="${ruta.id}" title="Eliminar">
                        <img src="img/eliminar.png" alt="Eliminar" class="icono">
                    </button>
                </div>
            </div>
            <p><strong>Descripción:</strong> ${ruta.descripcion}</p>
        </div>
        `;

        contenedor.appendChild(card);
    });

    //Listeners para eliminar
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const idRuta = button.getAttribute('data-id');
            const confirmacion = confirm('¿Estás seguro que deseas eliminar esta ruta?');
            if (!confirmacion) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://touristroutes.onrender.com/api/touristroutes/ruta/eliminarRuta/${idRuta}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar la ruta');
                }

                //Recargar la página después de eliminar
                location.reload();
            } catch (error) {
                console.error('Error al eliminar ruta: ', error);
                alert('No se pudo eliminar la ruta');
            }
        });
    });

    //Listeners para editar rol
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const idRuta = button.getAttribute('data-id'); 
            const card = button.closest('.card-content'); 
            const descripcionActual = card.querySelector('p:nth-of-type(1)').textContent.replace('Descripción: ', '');
            editarRuta(idRuta, descripcionActual, button)
        });
    });

}

//MODAL
let modal, nombreInput, descripcionInput, guardarBtn, cancelarBtn;
let idRutaEditado = null;
let botonEditActual = null;

function inicializarModal() {
    modal = document.getElementById('modal-editar-ruta');
    nombreInput = document.getElementById('nombre-ruta');
    descripcionInput = document.getElementById('descripcion-ruta');
    guardarBtn = document.getElementById('guardar-cambio');
    cancelarBtn = document.getElementById('cancelar-edicion');

    guardarBtn.addEventListener('click', async () => {
        const nuevoNombre = nombreInput.value;
        const nuevaDescripcion = descripcionInput.value;
        const token = localStorage.getItem('token');

        //Crear el objeto completo
        const rutaActualizada = {
            id: idRutaEditada,
            nombre: nuevoNombre,
            descripcion: nuevaDescripcion,
        };

        try {
            const response = await fetch(`https://touristroutes.onrender.com/api/touristroutes/ruta/actualizarRuta`, {
                method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(rutaActualizada)
            });

            if (!response.ok) throw new Error('Error al actualizar ruta');

            //Actualizar en la pantalla
            const card = botonEditActual.closest('.card-content');
            card.querySelector('h3').textContent = nuevoNombre
            card.querySelector('p:nth-of-type(1)').textContent = `Descripción: ${nuevaDescripcion}`;

            cerrarModalEditarRuta();
        } catch (error) {
            alert('No se pudo actualizar la ruta: ' + error.message); 
        }
    });

    cancelarBtn.addEventListener('click', cerrarModalEditarRuta);
}

function editarRuta(id, descripcionActual, botonEdit) {
    idRutaEditada = id;
    botonEditActual = botonEdit;

    const card = botonEdit.closest('.card-content');
    const nombre = card.querySelector('h3').textContent;

    nombreInput.value = nombre
    descripcionInput.value = descripcionActual;
    modal.classList.remove('oculto');
}

function cerrarModalEditarRuta() {
    modal.classList.add('oculto');
    idRutaEditada = null;
    botonEditActual = null; 
}

inicializarModal(); 