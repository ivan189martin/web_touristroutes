function opciones() {
    window.location.href = "/opciones.html"; //Se pasa a opciones.html
}

function cerrarSesion() {
    localStorage.removeItem("token"); //Se borra el token
    window.location.href = "/index.html"; //Se pasa a index.html
}