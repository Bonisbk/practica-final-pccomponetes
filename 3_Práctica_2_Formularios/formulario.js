
"use strict";

// ==========================================
// 1. NAVEGACIÓN DEL FORMULARIO
// ==========================================

let pasoActual = 1;
const totalPasos = 6;

const btnSiguiente = document.getElementById("btnSiguiente");
const btnAnterior = document.getElementById("btnAnterior");

function mostrarPaso() {
    for (let i = 1; i <= totalPasos; i++) {
        document.getElementById("paso" + i)
            .classList.toggle("d-none", i !== pasoActual);
    }

    const porcentaje = (pasoActual / totalPasos) * 100;

    document.getElementById("textoPaso").textContent =
        "Paso " + pasoActual + " de " + totalPasos;

    document.getElementById("porcentajePaso").textContent =
        Math.round(porcentaje) + "%";

    document.getElementById("barraProgreso").style.width =
        porcentaje + "%";

    document.querySelector(".progress")
        .setAttribute("aria-valuenow", pasoActual);

    btnAnterior.disabled = (pasoActual === 1);

    btnSiguiente.textContent =
        pasoActual === totalPasos
            ? "Confirmar solicitud"
            : "Siguiente →";

    // Actualizar el resumen al llegar al paso 6
    if (pasoActual === 6) {
        actualizarResumenPedido();
    }
}

// ==========================================
// 2. BOTÓN SIGUIENTE Y VALIDACIONES
// ==========================================

btnSiguiente.addEventListener("click", function () {

    // PASO 1: Producto obligatorio
    if (pasoActual === 1) {
        const producto = document.querySelector(
            'input[name="producto"]:checked'
        );

        if (!producto) {
            alert("Debes seleccionar un producto para continuar.");
            return;
        }
    }

    // PASO 3: Datos personales
    if (pasoActual === 3) {
        if (!validarNombreApellidos()) {
            alert("Introduce un nombre y unos apellidos válidos.");
            return;
        }

        if (!validarDNI()) {
            document.getElementById("dni").focus();
            return;
        }

        if (!validarEmail()) {
            const campoError = document.getElementById("email")
                .classList.contains("is-invalid")
                ? "email"
                : "confirmarEmail";

            document.getElementById(campoError).focus();
            return;
        }

        if (!validarTelefono()) {
            document.getElementById("telefono").focus();
            return;
        }

        if (!validarEdad()) {
            document.getElementById("fechaNacimiento").focus();
            return;
        }
    }

    // PASO 4: Dirección y código postal
    if (pasoActual === 4) {
        const direccionValida = validarDireccion();
        const codigoPostalValido = validarCodigoPostal();

        if (!direccionValida || !codigoPostalValido) {
            const primerError = document.querySelector(
                "#paso4 .is-invalid"
            );

            if (primerError) {
                primerError.focus();
            }
            return;
        }
    }

    // PASO 5: Método de pago
    if (pasoActual === 5) {

        // Limpiar errores anteriores
        ["numeroTarjeta", "caducidad", "cvv", "iban"]
            .forEach(function (id) {
                const campo = document.getElementById(id);
                campo.classList.remove("is-invalid");
                campo.setAttribute("aria-invalid", "false");
            });

        if (!pagoTarjeta.checked && !pagoIBAN.checked) {
            alert("Selecciona un método de pago.");
            return;
        }

        if (pagoTarjeta.checked) {
            if (!validarNumeroTarjeta()) {
                mostrarErrorPago(
                    "numeroTarjeta",
                    "Introduce un número de tarjeta válido."
                );
                return;
            }

            if (!validarCaducidad()) {
                mostrarErrorPago(
                    "caducidad",
                    "Introduce una fecha de caducidad válida."
                );
                return;
            }

            if (!validarCVV()) {
                mostrarErrorPago(
                    "cvv",
                    "El CVV debe contener exactamente 3 dígitos."
                );
                return;
            }
        }

        if (pagoIBAN.checked) {
            if (!validarIBAN()) {
                mostrarErrorPago(
                    "iban",
                    "Introduce un IBAN español válido."
                );
                return;
            }
        }
    }

    // Avanzar al siguiente paso
    if (pasoActual < totalPasos) {
        pasoActual++;
        mostrarPaso();

    } else {

        // PASO 6: Validar consentimientos obligatorios
        const condiciones = document.getElementById("aceptarCondiciones");
        const privacidad = document.getElementById("aceptarPrivacidad");

        // Eliminar errores anteriores
        condiciones.classList.remove("is-invalid");
        privacidad.classList.remove("is-invalid");

        condiciones.setAttribute("aria-invalid", "false");
        privacidad.setAttribute("aria-invalid", "false");

        let consentimientosValidos = true;

        if (!condiciones.checked) {
            condiciones.classList.add("is-invalid");
            condiciones.setAttribute("aria-invalid", "true");
            consentimientosValidos = false;
        }

        if (!consentimientosValidos) {
            const error = document.getElementById("errorConsentimientos");

            error.classList.remove("d-none");
            error.setAttribute("role", "alert");
            return;
        }
        // Ocultar el mensaje cuando los consentimientos sean válidos
        document.getElementById("errorConsentimientos")
            .classList.add("d-none");

        if (!consentimientosValidos) {
            alert("Debes aceptar las condiciones de contratación y la política de privacidad.");
            return;
        }


        // Mostrar el modal de confirmación de Bootstrap
        const elementoModal = document.getElementById("modalConfirmacion");
        const modalConfirmacion = bootstrap.Modal.getOrCreateInstance(elementoModal);

        modalConfirmacion.show();

    }

});

