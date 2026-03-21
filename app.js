// app.js

// variable global para el gráfico semanal
let miGrafico = null;

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

// función para actualizar pantalla
function actualizarPantalla() {

    let usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    let objetivo = usuario.objetivo;

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

    calcularBalanceSemanal();
    mostrarRegistros();
    calcularTotalesHoy();

    // animación
    restantesElemento.classList.remove("pop");
    void restantesElemento.offsetWidth;
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
        grasas: 0,
        gramosPorUnidad: 120
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
    actualizarPantalla();

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

// función para calcular y mostrar el balance semanal (promedio de calorías diarias y balance respecto al objetivo)
function calcularBalanceSemanal() {

    let usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    let mantenimiento = usuario.mantenimiento;

    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    let hoy = new Date();

    let total = 0;
    let dias = 0;

    for (let i = 0; i < 7; i++) {

        let fecha = new Date();
        fecha.setDate(hoy.getDate() - i);

        let fechaStr = fecha.toISOString().split("T")[0];

        let kcalDia = 0;

        registros.forEach(r => {
            if (r.fecha === fechaStr) {
                kcalDia += r.calorias;
            }
        });

        if (kcalDia > 0) {
            total += kcalDia;
            dias++;
        }
    }

    let promedio = dias > 0 ? Math.round(total / dias) : 0;

    let balance = promedio - mantenimiento;

    // mostrar en pantalla
    document.getElementById("promedio7").textContent =
        "Promedio: " + promedio + " kcal";

    let balanceElemento = document.getElementById("balance7");

    balanceElemento.textContent =
        "Balance: " + balance + " kcal";

    // colores tipo semáforo
    if (balance < -300) {
        balanceElemento.style.color = "green";

    } else if (balance < 0) {
        balanceElemento.style.color = "orange";

    } else {
        balanceElemento.style.color = "red";
    }
}

// función para abrir/cerrar el gráfico semanal (usando Chart.js)
document.getElementById("balanceSemanal").onclick = function() {
    abrirGrafico();
};

function abrirGrafico() {
    let pantalla = document.getElementById("pantallaGrafico");

    if (pantalla.style.display === "block") return;

    pantalla.style.display = "block";
    dibujarGrafico();
}

function cerrarGrafico() {
    document.getElementById("pantallaGrafico").style.display = "none";
}

// función para dibujar el gráfico semanal de calorías usando Chart.js
function dibujarGrafico() {

    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    let usuario = JSON.parse(localStorage.getItem("usuario"));
    let mantenimiento = usuario.mantenimiento;

    let hoy = new Date();

    let dias = [];
    let calorias = [];

    for (let i = 6; i >= 0; i--) {

        let fecha = new Date();
        fecha.setDate(hoy.getDate() - i);

        let fechaStr = fecha.toISOString().split("T")[0];

        let kcalDia = 0;

        registros.forEach(r => {
            if (r.fecha === fechaStr) {
                kcalDia += r.calorias;
            }
        });

        dias.push(fechaStr.slice(5));
        calorias.push(kcalDia);
    }

    // encontrar el mejor y peor día para mostrar en el tooltip
    let mejorIndex = -1;
    let peorIndex = -1;

    let mejorDeficit = -Infinity;
    let peorDeficit = Infinity;

    calorias.forEach((c, i) => {

        let deficit = mantenimiento - c;

        if (deficit > mejorDeficit) {
            mejorDeficit = deficit;
            mejorIndex = i;
        }

        if (deficit < peorDeficit) {
            peorDeficit = deficit;
            peorIndex = i;
        }
    });

    // mostrar mejor y peor día en la pantalla
    let info = document.getElementById("infoSemana");

    info.textContent =
        "🔥 Mejor día: " + dias[mejorIndex] +
        " | 🚨 Peor día: " + dias[peorIndex];


    // calcular colores para cada barra dependiendo de lo cerca que esté del objetivo
    let backgroundColors = calorias.map(c => {

    let deficit = mantenimiento - c;

    if (deficit >= 400 && deficit <= 800) {
        return "green"; // 🔥 perfecto
    }

    if (deficit > 800) {
        return "orange"; // ⚠️ demasiado agresivo
    }

    if (deficit <= 0) {
        return "red"; // 🚨 te pasaste
    }

    return "gray"; // meh
    });


    // obtener contexto del canvas
    let ctx = document.getElementById("grafico").getContext("2d");

    // 🔥 CLAVE para no crear múltiples gráficos
    if (miGrafico) {
        miGrafico.destroy();
    }

    miGrafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: dias,
            datasets: [{
                label: "Calorías",
                data: calorias,
                backgroundColor: backgroundColors
            }]
        }
    });
}

// registros de prueba para no tener que meter comida cada día durante el desarrollo
let registrosTest = [
    { fecha: "2026-03-20", calorias: 3500 },
    { fecha: "2026-03-19", calorias: 2500 },
    { fecha: "2026-03-18", calorias: 1800 },
    { fecha: "2026-03-17", calorias: 3000 },
    { fecha: "2026-03-16", calorias: 2600 },
    { fecha: "2026-03-15", calorias: 1000 },
    { fecha: "2026-03-14", calorias: 1900 },
    { fecha: "2026-03-13", calorias: 2300 },
    { fecha: "2026-03-13", calorias: 3100 },
    { fecha: "2026-03-12", calorias: 2500 },
    { fecha: "2026-03-11", calorias: 1800 },
    { fecha: "2026-03-10", calorias: 3500 },
    { fecha: "2026-03-13", calorias: 2300 },
    { fecha: "2026-03-13", calorias: 3100 },
    { fecha: "2026-03-12", calorias: 2400 },
    { fecha: "2026-03-11", calorias: 1800 },
    { fecha: "2026-03-10", calorias: 2600 }
];
// guardar registros de prueba en el almacenamiento local
localStorage.setItem("registros", JSON.stringify(registrosTest));




// llamar a la función para calcular totales al cargar la página
calcularTotalesHoy();
// estado inicial
actualizarPantalla();


console.log("objetivo:", objetivo);