// ---------- Elementos de la página ----------
const input = document.getElementById("inputIngrediente");
const btnAgregar = document.getElementById("btnAgregar");
const listaIngredientes = document.getElementById("listaIngredientes");
const sugerencias = document.getElementById("sugerencias");
const contSolos = document.getElementById("listosSolos");
const contPrincipales = document.getElementById("listosPrincipales");
const contAcomp = document.getElementById("listosAcomp");
const contCombos = document.getElementById("combos");
const btnCombos = document.getElementById("btnCombos");
const contCasi = document.getElementById("casi");
const btnRandom = document.getElementById("btnRandom");
const contIdeas = document.getElementById("ideas");

const NOMBRE_TIPO = {
  principal: "Plato principal",
  acompanamiento: "Acompañamiento",
  solo: "Plato completo"
};

let heladera = [];        // lo que cargó el usuario
let listosActuales = [];  // platos que se pueden cocinar ahora

// ---------- Utilidades ----------
// Minúsculas, sin tildes ni espacios de más: "Morrón " -> "morron", "Ñoquis" -> "noquis"
function normalizar(texto) {
  return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const basicosNorm = new Set(BASICOS.map(normalizar));

function tiene(ingrediente, tengo) {
  const n = normalizar(ingrediente);
  return tengo.has(n) || basicosNorm.has(n);
}

// Mezcla de verdad (Fisher-Yates) y devuelve una copia
function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Convierte cualquiera de las 3 formas de escribir un ingrediente a { de: [...], minimo: n }
function pedido(ing) {
  if (typeof ing === "string") return { de: [ing], minimo: 1 };
  if (Array.isArray(ing)) return { de: ing, minimo: 1 };
  return { de: ing.de, minimo: ing.alMenos };
}

function textoPedido(ing) {
  const r = pedido(ing);
  if (r.de.length === 1) return r.de[0];
  if (r.minimo === 1) return r.de.join(" o ");
  return `al menos ${r.minimo} de: ${r.de.join(", ")}`;
}

function variantesDe(plato) {
  return plato.variantes || [{ ingredientes: plato.ingredientes, opcionales: plato.opcionales }];
}

// ---------- Lógica principal ----------
function evaluarVariante(v, tengo) {
  let faltan = 0;
  let total = 0;
  const faltantes = [];
  const usados = [];

  v.ingredientes.map(pedido).forEach(r => {
    total += r.minimo;
    const presentes = r.de.filter(x => tiene(x, tengo));
    const falta = Math.max(0, r.minimo - presentes.length);
    faltan += falta;

    if (r.de.length > 1) usados.push(...presentes);

    if (falta > 0) {
      if (r.de.length === 1) faltantes.push(r.de[0]);
      else if (r.minimo === 1) faltantes.push(r.de.join(" o "));
      else faltantes.push(`${falta} más entre: ${r.de.filter(x => !tiene(x, tengo)).join(", ")}`);
    }
  });

  const sumables = (v.opcionales || []).filter(x => tiene(x, tengo));
  return { v, faltan, total, faltantes, usados, sumables };
}

function evaluarPlato(plato, tengo) {
  const evaluadas = variantesDe(plato).map(v => evaluarVariante(v, tengo));

  const listas = evaluadas.filter(e => e.faltan === 0);
  if (listas.length) return { estado: "listo", plato, detalle: listas };

  // "faltan < total" evita mostrar platos de los que no tenés nada
  const posibles = evaluadas
    .filter(e => e.faltan <= MAX_FALTANTES && e.faltan < e.total)
    .sort((a, b) => a.faltan - b.faltan);
  if (posibles.length) return { estado: "casi", plato, detalle: [posibles[0]] };

  return null;
}

// ---------- Dibujar tarjetas ----------
function tarjetaListo(r) {
  let extra = "";
  const etiquetas = r.detalle.filter(d => d.v.etiqueta).map(d => d.v.etiqueta);
  if (etiquetas.length) extra += `<p class="detalle">Versión: ${etiquetas.join(" / ")}</p>`;

  const usados = [...new Set(r.detalle.flatMap(d => d.usados))];
  if (usados.length) extra += `<p class="detalle">Con: ${usados.join(", ")}</p>`;

  const sumables = [...new Set(r.detalle.flatMap(d => d.sumables))];
  if (sumables.length) extra += `<p class="detalle">Podés sumarle: ${sumables.join(", ")}</p>`;

  return `<div class="plato"><h3>${r.plato.nombre}</h3>${extra}</div>`;
}

function tarjetaCasi(r) {
  const d = r.detalle[0];
  const version = d.v.etiqueta ? `<p class="detalle">Versión: ${d.v.etiqueta}</p>` : "";
  return `
    <div class="plato">
      <span class="tipo">${NOMBRE_TIPO[r.plato.tipo]}</span>
      <h3>${r.plato.nombre}</h3>
      ${version}
      <p class="faltan">Te falta: ${d.faltantes.join(", ")}</p>
    </div>`;
}

function tarjetaIdea(plato) {
  const cuerpo = variantesDe(plato).map(v => {
    const etiqueta = v.etiqueta ? `<strong>Versión ${v.etiqueta}:</strong> ` : "";
    const ingredientes = v.ingredientes.map(textoPedido).join(", ");
    const opcional = v.opcionales ? ` (opcional: ${v.opcionales.join(" o ")})` : "";
    return `<p class="detalle">${etiqueta}Necesitás: ${ingredientes}${opcional}</p>`;
  }).join("");

  return `
    <div class="plato">
      <span class="tipo">${NOMBRE_TIPO[plato.tipo]}</span>
      <h3>${plato.nombre}</h3>
      ${cuerpo}
    </div>`;
}

function pintar(contenedor, items, funcionTarjeta, mensajeVacio) {
  contenedor.innerHTML = items.length
    ? items.map(funcionTarjeta).join("")
    : `<p class="vacio">${mensajeVacio}</p>`;
}

// ---------- Combinaciones ----------
function dibujarCombinaciones() {
  const principales = listosActuales.filter(r => r.plato.tipo === "principal");
  const acomp = listosActuales.filter(r => r.plato.tipo === "acompanamiento");

  const pares = [];
  principales.forEach(p => acomp.forEach(a => pares.push(`${p.plato.nombre} + ${a.plato.nombre}`)));

  const elegidas = mezclar(pares).slice(0, 6);
  contCombos.innerHTML = elegidas.length
    ? elegidas.map(c => `<div class="plato combo">${c}</div>`).join("")
    : `<p class="vacio">Para armar combinaciones tenés que poder hacer al menos un plato principal y un acompañamiento.</p>`;

  btnCombos.hidden = pares.length <= 6;
}

// ---------- Ideas al azar ----------
function sorprender() {
  const elegidos = mezclar(PLATOS).slice(0, 3);
  contIdeas.innerHTML = elegidos.map(tarjetaIdea).join("");
}

// ---------- Ingredientes del usuario ----------
function cargarSugerencias() {
  const unicos = new Set();
  PLATOS.forEach(p => variantesDe(p).forEach(v => {
    v.ingredientes.forEach(i => pedido(i).de.forEach(x => unicos.add(x)));
    (v.opcionales || []).forEach(x => unicos.add(x));
  }));
  [...unicos].sort((a, b) => a.localeCompare(b, "es")).forEach(i => {
    const opcion = document.createElement("option");
    opcion.value = i;
    sugerencias.appendChild(opcion);
  });
}

function agregarIngrediente() {
  const texto = input.value.trim();
  if (!texto) return;

  const yaEsta = heladera.some(i => normalizar(i) === normalizar(texto));
  if (!yaEsta) heladera.push(texto);

  input.value = "";
  input.focus();
  actualizar();
}

function quitarIngrediente(texto) {
  heladera = heladera.filter(i => i !== texto);
  actualizar();
}

function dibujarIngredientes() {
  listaIngredientes.innerHTML = "";
  heladera.forEach(ing => {
    const li = document.createElement("li");
    li.textContent = ing;
    const x = document.createElement("button");
    x.textContent = "✕";
    x.title = "Quitar";
    x.addEventListener("click", () => quitarIngrediente(ing));
    li.appendChild(x);
    listaIngredientes.appendChild(li);
  });
}

function dibujarResultados() {
  const tengo = new Set(heladera.map(normalizar));
  const evaluados = PLATOS.map(p => evaluarPlato(p, tengo)).filter(Boolean);

  listosActuales = evaluados.filter(r => r.estado === "listo");
  const casi = evaluados
    .filter(r => r.estado === "casi")
    .sort((a, b) => a.detalle[0].faltan - b.detalle[0].faltan);

  const delTipo = tipo => listosActuales.filter(r => r.plato.tipo === tipo);
  pintar(contSolos, delTipo("solo"), tarjetaListo, "Todavía no hay platos completos para hacer.");
  pintar(contPrincipales, delTipo("principal"), tarjetaListo, "Ningún plato principal por ahora.");
  pintar(contAcomp, delTipo("acompanamiento"), tarjetaListo, "Ningún acompañamiento por ahora.");

  dibujarCombinaciones();
  pintar(contCasi, casi, tarjetaCasi, "No hay platos a los que les falten pocos ingredientes.");
}

function actualizar() {
  dibujarIngredientes();
  dibujarResultados();
}

// ---------- Eventos ----------
btnAgregar.addEventListener("click", agregarIngrediente);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") agregarIngrediente();
});
btnCombos.addEventListener("click", dibujarCombinaciones);
btnRandom.addEventListener("click", sorprender);

cargarSugerencias();
actualizar();