'use strict';

var tareasTotales = 0;
var tareasResueltas = 0;

/* ------------------------------------------------------------- 
 * AL CARGAR COMPLETAMENTE EL SITIO
------------------------------------------------------------- */
window.onload = function() {
  obtieneTareas();
}

/* ------------------------------------------------------------- 
 * FUNCIONES DE MANEJO DE TAREAS
------------------------------------------------------------- */

//Obtiene todas las tareas desde localStorage
var obtieneTareas = function(){
  if (typeof(Storage) != 'undefined') {
    if (localStorage.length > 0) {
      //CONSULTA: ESTOY DUDANDO SI PONER PROMESAS ACÁ. EN ESTRICTO RIGOR DEBIESE, PERO QUIZAS ES MUY AVANZADO...
      for (let i in localStorage) {
        if (typeof(localStorage[i]) != 'function') {
          let jsonElemento = JSON.parse(localStorage[i]);
          let tarea = new Tarea(jsonElemento.texto, jsonElemento.estado);
          generaTareaDOM(i, tarea);
          if (parseInt(jsonElemento.estado) == 1) {
            tareasResueltas++;
          }
          tareasTotales++;
        }
      }
      document.getElementById('n_resueltas').innerText = tareasResueltas;
      document.getElementById('n_totales').innerText = tareasTotales;
    } else {
      console.info("No existen tareas en la base de datos");
      document.getElementById('sin_tareas').style.display = 'block';
    }
    document.getElementById('loader_container').style.display = 'none';
  } else {
    alert("Su navegador no soporta localStorage!");
  }
}

//Agrega una nueva tarea
var nuevaTarea = function(){
  
  let tarea = document.getElementById('texto_tarea');
  if (tarea.value != '') {
    document.getElementById('sin_tareas').style.display = 'none';
    let nuevaTarea = new Tarea(tarea.value);
    let uuid = generaUUID();
    generaTareaDOM(uuid, nuevaTarea);
    localStorage.setItem(uuid, JSON.stringify(nuevaTarea));
    tareasTotales++;
    document.getElementById('n_totales').innerText = tareasTotales;  
    tarea.value = '';
    tarea.focus();
  } else {
    alert('Debe ingresar contenido a la tarea');
  }
  
}

//Al presionar ENTER ingresa una nueva tarea
document.addEventListener('keyup', function(e){
  if (e.which === 13) {
    nuevaTarea();
  }
});

//Marca una pregunta como resuelta
var marcarResuelta = function(element) {
  console.log("Marcar resuelta");
  let dataId = element.getAttribute('data-id');
  let jsonTarea = JSON.parse(localStorage[dataId]);
  if (element.checked) {
    jsonTarea.estado = 1;
    tareasResueltas++;
    element.parentElement.className = 'checked';
  } else {
    jsonTarea.estado = 0;
    tareasResueltas--;
    element.parentElement.className = '';
  }
  document.getElementById('n_resueltas').innerText = tareasResueltas;
  localStorage.setItem(dataId, JSON.stringify(jsonTarea));
}

//Elimina una tarea desde localStorage
var eliminarTarea = function(element) {
  if (confirm('Estas seguro que deseas eliminar esta tarea?')) {
    let tareaId = element.parentNode.getAttribute('id');
    document.getElementById(tareaId).remove();
    let jsonTarea = JSON.parse(localStorage[tareaId]);
    if (jsonTarea.estado == 1) {
      tareasResueltas--;
      document.getElementById('n_resueltas').innerText = tareasResueltas;  
    } 
    localStorage.removeItem(tareaId);
    tareasTotales--;
    document.getElementById('n_totales').innerText = tareasTotales;
    if (tareasTotales == 0) {
      document.getElementById('sin_tareas').style.display = 'block';
    }
  }
}

//Abre el modal de edición de tarea
var editarTarea = function(element) {
  let tareaId = element.parentNode.getAttribute('id');
  document.getElementById('id_tarea_editada').value = tareaId;

  document.getElementById('edicion_tarea_text').value = JSON.parse(localStorage[tareaId]).texto;
  document.getElementById('modal_edicion').style.display = 'block';
}

//Edita el contenido de una tarea en localStorage
var editar = function() {
  let tareaEditada = document.getElementById('edicion_tarea_text');
  let tareaId = document.getElementById('id_tarea_editada');

  let jsonTarea = JSON.parse(localStorage[tareaId.value]);
  jsonTarea.texto = tareaEditada.value;
  localStorage.setItem(tareaId.value, JSON.stringify(jsonTarea));

  let span = document.querySelectorAll('li#'+ tareaId.value +' label span');
  span[0].innerText = tareaEditada.value;

  tareaId.value = '';
  tareaEditada.value = '';
  document.getElementById('modal_edicion').style.display = 'none';
}

//Cierra el modal
var cerrarModal = function() {
  let tareaEditada = document.getElementById('edicion_tarea_text');
  let tareaId = document.getElementById('id_tarea_editada');
  tareaId.value = '';
  tareaEditada.value = '';
  document.getElementById('modal_edicion').style.display = 'none';
}

//Prototipo de tarea
function Tarea(texto, estado = 0) {
  this.texto = texto;
  this.estado = estado;
}

/* ------------------------------------------------------------- 
 * FUNCIONES AUXILIARES
------------------------------------------------------------- */

//Generador UUID
var generaUUID = function() {
  var caracteres = ['a', 'b', 'c', 'd', 'e', '0', '1', '2', '3', '4'];
  var uuid = 'task';
  for (let i = 0; i <= 10; i++) {
    uuid += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return uuid;
}

//Generador de string de tarea
var generaTareaDOM = function(id, tarea) {
  let listaTareas = document.getElementById('lista_tareas');
  let nuevoNodoLi = document.createElement('li');
  nuevoNodoLi.setAttribute('id', id);
  let nuevoLabel = document.createElement('label');
  let nuevoSpan = document.createElement('span');
  nuevoSpan.innerText = tarea.texto;

  //Iconos
  let iconClose = document.createElement('i');
  iconClose.className = 'fa fa-trash';
  let iconEdit = document.createElement('i');
  iconEdit.className = 'fa fa-edit';

  //Botones de control
  let buttonDelete = document.createElement('div');
  let buttonEdit = document.createElement('div');
  buttonDelete.appendChild(iconClose);
  buttonEdit.appendChild(iconEdit);
  buttonDelete.setAttribute("onclick",'eliminarTarea(this)');
  buttonEdit.setAttribute("onclick",'editarTarea(this)');
  
  //Checkbox
  let nuevoCheckbox = document.createElement('input');
  nuevoCheckbox.type = 'checkbox';
  nuevoCheckbox.setAttribute("onchange",'marcarResuelta(this)');
  nuevoCheckbox.setAttribute('data-id', id);

  if (parseInt(tarea.estado) == 1) {
    nuevoLabel.className = 'checked';
    nuevoCheckbox.checked = 'true';
  }
  
  //Construye el nodo final
  nuevoLabel.appendChild(nuevoCheckbox);
  nuevoLabel.appendChild(nuevoSpan);
  nuevoNodoLi.appendChild(nuevoLabel);
  nuevoNodoLi.appendChild(buttonDelete);
  nuevoNodoLi.appendChild(buttonEdit);
  listaTareas.appendChild(nuevoNodoLi);
}