// ==========================================
// 3. BOTÓN ANTERIOR
// ==========================================

btnAnterior.addEventListener("click", function () {
    if (pasoActual > 1) {
        pasoActual--;
        mostrarPaso();
    }
});

mostrarPaso();

// ==========================================
// 4. DEPENDENCIA ENTRE COMPLEMENTOS
// ==========================================

const seguro = document.getElementById("seguro");
const soporte = document.getElementById("soporte");
const instalacion = document.getElementById("instalacion");

// El soporte requiere contratar el seguro
soporte.addEventListener("change", function () {
    if (soporte.checked && !seguro.checked) {
        seguro.checked = true;
    }
});

// Al quitar el seguro, se desactiva el soporte
seguro.addEventListener("change", function () {
    if (!seguro.checked) {
        soporte.checked = false;
    }
});

// ==========================================
// 5. CÁLCULO DE PRECIOS
// ==========================================

function calcularPrecios() {
    let totalUnico = 0;
    let totalMensual = 0;

    const producto = document.querySelector(
        'input[name="producto"]:checked'
    );

    if (producto) {
        totalUnico += Number(producto.dataset.precio);
    }

    if (seguro.checked) {
        totalUnico += Number(seguro.dataset.precio);
    }

    if (instalacion.checked) {
        totalUnico += Number(instalacion.dataset.precio);
    }

    if (soporte.checked) {
        totalMensual += Number(soporte.dataset.precio);
    }

    const formatoEuro = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    });

    document.getElementById("totalUnico").textContent =
        formatoEuro.format(totalUnico);

    document.getElementById("totalMensual").textContent =
        formatoEuro.format(totalMensual) + "/mes";
}

// ==========================================
// 7.2 RESUMEN DINÁMICO DEL PEDIDO
// ==========================================

function actualizarResumenPedido() {

    const producto = document.querySelector(
        'input[name="producto"]:checked'
    );

    const formatoEuro = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    });

    let totalUnico = 0;
    let totalMensual = 0;

    // Producto seleccionado
    if (producto) {
        const nombreProducto =
            producto.dataset.nombre ||
            producto.closest("label")?.textContent.trim() ||
            "Producto seleccionado";

        document.getElementById("resumenProducto").textContent =
            nombreProducto;

        totalUnico += Number(producto.dataset.precio);
    }

    // Complementos contratados
    const complementos = [];

    if (seguro.checked) {
        complementos.push("Seguro: 89 €");
        totalUnico += Number(seguro.dataset.precio);
    }

    if (soporte.checked) {
        complementos.push("Soporte premium: 9,99 €/mes");
        totalMensual += Number(soporte.dataset.precio);
    }

    if (instalacion.checked) {
        complementos.push("Instalación: 49 €");
        totalUnico += Number(instalacion.dataset.precio);
    }

    document.getElementById("resumenComplementos").textContent =
        complementos.length > 0
            ? complementos.join(" · ")
            : "Sin complementos adicionales";

    // Totales
    document.getElementById("resumenTotalUnico").textContent =
        formatoEuro.format(totalUnico);

    document.getElementById("resumenTotalMensual").textContent =
        formatoEuro.format(totalMensual) + "/mes";
}


