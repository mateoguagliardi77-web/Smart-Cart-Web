/* global db */
// app.js - Lógica principal de la aplicación Smart-Cart

let changoIdActual = "CH001";

// =====================================================
// NAVEGACIÓN Y MANEJO DE VISTAS
// =====================================================
function ocultarTodas() {
  const secciones = ['sec-rol', 'sec-op-login', 'sec-vincular', 'sec-usuario', 'sec-operario'];
  secciones.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

function volverAInicio() {
  ocultarTodas();
  const secRol = document.getElementById('sec-rol');
  if (secRol) secRol.classList.remove('hidden');
  const badge = document.getElementById('rol-badge');
  if (badge) badge.innerText = "Seleccionar Rol";
}

function iniciarUsuario() {
  ocultarTodas();
  const secVincular = document.getElementById('sec-vincular');
  if (secVincular) secVincular.classList.remove('hidden');
  const badge = document.getElementById('rol-badge');
  if (badge) badge.innerText = "Usuario";
}

function mostrarLoginOperario() {
  ocultarTodas();
  const secOpLogin = document.getElementById('sec-op-login');
  if (secOpLogin) secOpLogin.classList.remove('hidden');
  const badge = document.getElementById('rol-badge');
  if (badge) badge.innerText = "Operario";
}

// =====================================================
// AUTENTICACIÓN DE OPERARIO Y VINCULACIÓN
// =====================================================
function validarOperario() {
  const inputPin = document.getElementById('input-pin');
  const pin = inputPin ? inputPin.value : '';
  if (pin === "4321") {
    ocultarTodas();
    const secOperario = document.getElementById('sec-operario');
    if (secOperario) secOperario.classList.remove('hidden');
  } else {
    alert("PIN incorrecto. Intenta con 4321");
  }
}

function vincularChanguito() {
  const inputId = document.getElementById('input-chango-id');
  if (!inputId || !inputId.value) {
    alert("Por favor ingresa un ID de changuito válido.");
    return;
  }
  changoIdActual = inputId.value.toUpperCase().trim();

  // Actualizar estado del carrito en Firebase
  db.ref('carritos/' + changoIdActual).update({
    estado: "OCUPADO",
    modo_escaneo: "AGREGAR"
  });

  ocultarTodas();
  const secUsuario = document.getElementById('sec-usuario');
  if (secUsuario) secUsuario.classList.remove('hidden');
  escucharChanguito();
}

// =====================================================
// MODO ESCANEO Y TRANSMISIÓN EN TIEMPO REAL
// =====================================================
function cambiarModo(modo) {
  db.ref('carritos/' + changoIdActual).update({ modo_escaneo: modo });
  const txtModo = document.getElementById('txt-modo-escaneo');
  if (txtModo) {
    txtModo.innerText = modo === 'AGREGAR' ? 'AGREGAR PRODUCTO' : 'QUITAR PRODUCTO';
    txtModo.className = modo === 'AGREGAR' ? 'text-sm font-bold text-green-600' : 'text-sm font-bold text-red-600';
  }
}
function escucharChanguito() {
  db.ref('carritos/' + changoIdActual).on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const contenedor = document.getElementById('contenedor-productos');
    if (contenedor) contenedor.innerHTML = '';

    const productos = data.productos || {};
    const resumen = data.resumen || {};

    // Extraemos las variables usando corchetes para evitar errores de sintaxis
    const totalItems = resumen['total_items'] || 0;
    const subtotalVal = resumen['subtotal'] || 0;
    const descuentoTotalVal = resumen['descuento_total'] || 0;
    const totalPagarVal = resumen['total_a_pagar'] || 0;

    Object.keys(productos).forEach(codigo => {
      const item = productos[codigo];
      const ahorroTexto = item.descuento > 0 ? '<p class="text-xs text-green-600">Ahorro: $' + item.descuento + '</p>' : '';
      
      if (contenedor) {
        contenedor.innerHTML += 
          '<div class="py-2 flex justify-between items-center">' +
            '<div>' +
              '<p class="text-sm font-bold text-gray-800">' + item.nombre + '</p>' +
              '<p class="text-xs text-gray-500">Cant: ' + item.cantidad + ' x $' + item.precio_unitario + '</p>' +
            '</div>' +
            '<div class="text-right">' +
              '<p class="text-sm font-bold text-gray-900">$' + item.subtotal_final + '</p>' +
              ahorroTexto +
            '</div>' +
          '</div>';
      }
    });

    const badgeItems = document.getElementById('badge-items');
    if (badgeItems) badgeItems.innerText = totalItems + ' ítems';

    const txtSubtotal = document.getElementById('txt-subtotal');
    if (txtSubtotal) txtSubtotal.innerText = '$' + subtotalVal;

    const txtDescuento = document.getElementById('txt-descuento');
    if (txtDescuento) txtDescuento.innerText = '-$' + descuentoTotalVal;

    const txtTotal = document.getElementById('txt-total');
    if (txtTotal) txtTotal.innerText = '$' + totalPagarVal;
  });
}


// =====================================================
// PANEL OPERARIO & PROCESO DE PAGO
// =====================================================
function guardarProductoOperario() {
  const codigo = document.getElementById('op-codigo').value;
  const nombre = document.getElementById('op-nombre').value;
  const precio = parseFloat(document.getElementById('op-precio').value);
  const oferta = document.getElementById('op-oferta').value;

  db.ref('productos/' + codigo).update({
    nombre: nombre,
    precio: precio,
    oferta_id: oferta
  }).then(() => {
    alert("Producto actualizado exitosamente en Firebase");
  }).catch(error => {
    alert("Error al actualizar: " + error.message);
  });
}

function procesarPago() {
  alert("Redirigiendo a pasarela de pago...");
  db.ref('carritos/' + changoIdActual).update({
    estado: "LIBRE",
    productos: {},
    resumen: { total_items: 0, subtotal: 0, descuento_total: 0, total_a_pagar: 0 }
  });
  volverAInicio();
}