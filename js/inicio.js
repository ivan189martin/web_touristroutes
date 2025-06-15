document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); //Evita que se recargue la página

    //Obtener valores del formulario
    const username = this.username.value.trim()
    const password = this.password.value

    try {
        const response = await fetch('https://server-touristroutes.onrender.com/touristroutes/usuario/validarUsuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password})
        });

        if (!response.ok) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        const data = await response.json();

        //Suponemos que la API devuelve el token
        const { token, rol } = data;

        //Guardar token y rol en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol)

        if (rol == 'ADMIN') {
            alert('No tienes permisos de adminstrador');
            return
        }

        //Redirigist a página de opciones
        window.location.href = 'opciones.html';


    } catch(error) {
        alert(error.message);
    }
});


