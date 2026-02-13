const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado")) || null;
const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

function checkSeguridad() {
    const href = window.location.href;
    
    if (!usuarioLogueado && !href.includes("login.html") && !href.includes("registro.html")) {
        window.location.href = "login.html";
    }
}
checkSeguridad();

//Datos y tal
const productos = {
    peluches: [
        { id: 1, nombre: "Osito", precio: 450, imagen: "imagensitas/osito.png" },
        { id: 2, nombre: "Panda", precio: 300, imagen: "imagensitas/panda.png" },
        { id: 3, nombre: "Conejito", precio: 200, imagen: "imagensitas/conejo.png" }
    ],
    flores: [
        { id: 4, nombre: "Rosa", precio: 80, imagen: "imagensitas/rosas.png" },
        { id: 5, nombre: "Ramo", precio: 350, imagen: "imagensitas/ramo.png" }
    ],
    otros: [
        { id: 6, nombre: "Regalo del jefe", precio: 10000, imagen: "imagensitas/Muñeco del jefe.png" }
    ]
};

let carrito = usuarioLogueado ? usuarioLogueado.carrito : [];

//Promedio de los favoritos
function obtenerPromedioProducto(idProducto) {
    let suma = 0;
    let cantidad = 0;

    // Buscamos las notas de este producto en TODOS los usuarios registrados
    usuarios.forEach(u => {
        if (u.calificaciones && u.calificaciones[idProducto]) {
            suma += parseInt(u.calificaciones[idProducto]);
            cantidad++;
        }
    });

    if (cantidad === 0) return "Sin notas";
    const promedio = (suma / cantidad).toFixed(1);
    return `${promedio} ⭐ (${cantidad} votos)`;
}

function cantidadFavoritosPermitidos(totalProductos) {
    if (totalProductos <= 3) return 1;
    if (totalProductos <= 6) return 2;
    return 3;
}

function obtenerFavoritos(categoria) {
    const lista = productos[categoria];

    const productosConPromedio = lista.map(p => {
        let suma = 0;
        let cantidad = 0;

        usuarios.forEach(u => {
            if (u.calificaciones && u.calificaciones[p.id]) {
                suma += parseInt(u.calificaciones[p.id]);
                cantidad++;
            }
        });

        const promedio = cantidad === 0 ? 0 : suma / cantidad;

        return { ...p, promedio };
    });

    productosConPromedio.sort((a, b) => b.promedio - a.promedio);

    const limite = cantidadFavoritosPermitidos(lista.length);
    return productosConPromedio.slice(0, limite);
}

function mostrarFavoritos() {
    if (typeof categoria === "undefined") return;

    const contenedor = document.getElementById("lista-favoritos");
    if (!contenedor) return;

    const favoritos = obtenerFavoritos(categoria);

    contenedor.innerHTML = "";

    favoritos.forEach(p => {
        contenedor.innerHTML += `
            <div class="producto favorito">
                <img src="${p.imagen}">
                <h3>${p.nombre}</h3>
                <p><strong>⭐ Promedio:</strong> ${p.promedio.toFixed(1)}</p>
                <p>Precio: $${p.precio}</p>
            </div>
        `;
    });
}

//Funcion de la tienda

function mostrarProductos() {
    if (typeof categoria === "undefined") return;
    const contenedor = document.getElementById("productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    productos[categoria].forEach(p => {
        const promedioGlobal = obtenerPromedioProducto(p.id);
        const miNota = usuarioLogueado?.calificaciones?.[p.id] || "No has calificado";
        
        contenedor.innerHTML += `
            <div class="producto">
                <img src="${p.imagen}">
                <h3>${p.nombre}</h3>
                <p>Precio: $${p.precio}</p>
                <div class="notas">
                    <p><strong>Nota Global:</strong> ${promedioGlobal}</p>
                    <p><small>Tu nota: ${miNota} ${miNota !== "No has calificado" ? "⭐" : ""}</small></p>
                </div>
                <button onclick='agregarAlCarrito(${JSON.stringify(p)})'>Agregar al Carrito</button>
                ${puedeCalificar(p.id) ? renderEstrellas(p.id) : ""}
            </div>
        `;
    });
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(item => item.id === producto.id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    guardarCarrito();
  
}

