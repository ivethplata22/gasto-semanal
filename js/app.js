// Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos');

// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
}

// Clases

class Presupuesto {

    constructor(presupuesto) {
        this.presupuesto = Number( presupuesto );
        this.restante = Number( presupuesto );
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        // Terminar con la referencia al objeto
        this.gastos.push({...gasto});
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0 );
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id );
        this.calcularRestante();
    }

}

class UI {

    insertarPresupuesto(cantidad) {
        const { presupuesto, restante } = cantidad;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {

        // Limpiar Mensajes
        limpiarMensajes();

        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert', 'mensaje-error-success');
        divMensaje.textContent = mensaje;

        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Insertar en HTML
        const contenidoPrimario = document.querySelector('.contenido.primario');
        contenidoPrimario.insertBefore(divMensaje, document.querySelector('#agregar-gasto'));

        setTimeout(() => {
            divMensaje.remove();
        }, 2000);

    }

    agregarGastoListado(gastos) {

        this.limpiarHTML();

        // Iterar sobre los gastos
        gastos.forEach(gasto => {

            const { id, nombre, cantidad } = gasto;

            // Crear LI
            const nuevoGasto = document.createElement('LI');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between aling-items-center';
            nuevoGasto.dataset.id = id; // Nuevas versiones javascript se recomienda esta forma

            // HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class=""> $${cantidad} </span>`;

            // Boton para borrar el gasto
            const btnBorrar = document.createElement('BUTTON');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            // Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
        });

    }

    limpiarHTML() {

        while(gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }

    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto() {
        const { presupuesto: cantTotal, restante } = presupuesto;
        const restanteDiv = document.querySelector('.restante');
        
        if( (cantTotal / 4) >= restante ) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        }else if( (cantTotal / 2) >= restante ) {
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        }else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        if(restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');

            formulario.querySelector('button[type="submit"]').disabled = true;
        }

        if(restante > 0) {
            formulario.querySelector('button[type="submit"]').disabled = false;
        }
    }

}

// Instanciar
let presupuesto;
const ui = new UI();

// Funciones
function preguntarPresupuesto(e) {

    const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

    // Validaciones
    if(presupuestoUsuario === null) window.location.reload();
    if(presupuestoUsuario.trim() === '') window.location.reload();
    if( isNaN(presupuestoUsuario) ) window.location.reload();
    if(Number(presupuestoUsuario) <= 0) window.location.reload();

    // Presupuesto valido
    presupuesto = new Presupuesto(presupuestoUsuario);
    
    ui.insertarPresupuesto(presupuesto);
    
}

function agregarGasto(e) {

    e.preventDefault();

    // Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value.trim();
    const cantidad = document.querySelector('#cantidad').value.trim();

    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    }

    if(isNaN(cantidad) || Number(cantidad) <= 0) {
        ui.imprimirAlerta('Cantidad no valida', 'error');
        return;
    }
    
    // Generar un objeto con el gasto
    const gasto = { id: Date.now(), nombre, cantidad: Number(cantidad) };

    // Agregar Gasto
    presupuesto.nuevoGasto(gasto);

    // Mensaje exitoso
    ui.imprimirAlerta('Gasto agregado correctamente', 'exito');

    // Imprimir los gastos
    const { gastos, restante } = presupuesto;
    ui.agregarGastoListado(gastos);

    // Actualziar Restante
    ui.actualizarRestante(restante);
    
    // Comprobar Presupuesto
    ui.comprobarPresupuesto();

    // Reinicia Formulario
    formulario.reset();
}

function limpiarMensajes() {

    const divMensajes = document.querySelectorAll('.mensaje-error-success');
    
    for( const mensaje of divMensajes ) {
        mensaje.remove();
    }

}

function eliminarGasto(id) {
    presupuesto.eliminarGasto(id);

    const { gastos } = presupuesto;
    ui.agregarGastoListado(gastos);

    const { restante } = presupuesto;

    // Actualziar Restante
    ui.actualizarRestante(restante);

    // Comprobar Presupuesto
    ui.comprobarPresupuesto();
}