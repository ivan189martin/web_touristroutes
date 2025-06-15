document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No tienes sesión activa');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`https://server-touristroutes.onrender.com/touristroutes/usuario/consultarUsuarios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
        }

        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error('Error: ', error);
        alert('Error al cargar usuarios');
    }
});

function mostrarUsuarios(lista) {
    const contenedor = document.getElementById('datos-lista');
    contenedor.innerHTML = '';

    lista.forEach(usuario => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
        <div class="card-content">
            <div class="card-header">
                <h3>${usuario.username}</h3>
                <div class="card-actions">
                    <button class="edit-btn" data-id="${usuario.id}" data-rol="${usuario.rol}" title="Editar">
                        <img src="img/editar.png" alt="Editar" class="icono">
                    </button>
                    <button class="delete-btn" data-id="${usuario.id}" title="Eliminar">
                        <img src="img/eliminar.png" alt="Eliminar" class="icono">
                    </button>
                </div>
            </div>
            <p><strong>Nombre:</strong> ${usuario.nombre}</p>
            <p><strong>Apellidos:</strong> ${usuario.apellidos}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Fecha de nacimiento:</strong> ${usuario.fechaNacimiento}</p>
            <p><strong>Rol:</strong> <span class="rol-text">${usuario.rol}</span></p>
        </div>
        `;

        contenedor.appendChild(card);
    });

    //Listeners para eliminar
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const idUsuario = button.getAttribute('data-id');
            const confirmacion = confirm('¿Estás seguro que deseas eliminar este usuario?');
            if (!confirmacion) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://server-touristroutes.onrender.com/touristroutes/usuario/eliminarUsuario/${idUsuario}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar el usuario');
                }

                //Recargar la página después de eliminar
                location.reload();
            } catch (error) {
                console.error('Error al eliminar usuario: ', error);
                alert('No se pudo eliminar al usuario');
            }
        });
    });

    //Listeners para editar rol
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const idUsuario = button.getAttribute('data-id');
            const rolActual = button.getAttribute('data-rol');
            editarRol(idUsuario, rolActual, button)
        });
    });
}

//MODAL
let modal, selectRol, guardarBtn, cancelarBtn;
let idUsuarioEditado = null;
let botonEditActual = null;

function inicializarModal() {
    modal = document.getElementById('modal-editar-rol');
    selectRol = document.getElementById('rol-punto');
    guardarBtn = document.getElementById('guardar-cambio');
    cancelarBtn = document.getElementById('cancelar-edicion');

    guardarBtn.addEventListener('click', async () => {
        const nuevoRol = selectRol.value;
        const token = localStorage.getItem('token')

        //Obtener todos los datos del usuario desde la tarjeta
        const card = botonEditActual.closest('.card-content');
        const username = card.querySelector('h3').textContent;
        const nombre = card.querySelector('p:nth-of-type(1)').textContent.replace('Nombre: ', '');
        const apellidos = card.querySelector('p:nth-of-type(2)').textContent.replace('Apellidos: ', '');
        const email = card.querySelector('p:nth-of-type(3)').textContent.replace('Email: ', '');
        const fechaNacimiento = card.querySelector('p:nth-of-type(4)').textContent.replace('Fecha de nacimiento: ', '');

        //Crear el objeto completo
        const usuarioActualizado = {
            id: idUsuarioEditado,
            username: username,
            nombre: nombre,
            apellidos: apellidos,
            email: email,
            fechaNacimiento: fechaNacimiento,
            rol: nuevoRol
        };

        try {
            const response = await fetch(`https://server-touristroutes.onrender.com/touristroutes/usuario/actualizarUsuario`, {
                method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(usuarioActualizado)
            });

            if (!response.ok) throw new Error('Error al actualizar el rol');

            //Actualizar en la pantalla
            card.querySelector('.rol-text').textContent = nuevoRol;
            botonEditActual.setAttribute('data-rol', nuevoRol);

            cerrarModalEditarRol();
        } catch (error) {
            alert('No se pudo actualizar el rol: ' + error.message); 
        }
    });

    cancelarBtn.addEventListener('click', cerrarModalEditarRol);
}

function editarRol(id, rolActual, botonEdit) {
    idUsuarioEditado = id;
    botonEditActual = botonEdit,
    selectRol.value = rolActual;
    modal.classList.remove('oculto');
}

function cerrarModalEditarRol() {
    modal.classList.add('oculto');
    idUsuarioEditado = null;
    botonEditActual = null; 
}

inicializarModal(); 