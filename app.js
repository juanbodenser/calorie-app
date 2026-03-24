// app.js
document.addEventListener("DOMContentLoaded", () => { // aseguramos que el DOM esté cargado antes de ejecutar el código

    // variable global para el gráfico semanal
    let miGrafico = null;

    // referencias a elementos del DOM que se usarán en varias funciones
    const selectAlimento = document.getElementById("alimento");
    const inputGramos = document.getElementById("gramos");
    const botonAgregar = document.getElementById("btnAgregar");

    // funcion para detectar usuario en localStorage
    function obtenerUsuario() {
        return JSON.parse(localStorage.getItem("usuario"));
    }

    let usuarioGuardado = obtenerUsuario();

    // detectar bloques
    let setupDiv = document.getElementById("setup");
    let appDiv = document.getElementById("app");

    // mostrar una cosa u otra dependiendo de si hay usuario guardado
    if (!usuarioGuardado) {
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

    // referencia al estadoBox para mostrar el estado del día (calorías restantes, mensaje de ánimo, etc.)
    let estadoBox = document.getElementById("estadoBox");

    // función para actualizar pantalla
    function actualizarPantalla() {

        if (!obtenerUsuario()) return; // seguridad por si se llama sin usuario
        let {objetivo} = obtenerUsuario(); // desestructuración para obtener el objetivo

        let registros = JSON.parse(localStorage.getItem("registros")) || [];
        let hoy = new Date().toISOString().split("T")[0];

        // calcular totales del día
        let totalKcal = 0;
        let totalProteinas = 0;

        registros.forEach(r => {
            if (r.fecha === hoy) {
                totalKcal += r.calorias;
                totalProteinas += r.proteinas || 0; // por si no existe
                }
            });

        // calcular calorías restantes para el objetivo
        let restantes = objetivo - totalKcal;
        // mostrar en pantalla
        let mensaje = "";
        let color = "";

        if (restantes > 500) {
            mensaje = "Vas bien 🔥";
            color = "green";
        } else if (restantes > 0) {
            mensaje = "Cuidado ⚠️";
            color = "orange";
        } else {
            mensaje = "Te has pasado 🚨";
            color = "red";
        }

        // Renderizar toda la información en el estadoBox sin sobrescribir cada parte, para evitar problemas de sincronización
        estadoBox.innerHTML = `
            <strong>Estado</strong><br><br>

            🔥 Calorías restantes: <span style="color:${color}; font-weight:bold;">${restantes} kcal</span><br>
            🎯 Objetivo: ${objetivo} kcal<br>
            🍽️ Consumidas hoy: ${totalKcal} kcal<br>
            💪 Proteínas: ${totalProteinas} g<br><br>

            <span style="color:${color}; font-weight:bold;">
                ${mensaje}
            </span>
        `;

        mostrarBalanceSemanal();
        mostrarRegistros();

        // animación
            
        estadoBox.classList.remove("pop");
        void estadoBox.offsetWidth;
        estadoBox.classList.add("pop");
    }

    // función para obtener datos de la semana (días, calorías, promedio, balance) para mostrar en el gráfico semanal y en el resumen de la semana
    function obtenerDatosSemana() {

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

        let promedio = Math.round(
            calorias.reduce((a, b) => a + b, 0) / calorias.length
        );

        let balance = promedio - mantenimiento;

        return {
            dias,
            calorias,
            promedio,
            balance,
            mantenimiento
        };
    }

    // base de datos de alimentos (calorías por 100 gramos)
    let alimentos = [

        {
            id: "arroz_crudo",
            nombre: "Arroz integral crudo",
            kcal: 350,
            hidratos: 72,
            proteinas: 7.6,
            grasas: 0
        },

        {
            id: "arroz_integral_cocido",
            nombre: "Arroz integral cocido",
            kcal: 129,
            hidratos: 26.5,
            proteinas: 2.8,
            grasas: 0
        },

        {
            id: "arroz_jazmin_crudo",
            nombre: "Arroz jazmín crudo",
            kcal: 353,
            hidratos: 78,
            proteinas: 6.9,
            grasas: 1.2
        },

        {
            id: "arroz_jazmin_cocido",
            nombre: "Arroz jazmín cocido",
            kcal: 154,
            hidratos: 34,
            proteinas: 3,
            grasas: 0.5
        },

        {
            id: "huevo",
            nombre: "Huevo",
            kcal: 133,
            proteinas: 12.1,
            grasas: 9.2,
            gramosPorUnidad: 70
        },

        {
            id: "lomo",
            nombre: "Lomo de cerdo duroc",
            kcal: 152,
            proteinas: 18,
            grasas: 8.9
        },

        {
            id: "pollo",
            nombre: "Pechuga de pollo",
            kcal: 108,
            proteinas: 22,
            grasas: 1.8
        },

        {
            id: "contramuslo",
            nombre: "Contramuslo de pollo",
            kcal: 127,
            proteinas: 19,
            grasas: 4.9
        },

        {
            id: "yogurt",
            nombre: "Yogur proteico",
            kcal: 62,
            proteinas: 12,
            hidratos: 3.1,
            grasas: 0,
            gramosPorUnidad: 120
        },

        {
            id: "atun",
            nombre: "Atún al natural",
            kcal: 98,
            proteinas: 21,
            gramosPorUnidad: 60
        },

        {
            id: "aceite",
            nombre: "Aceite de oliva",
            kcal: 900,
            grasas: 100
        }
    ];

    // función para obtener el alimento seleccionado en el formulario, buscando por su id en la base de datos de alimentos
    function obtenerAlimentoSeleccionado() {

            const id = selectAlimento.value;

            return alimentos.find(a => a.id === id);
        }

    // nueva versión del botón para agregar comida con cálculo de calorías y proteínas, y registro en localStorage

    botonAgregar.addEventListener("click", function() {

        const cantidad = Number(inputGramos.value);

        // evitar registros basura
        if (!cantidad || cantidad <= 0) {
            alert("Introduce una cantidad válida");
            return;
        }
    
        const alimento = obtenerAlimentoSeleccionado();
        if (!alimento) return;

        // 1. Cálculo de gramos con ternario (¡Mucho más limpio!)
        // Si hay gramosPorUnidad, multiplicamos; si no, usamos la cantidad tal cual.
        const gramosTotales = alimento.gramosPorUnidad 
            ? cantidad * alimento.gramosPorUnidad 
            : cantidad;

        // 2. Cálculo de macros con protección (|| 0) y redondeo (Math.round) para evitar decimales feos
        // Usamos (gramosTotales / 100) porque tus kcal son por cada 100g
        const factor = gramosTotales / 100;
        
        const calorias = Math.round(alimento.kcal * factor)
        const proteinas = Math.round((alimento.proteinas || 0) * factor)
        const hidratos = Math.round((alimento.hidratos || 0) * factor)

        // 🕒 fecha y hora
        const ahora = new Date();
        const fecha = ahora.toISOString().split("T")[0];
        const hora = ahora.toTimeString().split(" ")[0].slice(0, 5);

        let registro = {
            fecha,
            hora,
            alimento: alimento.nombre,
            gramosTotales,
            calorias,
            proteinas,
            hidratos
        };

        const registros = JSON.parse(localStorage.getItem("registros")) || [];
        registros.push(registro);
        localStorage.setItem("registros", JSON.stringify(registros));

        // UX: Limpiar y foco
        inputGramos.value = "";
        inputGramos.focus();

        // badge
        mostrarBadge(`+${calorias} kcal`);

        actualizarPantalla();
    });

    // permitir pulsar Enter para añadir comida
    inputGramos.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            botonAgregar.click();
        }
    });

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
                r.gramosTotales + "g - " + 
                r.calorias + " kcal";

            lista.appendChild(item);
        });

        // hacer scroll al final de la lista
        lista.scrollTop = lista.scrollHeight;
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
    function mostrarBalanceSemanal() {

        let { promedio, balance } = obtenerDatosSemana();

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

    // función para abrir gráfico semanal (usando Chart.js)
    document.getElementById("balanceSemanal").onclick = function() {
        abrirGrafico();
    };

    function abrirGrafico() {
        document.getElementById("pantallaPrincipal").style.display = "none";
        document.getElementById("pantallaGrafico").style.display = "block";
        setTimeout(() => {
            dibujarGrafico();
        }, 50); // pequeño delay para asegurar que el canvas esté visible
    }

    function cerrarGrafico() {
        document.getElementById("pantallaGrafico").style.display = "none";
        document.getElementById("pantallaPrincipal").style.display = "block";
    }

    // llamar función para cerrar gráfico al hacer clic en el botón de cerrar
    document.getElementById("cerrarGrafico").onclick = function() {
        cerrarGrafico();
    };

    // función para dibujar el gráfico semanal de calorías usando Chart.js
    function dibujarGrafico() {
        // obtener datos de la semana
        let { dias, calorias, promedio, balance, mantenimiento } = obtenerDatosSemana(); // usamos desestructuración para obtener todo lo que necesitamos en una sola línea

        // 🔍 encontrar mayor y menor consumo
        let max = Math.max(...calorias);
        let min = Math.min(...calorias);

        let indexMax = calorias.indexOf(max);
        let indexMin = calorias.indexOf(min);

        // 🖥️ mostrar toda la info junta (SIN sobrescribir)
        let info = document.getElementById("infoSemana");
        let balanceTexto = balance > 0 ? "+" + balance : balance;
        let colorBalance = "gray";

        if (balance < -300) {
            colorBalance = "green";
        } else if (balance < 0) {
            colorBalance = "orange";
        } else {
            colorBalance = "red";
        }

        info.innerHTML =
            "⬇️ Menor consumo: " + dias[indexMin] + " (" + min + " kcal)<br>" +
            "⬆️ Mayor consumo: " + dias[indexMax] + " (" + max + " kcal)<br>" +
            "📊 Promedio: " + promedio + " kcal<br>" +
            "⚖️ Balance: <span style='color:" + colorBalance + "'>" + balanceTexto + " kcal</span>";

        // calcular colores para cada barra del gráfico, dependiendo de lo cerca que esté del objetivo
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
        // crear gráfico de barras
        miGrafico = new Chart(ctx, {
            type: "bar",
            data: {
                labels: dias,
                datasets: [
                    {
                        type: "bar",
                        label: "Calorías",
                        data: calorias,
                        backgroundColor: backgroundColors
                    },
                    {
                        type: "line",
                        label: "Mantenimiento",
                        data: dias.map(() => mantenimiento), // misma altura siempre
                        borderColor: "blue",
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0, // tension 0 para línea recta, si se quisiera curva, poner 0.4 por ejemplo
                        borderDash: [5, 5] // línea discontinua para diferenciar de las barras
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        display: false, // ocultamos leyenda para simplificar
                        labels: {
                            color: "#aaa",
                            boxWidth: 10
                        }
                    }
                }
            }
        });
    }

    // registros de prueba para no tener que meter comida cada día durante el desarrollo
    /* let registrosTest = [
        { fecha: "2026-03-22", calorias: 3500 },
        { fecha: "2026-03-21", calorias: 2500 },
        { fecha: "2026-03-20", calorias: 1800 },
        { fecha: "2026-03-19", calorias: 3000 },
        { fecha: "2026-03-18", calorias: 2600 },
        { fecha: "2026-03-17", calorias: 1000 },
        { fecha: "2026-03-16", calorias: 1900 },
        { fecha: "2026-03-15", calorias: 2300 },
        { fecha: "2026-03-14", calorias: 3100 },
        { fecha: "2026-03-13", calorias: 2500 },
        { fecha: "2026-03-12", calorias: 1800 },
        { fecha: "2026-03-11", calorias: 3500 },
        { fecha: "2026-03-10", calorias: 2300 },
        { fecha: "2026-03-09", calorias: 3100 },
        { fecha: "2026-03-08", calorias: 2400 },
        { fecha: "2026-03-07", calorias: 1800 },
        { fecha: "2026-03-06", calorias: 2600 }
    ];
    // guardar registros de prueba en el almacenamiento local
    localStorage.setItem("registros", JSON.stringify(registrosTest)); */

    // función para cargar alimentos en el select del formulario, usando la base de datos de alimentos definida más arriba
    function cargarAlimentos() {

        selectAlimento.innerHTML = "";

        alimentos.forEach(a => {
            let option = document.createElement("option");
            option.value = a.id;
            option.textContent = a.nombre;
            selectAlimento.appendChild(option);
        });
    }

    // función para actualizar el placeholder del input de cantidad dependiendo del alimento seleccionado (si tiene gramos por unidad, mostrar "Unidades", si no, mostrar "Gramos")
    function actualizarPlaceholder() {

        const id = selectAlimento.value;
        const alimento = obtenerAlimentoSeleccionado();

        if (!alimento) return; // silencio elegante 😏

        // forma tradicional con if-else
        // if (alimento.gramosPorUnidad) {
        //     inputGramos.placeholder = "Unidades";
        // } else {
        //     inputGramos.placeholder = "Gramos";
        // }

        // hacemos lo mismo pero usando el operador ternario para practicar esa sintaxis, (es como un if/else pero corto)
        inputGramos.placeholder = alimento.gramosPorUnidad ? "Unidades" : "Gramos";
    }

    // llamar a la función para actualizar el placeholder al cambiar el alimento seleccionado
    selectAlimento.addEventListener("change", actualizarPlaceholder);




    // llamar a la función para cargar alimentos en el select al cargar la página
    cargarAlimentos();

    // llamar a la función para
    mostrarFechaHoy();

    // estado inicial
    actualizarPantalla();

    if ("serviceWorker" in navigator) { // registrar el Service Worker para poder usar la app offline y otras funcionalidades avanzadas
         navigator.serviceWorker.register("sw.js")
             .then(() => console.log("SW registrado"))
             .catch(err => console.log("Error SW:", err));
     }

});