document.querySelectorAll(
    'input[name="producto"], input[name="complementos"]'
).forEach(function (campo) {
    campo.addEventListener("change", calcularPrecios);
});

calcularPrecios();

// ==========================================
// 6. VALIDACIÓN DE NOMBRE Y APELLIDOS
// ==========================================

function validarNombreApellidos() {
    const campoNombre = document.getElementById("nombre");
    const campoApellidos = document.getElementById("apellidos");

    const nombre = campoNombre.value.trim();
    const apellidos = campoApellidos.value.trim();

    const patron = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

    const nombreValido =
        nombre.length >= 2 && patron.test(nombre);

    const apellidosValidos =
        apellidos.length >= 2 && patron.test(apellidos);

    campoNombre.classList.toggle("is-invalid", !nombreValido);
    campoApellidos.classList.toggle("is-invalid", !apellidosValidos);

    campoNombre.setAttribute("aria-invalid", String(!nombreValido));
    campoApellidos.setAttribute("aria-invalid", String(!apellidosValidos));

    return nombreValido && apellidosValidos;
}

// ==========================================
// 7. VALIDACIÓN DEL DNI ESPAÑOL
// ==========================================

function validarDNI() {
    const campoDNI = document.getElementById("dni");
    const dni = campoDNI.value.trim().toUpperCase();

    const patron = /^[0-9]{8}[A-Z]$/;
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";

    let dniValido = false;

    if (patron.test(dni)) {
        const numero = parseInt(dni.substring(0, 8), 10);
        const letraCorrecta = letras[numero % 23];

        dniValido = dni.charAt(8) === letraCorrecta;
    }

    campoDNI.classList.toggle("is-invalid", !dniValido);
    campoDNI.setAttribute("aria-invalid", String(!dniValido));

    return dniValido;
}

// ==========================================
// 8. VALIDACIÓN DEL CORREO ELECTRÓNICO
// ==========================================

function validarEmail() {
    const campoEmail = document.getElementById("email");
    const campoConfirmacion = document.getElementById("confirmarEmail");

    const email = campoEmail.value.trim();
    const confirmarEmail = campoConfirmacion.value.trim();

    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emailValido = patron.test(email);
    const confirmacionValida =
        emailValido && email === confirmarEmail;

    campoEmail.classList.toggle("is-invalid", !emailValido);
    campoConfirmacion.classList.toggle(
        "is-invalid", !confirmacionValida
    );

    campoEmail.setAttribute("aria-invalid", String(!emailValido));
    campoConfirmacion.setAttribute(
        "aria-invalid", String(!confirmacionValida)
    );

    return emailValido && confirmacionValida;
}

// ==========================================
// 9. VALIDACIÓN DEL TELÉFONO ESPAÑOL
// ==========================================

function validarTelefono() {
    const campoTelefono = document.getElementById("telefono");
    const telefono = campoTelefono.value.trim();

    const patron = /^[6789][0-9]{8}$/;
    const telefonoValido = patron.test(telefono);

    campoTelefono.classList.toggle("is-invalid", !telefonoValido);
    campoTelefono.setAttribute("aria-invalid", String(!telefonoValido));

    return telefonoValido;
}

// ==========================================
// 10. VALIDACIÓN DE MAYORÍA DE EDAD
// ==========================================

function validarEdad() {
    const campoFecha = document.getElementById("fechaNacimiento");
    const fechaValor = campoFecha.value;

    let fechaValida = false;

    if (fechaValor) {
        const fechaNacimiento = new Date(fechaValor + "T00:00:00");
        const hoy = new Date();

        if (!isNaN(fechaNacimiento.getTime()) && fechaNacimiento <= hoy) {
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

            const mesActual = hoy.getMonth();
            const mesNacimiento = fechaNacimiento.getMonth();

            if (
                mesActual < mesNacimiento ||
                (mesActual === mesNacimiento &&
                    hoy.getDate() < fechaNacimiento.getDate())
            ) {
                edad--;
            }

            fechaValida = edad >= 18;
        }
    }

    campoFecha.classList.toggle("is-invalid", !fechaValida);
    campoFecha.setAttribute("aria-invalid", String(!fechaValida));

    return fechaValida;
}

