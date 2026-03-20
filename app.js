// objetivo diario
let objetivo = 2600;

// detectar usuario en localStorage
let usuarioGuardado = localStorage.getItem("usuario");

// detectar bloques
let setupDiv = document.getElementById("setup");
let appDiv = document.getElementById("app");

// mostrar una cosa u otra dependiendo de si hay usuario guardado
if (usuarioGuardado === null) {
    setupDiv.style.display = "block";
    appDiv.style.display = "none";
} else {
    setupDiv.style.display = "none";
    appDiv.style.display = "block";
}

// boton para guardar usuario
let botonGuardar = document.getElementById("guardarUsuario");

botonGuardar.addEventListener("click", function() {

    let nombre = document.getElementById("nombre").value;
    let peso = Number(document.getElementById("peso").value);
    let objetivo = Number(document.getElementById("objetivo").value);
    let mantenimiento = Number(document.getElementById("mantenimiento").value);

    let usuario = {
        nombre: nombre,
        peso: peso,
        objetivo: objetivo,
        mantenimiento: mantenimiento
    };

    localStorage.setItem("usuario", JSON.stringify(usuario));

    location.reload(); // recarga para entrar en modo app
});

// buscamos el elemento en HTML y mostramos las calorías restantes
let restantesElemento = document.getElementById("restantes");
restantesElemento.textContent = "Calorías restantes: " + restantes;

// función para actualizar pantalla
function actualizarPantalla() {

    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    let hoy = new Date().toISOString().split("T")[0];

    let totalKcal = 0;

    registros.forEach(r => {
        if (r.fecha === hoy) {
            totalKcal += r.calorias;
        }
    });

    let restantes = objetivo - totalKcal;

    restantesElemento.textContent =
        "Calorías restantes: " + restantes;

        let estadoElemento = document.getElementById("estadoCalorias");

    if (restantes > 500) {
        estadoElemento.textContent = "Vas bien 🔥";
        estadoElemento.style.color = "green";

    } else if (restantes > 0) {
        estadoElemento.textContent = "Cuidado ⚠️";
        estadoElemento.style.color = "orange";

    } else {
        estadoElemento.textContent = "Te has pasado 🚨";
        estadoElemento.style.color = "red";
    }

    // animación
    restantesElemento.classList.remove("pop");
    void restantesElemento.offsetWidth; // reinicia animación
    restantesElemento.classList.add("pop");
}

// boton para registrar comida manualmente
let boton = document.getElementById("btnComida");
    
boton.addEventListener("click", function() {

    let calorias = Number(prompt("¿Cuántas calorías has comido?"));

    if (!calorias || calorias <= 0) return;

    let ahora = new Date();
    let fecha = ahora.toISOString().split("T")[0];
    let hora = ahora.toTimeString().split(" ")[0].slice(0,5);

    let registro = {
        fecha,
        hora,
        alimento: "Manual",
        gramos: "-",
        calorias,
        proteinas: 0
    };

    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    registros.push(registro);
    localStorage.setItem("registros", JSON.stringify(registros));

    mostrarRegistros();
    calcularTotalesHoy();
    actualizarPantalla();
});

// base de datos de alimentos (calorías por 100 gramos)
let alimentos = {

    arroz: {
        nombre: "Arroz integral",
        kcal: 350,
        hidratos: 72,
        proteinas: 7.6,
        grasas: 0
    },

    huevo: {
        nombre: "Huevo",
        kcal: 133,
        proteinas: 12.1,
        grasas: 9.2,
        gramosPorUnidad: 70
    },

    lomo: {
        nombre: "Lomo de cerdo duroc",
        kcal: 152,
        proteinas: 18,
        grasas: 8.9
    },

    pollo: {
        nombre: "Pechuga de pollo",
        kcal: 108,
        proteinas: 22,
        grasas: 1.8
    },

    contramuslo: {
        nombre: "Contramuslo de pollo",
        kcal: 127,
        proteinas: 19,
        grasas: 4.9
    },

    yogurt: {
        nombre: "Yogur proteico",
        kcal: 62,
        proteinas: 12,
        hidratos: 3.1,
        grasas: 0
    },

    atun: {
        nombre: "Atún al natural",
        kcal: 98,
        proteinas: 21,
        gramosPorUnidad: 60
    },

    aceite: {
        nombre: "Aceite de oliva",
        kcal: 900,
        grasas: 100
    }
};

