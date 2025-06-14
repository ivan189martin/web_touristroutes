document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No tienes sesión activa');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`https://touristroutes.onrender.com/api/touristroutes/comentario/consultarTodosComentarios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los comentarios');
        }

        const comentarios = await response.json();
        mostrarComentarios(comentarios);
    } catch (error) {
        console.error('Error: ', error);
        alert('Error al cargar comentarios');
    }
});

function mostrarComentarios(lista) {
    const contenedor = document.getElementById('datos-lista');
    contenedor.innerHTML = '';

    lista.forEach(async comentario => {
        const token = localStorage.getItem('token');
        const nombreUsuario = await obtenerNombreUsuario(comentario.usuario, token);
        const nombreEntidad = await obtenerNombreEntidad(comentario.entidad, comentario.tipoEntidad, token);

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
        <div class="card-content">
            <div class="card-header">
                <h3>${nombreUsuario}</h3>
                <div class="card-actions">
                    <button class="delete-btn" data-id="${comentario.id}" title="Eliminar">
                        <img src="img/eliminar.png" alt="Eliminar" class="icono">
                    </button>
                </div>
            </div>
            <p><strong>Entidad:</strong> ${nombreEntidad}</p>
            <p><strong>Comentario:</strong> ${comentario.comentario}</p>
            <p><small>${comentario.fechaComentario}</small></p>
        </div>
        `;

        contenedor.appendChild(card);

        //Listener de eliminar
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const idComentario = button.getAttribute('data-id');
                const confirmacion = confirm('¿Estás seguro que deseas eliminar esta ruta?');
                if (!confirmacion) return;

                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`https://touristroutes.onrender.com/api/touristroutes/comentario/eliminarComentarioYValoracion/${idComentario}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar el comentario');
                    }

                    location.reload();
                } catch (error) {
                    console.error('Error al eliminar comentario: ', error);
                    alert('No se pudo eliminar el comentario');
                }
            });
        });
    });
}

//Obtener nombre de usuario por ID
function obtenerNombreUsuario(idUsuario, token) {
    return fetch(`http://localhost:8080/touristroutes/usuario/consultarUsuarioPorId/${idUsuario}`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    .then(response => response.ok ? response.json() : null)
    .then(usuario => usuario?.username || 'Usuario desconocido')
    .catch(error => {
        console.error('Error al obtener usuario:', error)
        return 'Error al obtener usuario'; 
    });
}

//Obtener nombre de entidad según tipo
function obtenerNombreEntidad(idEntidad, tipo, token) {
    let url;

    if (tipo === 'PUNTODEINTERES'){
        url = `http://localhost:8080/touristroutes/puntoDeInteres/consultarPuntoDeInteresPorId/${idEntidad}`;
    } else if (tipo === 'RUTA') {
        url = `http://localhost:8080/touristroutes/ruta/consultarRuta/${idEntidad}`;
    } else {
        return Promise.resolve('Entidad desconocida');
    }

    return fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    .then(response => response.ok ? response.json() : null)
    .then(entidad => entidad?.nombre || 'Entidad sin nombre')
    .catch(error => {
        console.error('Error al obtener entidad:', error)
        return 'Error al obtener entidad'; 
    });
}