// ==========================================
// 11. SELECCIÓN DEL MÉTODO DE PAGO
// ==========================================

const pagoTarjeta = document.getElementById("pagoTarjeta");
const pagoIBAN = document.getElementById("pagoIBAN");

const datosTarjeta = document.getElementById("datosTarjeta");
const datosIBAN = document.getElementById("datosIBAN");

function mostrarMetodoPago() {
    datosTarjeta.classList.toggle("d-none", !pagoTarjeta.checked);
    datosIBAN.classList.toggle("d-none", !pagoIBAN.checked);
}

pagoTarjeta.addEventListener("change", mostrarMetodoPago);
pagoIBAN.addEventListener("change", mostrarMetodoPago);

mostrarMetodoPago();

// ==========================================
// 12. VALIDACIÓN DE TARJETA (LUHN)
// ==========================================

function validarNumeroTarjeta() {
    const campo = document.getElementById("numeroTarjeta");
    const numero = campo.value.replace(/\s/g, "");

    if (!/^\d{16}$/.test(numero)) {
        return false;
    }

    let suma = 0;
    let duplicar = false;

    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = Number(numero[i]);

        if (duplicar) {
            digito *= 2;

            if (digito > 9) {
                digito -= 9;
            }
        }

        suma += digito;
        duplicar = !duplicar;
    }

    return suma % 10 === 0;
}

// ==========================================
// 13. VALIDACIÓN DE CADUCIDAD
// ==========================================

function validarCaducidad() {
    const campo = document.getElementById("caducidad");
    const valor = campo.value.trim();

    const patron = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (!patron.test(valor)) {
        return false;
    }

    const [mes, anio] = valor.split("/").map(Number);

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    const anioCaducidad = 2000 + anio;

    return (
        anioCaducidad > anioActual ||
        (anioCaducidad === anioActual && mes >= mesActual)
    );
}

// ==========================================
// 14. VALIDACIÓN DEL CVV
// ==========================================

function validarCVV() {
    const cvv = document.getElementById("cvv").value.trim();
    const patron = /^\d{3}$/;

    return patron.test(cvv);
}

// ==========================================
// 15. VALIDACIÓN DEL IBAN ESPAÑOL
// ==========================================

function validarIBAN() {
    const campo = document.getElementById("iban");
    const iban = campo.value.replace(/\s/g, "").toUpperCase();

    const patron = /^ES\d{22}$/;

    if (!patron.test(iban)) {
        return false;
    }

    const reorganizado =
        iban.substring(4) + iban.substring(0, 4);

    let numero = "";

    for (const caracter of reorganizado) {
        if (/[A-Z]/.test(caracter)) {
            numero += caracter.charCodeAt(0) - 55;
        } else {
            numero += caracter;
        }
    }

    let resto = 0;

    for (const digito of numero) {
        resto = (resto * 10 + Number(digito)) % 97;
    }

    return resto === 1;
}

// ==========================================
// 16. PROVINCIAS ESPAÑOLAS
// ==========================================

const provincias = {
    "01": "Álava",
    "02": "Albacete",
    "03": "Alicante",
    "04": "Almería",
    "05": "Ávila",
    "06": "Badajoz",
    "07": "Illes Balears",
    "08": "Barcelona",
    "09": "Burgos",
    "10": "Cáceres",
    "11": "Cádiz",
    "12": "Castellón",
    "13": "Ciudad Real",
    "14": "Córdoba",
    "15": "A Coruña",
    "16": "Cuenca",
    "17": "Girona",
    "18": "Granada",
    "19": "Guadalajara",
    "20": "Gipuzkoa",
    "21": "Huelva",
    "22": "Huesca",
    "23": "Jaén",
    "24": "León",
    "25": "Lleida",
    "26": "La Rioja",
    "27": "Lugo",
    "28": "Madrid",
    "29": "Málaga",
    "30": "Murcia",
    "31": "Navarra",
    "32": "Ourense",
    "33": "Asturias",
    "34": "Palencia",
    "35": "Las Palmas",
    "36": "Pontevedra",
    "37": "Salamanca",
    "38": "Santa Cruz de Tenerife",
    "39": "Cantabria",
    "40": "Segovia",
    "41": "Sevilla",
    "42": "Soria",
    "43": "Tarragona",
    "44": "Teruel",
    "45": "Toledo",
    "46": "Valencia",
    "47": "Valladolid",
    "48": "Bizkaia",
    "49": "Zamora",
    "50": "Zaragoza",
    "51": "Ceuta",
    "52": "Melilla"
};