// nueva versión del botón para agregar comida con cálculo de calorías y proteínas, y registro en localStorage
let botonAgregar = document.getElementById("btnAgregar");
botonAgregar.addEventListener("click", function() {

    let alimentoSeleccionado = document.getElementById("alimento").value;
    let cantidad = Number(inputCantidad.value);

    // ❌ evitar registros basura
    if (!cantidad || cantidad <= 0) {
        alert("Introduce una cantidad válida");
        return;
    }

    let alimento = alimentos[alimentoSeleccionado];

    let gramos;

    if (alimento.gramosPorUnidad) {
        gramos = cantidad * alimento.gramosPorUnidad;
    } else {
        gramos = cantidad;
    }

    let calorias = Math.round((alimento.kcal * gramos) / 100);
    let proteinas = Math.round((alimento.proteinas || 0) * gramos / 100);

    // 🕒 fecha y hora
    let ahora = new Date();
    let fecha = ahora.toISOString().split("T")[0];
    let hora = ahora.toTimeString().split(" ")[0].slice(0,5);

    let registro = {
        fecha,
        hora,
        alimento: alimento.nombre,
        gramos,
        calorias,
        proteinas
    };

    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    registros.push(registro);
    localStorage.setItem("registros", JSON.stringify(registros));

    // UI
    mostrarRegistros();
    actualizarPantalla();
    calcularTotalesHoy();

    // 🔥 UX PRO
    inputCantidad.value = "";
    inputCantidad.focus();

    // badge
    mostrarBadge("+" + calorias + " kcal");
});

// código para cambiar el placeholder dependiendo del alimento seleccionado
let selectAlimento = document.getElementById("alimento");
let inputCantidad = document.getElementById("gramos");

selectAlimento.addEventListener("change", function() {

    let seleccionado = selectAlimento.value;
    let alimento = alimentos[seleccionado];

    if (alimento.gramosPorUnidad) {
        inputCantidad.placeholder = "Unidades";
    } else {
        inputCantidad.placeholder = "Gramos";
    }

});

// permitir pulsar Enter para añadir comida
inputCantidad.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        botonAgregar.click();
    }
});

// función para mostrar los registros del día en la pantalla
function mostrarRegistros() {

    let lista = document.getElementById("listaRegistros");
    lista.innerHTML = "";

    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    let hoy = new Date().toISOString().split("T")[0];

    let registrosHoy = registros.filter(r => r.fecha === hoy);

    registrosHoy.forEach(r => {

        let item = document.createElement("li");
        item.classList.add("fade-in");

        item.textContent = 
            r.hora + " - " + 
            r.alimento + " - " + 
            r.gramos + "g - " + 
            r.calorias + " kcal";

        lista.appendChild(item);
    });

    // hacer scroll al final de la lista
    lista.scrollTop = lista.scrollHeight;
}
// llamar a la función para mostrar los registros al cargar la página
mostrarRegistros();

// función para calcular y mostrar totales de calorías y proteínas del día
function calcularTotalesHoy() {

    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    let hoy = new Date().toISOString().split("T")[0];

    let totalKcal = 0;
    let totalProte = 0;

    registros.forEach(r => {
        if (r.fecha === hoy) {
            totalKcal += r.calorias;
            totalProte += r.proteinas;
        }
    });

    document.getElementById("totalCalorias").textContent =
        "Calorías: " + totalKcal;

    document.getElementById("totalProteinas").textContent =
        "Proteínas: " + totalProte + "g";
}

// función para mostrar la fecha de hoy en formato "Hoy: 14 de septiembre de 2024"
function mostrarFechaHoy() {

    let ahora = new Date();

    let opciones = {
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    let fechaFormateada = ahora.toLocaleDateString("es-ES", opciones);

    document.getElementById("fechaHoy").textContent =
        "Hoy: " + fechaFormateada;
}

mostrarFechaHoy();

// función para mostrar un badge con el texto dado, que desaparece después de 1.5 segundos
function mostrarBadge(texto) {

    let badge = document.getElementById("badge");

    badge.textContent = texto;
    badge.classList.add("show");

    setTimeout(() => {
        badge.classList.remove("show");
    }, 1500);
}

// funcion para limpiar registros (para testing)
function limpiarRegistros() {
    localStorage.removeItem("registros");
    location.reload();
}
// función para eliminar usuario (para testing)
function eliminarUsuario() {
    localStorage.removeItem("usuario");
    location.reload();
}

let btnLimpiar = document.getElementById("btnLimpiar");
btnLimpiar.addEventListener("click", function() {
    if (confirm("¿Estás seguro de que quieres limpiar los registros?")) {
        limpiarRegistros();
    }
});

let btnEliminarUsuario = document.getElementById("btnEliminarUsuario");
btnEliminarUsuario.addEventListener("click", function() {
    if (confirm("¿Estás seguro de que quieres eliminar el usuario?")) {
        eliminarUsuario();
    }
});


// llamar a la función para calcular totales al cargar la página
calcularTotalesHoy();
// estado inicial
actualizarPantalla();