// Selección visual de productos
const productos = document.querySelectorAll('input[name="producto"]');

productos.forEach(function (producto) {

    producto.addEventListener("change", function () {

        // Quitamos la selección visual anterior
        document.querySelectorAll(".card.producto-seleccionado")
            .forEach(function (tarjeta) {
                tarjeta.classList.remove("producto-seleccionado");
            });

        // Destacamos la tarjeta seleccionada
        producto.closest(".card").classList.add("producto-seleccionado");

    });

});