// Rellenar el desplegable de provincias
const selectorProvincia = document.getElementById("provincia");

Object.entries(provincias).forEach(function ([codigo, nombre]) {
    const opcion = document.createElement("option");

    opcion.value = codigo;
    opcion.textContent = nombre;

    selectorProvincia.appendChild(opcion);
});

// ==========================================
// 17. VALIDACIÓN DEL CÓDIGO POSTAL
// ==========================================

function validarCodigoPostal() {
    const campoCP = document.getElementById("codigoPostal");
    const campoProvincia = document.getElementById("provincia");

    const cp = campoCP.value.trim();
    const provincia = campoProvincia.value;

    const formatoValido = /^[0-9]{5}$/.test(cp);

    const provinciaCorrecta =
        formatoValido &&
        Object.hasOwn(provincias, cp.substring(0, 2)) &&
        cp.substring(0, 2) === provincia;

    campoCP.classList.toggle("is-invalid", !provinciaCorrecta);
    campoProvincia.classList.toggle("is-invalid", !provinciaCorrecta);

    campoCP.setAttribute(
        "aria-invalid", String(!provinciaCorrecta)
    );

    campoProvincia.setAttribute(
        "aria-invalid", String(!provinciaCorrecta)
    );

    return provinciaCorrecta;
}

// ==========================================
// 18. VALIDACIÓN DE DIRECCIÓN
// ==========================================

function validarDireccion() {
    const campoDireccion = document.getElementById("direccion");
    const campoCiudad = document.getElementById("ciudad");

    const direccion = campoDireccion.value.trim();
    const ciudad = campoCiudad.value.trim();

    const direccionValida = direccion.length >= 5;

    const patronCiudad =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;

    const ciudadValida =
        ciudad.length >= 2 && patronCiudad.test(ciudad);

    campoDireccion.classList.toggle(
        "is-invalid", !direccionValida
    );

    campoCiudad.classList.toggle(
        "is-invalid", !ciudadValida
    );

    campoDireccion.setAttribute(
        "aria-invalid", String(!direccionValida)
    );

    campoCiudad.setAttribute(
        "aria-invalid", String(!ciudadValida)
    );

    return direccionValida && ciudadValida;
}

// ==========================================
// 19. MENSAJES DE ERROR DEL MÉTODO DE PAGO
// ==========================================

function mostrarErrorPago(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);

    campo.classList.add("is-invalid");
    campo.setAttribute("aria-invalid", "true");

    let error = campo.nextElementSibling;

    if (!error || !error.classList.contains("invalid-feedback")) {
        error = document.createElement("div");
        error.classList.add("invalid-feedback");

        campo.insertAdjacentElement("afterend", error);
    }

    error.textContent = mensaje;
    campo.focus();
}

// ==========================================
// CONFIRMACIÓN DEFINITIVA DE LA SOLICITUD
// ==========================================

document.getElementById("btnConfirmarDefinitivo")
    .addEventListener("click", function () {

        // Cerrar el modal
        const elementoModal = document.getElementById("modalConfirmacion");
        const modal = bootstrap.Modal.getOrCreateInstance(elementoModal);

        modal.hide();

        // Mostrar mensaje de confirmación
        const mensaje = document.createElement("div");

        mensaje.className = "alert alert-success mt-4";
        mensaje.setAttribute("role", "status");

        mensaje.textContent =
            "Solicitud confirmada correctamente. Gracias por tu compra.";

        // Evitar mensajes duplicados
        const mensajeAnterior = document.getElementById("mensajeConfirmacion");

        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        mensaje.id = "mensajeConfirmacion";

        document.getElementById("paso6").appendChild(mensaje);

        // Desactivar el botón de confirmación
        document.getElementById("btnSiguiente").disabled = true;

    });