//Logica del carritini y tal
function actualizarCarrito() {
    const lista = document.getElementById("lista-carrito");
    const totalSpan = document.getElementById("total");
    if (!lista || !totalSpan) return; 
    lista.innerHTML = "";
    let total = 0;

    carrito.forEach((p, index) => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;
        lista.innerHTML += `
            <tr>
                <td><img src="${p.imagen}" width="50"></td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${p.cantidad}</td>
                <td>$${subtotal}</td>
                <td><button onclick="eliminar(${index})">❌</button></td>
            </tr>
        `;
    });
    totalSpan.textContent = total;
}

function eliminar(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }
    guardarCarrito();
    actualizarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}

function finalizarVenta() {
    if (carrito.length === 0) return;

    // pasa los id de los productos que se compran y tal
    carrito.forEach(p => {
        if (!usuarioLogueado.compras.includes(p.id)) {
            usuarioLogueado.compras.push(p.id);
        }
    });

    carrito = [];
    guardarCarrito();
    window.location.href = "index.html"; 
}

//SISTEMA DE CALIFICACIÓN

function puedeCalificar(idProducto) {
    return usuarioLogueado && usuarioLogueado.compras.includes(idProducto);
}

function renderEstrellas(idProducto) {
    return `
        <div class="rating">
            <select onchange="calificar(${idProducto}, this.value)">
                <option value="0">⭐ Votar</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </div>
    `;
}

function calificar(idProducto, estrellas) {
    if (estrellas == 0) return;
    usuarioLogueado.calificaciones[idProducto] = estrellas;
    guardarCarrito();
    mostrarProductos();
}

//PERSISTENCIA Y SESIÓN
function guardarCarrito() {
    if (usuarioLogueado) {
        usuarioLogueado.carrito = carrito;
        // Guardar en la seión 
        localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioLogueado));
        
        // Sincronizar la wea de usuarios :3
        const index = usuarios.findIndex(u => u.user === usuarioLogueado.user);
        if (index !== -1) {
            usuarios[index].carrito = carrito;
            usuarios[index].compras = usuarioLogueado.compras;
            usuarios[index].calificaciones = usuarioLogueado.calificaciones;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
        }
    }
}

function login() {
    const user = document.getElementById("log-usuario").value.trim();
    const pass = document.getElementById("log-pass").value.trim();
    const validUser = usuarios.find(u => u.user === user && u.pass === pass);

    if (validUser) {
        localStorage.setItem("usuarioLogueado", JSON.stringify(validUser));
        window.location.href = "index.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

function registrar() {
    const user = document.getElementById("reg-usuario").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();
    if (!user || !pass) return;

    if (usuarios.find(u => u.user === user)) {
        alert("El usuario ya existe");
        return;
    }

    usuarios.push({ user, pass, carrito: [], compras: [], calificaciones: {} });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    window.location.href = "login.html";
}

function logout() {
    guardarCarrito();
    localStorage.removeItem("usuarioLogueado");
    window.location.href = "login.html";
}

/* =========================
    CARGA INICIAL
========================= */
document.addEventListener("DOMContentLoaded", () => {
    if (usuarioLogueado) {
        const navInfo = document.getElementById("nombre-usuario");
        if (navInfo) navInfo.textContent = `Hola, ${usuarioLogueado.user}`;

        const btnLogout = document.getElementById("btn-logout");
        if (btnLogout) btnLogout.style.display = "inline";
    }

    mostrarFavoritos();   
    mostrarProductos();
    actualizarCarrito();
});
