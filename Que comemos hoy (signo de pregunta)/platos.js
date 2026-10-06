// Cuántos ingredientes pueden faltar como máximo para mostrar un plato en "Te faltan pocos"
const MAX_FALTANTES = 2;

// Ingredientes que se dan por sentados (no hace falta cargarlos)
const BASICOS = ["sal", "agua"];

// Cada ingrediente puede escribirse de 3 maneras:
//   "papa"                        -> ese ingrediente
//   ["bondiola", "chuleta"]       -> alguno de esos (con uno alcanza)
//   { alMenos: 2, de: [ ... ] }   -> al menos N ingredientes de esa lista
//
// Un plato puede tener "ingredientes" (una sola receta) o "variantes" (varias
// opciones de receta). "opcionales" son ingredientes que se pueden sumar pero no son necesarios.
// tipo: "principal" | "acompanamiento" | "solo"

const PLATOS = [
  // ---------- PLATOS PRINCIPALES ----------
  { nombre: "Carne al horno (bondiola o chuleta)", tipo: "principal", ingredientes: [["bondiola", "chuleta"]] },
  { nombre: "Salchichas", tipo: "principal", ingredientes: ["salchichas"] },
  { nombre: "Milanesas", tipo: "principal", ingredientes: ["milanesas"] },
  { nombre: "Pollo al horno", tipo: "principal", ingredientes: ["pollo"] },
  { nombre: "Hamburguesas", tipo: "principal", ingredientes: ["hamburguesas"] },
  { nombre: "Churrasco", tipo: "principal", ingredientes: ["churrasco"] },
  { nombre: "Churrasco de pollo", tipo: "principal", ingredientes: ["churrasco de pollo"] },
  { nombre: "Costillitas de cerdo", tipo: "principal", ingredientes: ["costillitas de cerdo"] },
  { nombre: "Merluza rebozada", tipo: "principal", ingredientes: ["merluza", "pan rallado", "ajo", "perejil", "huevo"] },

  // ---------- ACOMPAÑAMIENTOS ----------
  { nombre: "Papas al horno", tipo: "acompanamiento", ingredientes: ["papa"] },
  { nombre: "Puré de papas", tipo: "acompanamiento", ingredientes: ["papa"] },
  { nombre: "Papas fritas", tipo: "acompanamiento", ingredientes: ["papa"] },
  { nombre: "Ensalada", tipo: "acompanamiento",
    ingredientes: [{ alMenos: 2, de: ["lechuga", "tomate", "huevo", "papa", "zanahoria", "arroz"] }] },
  { nombre: "Arroz blanco", tipo: "acompanamiento", ingredientes: ["arroz", "ajo"] },
  { nombre: "Arroz con huevo", tipo: "acompanamiento", ingredientes: ["arroz", "ajo", "huevo"] },
  { nombre: "Arroz amarillo", tipo: "acompanamiento", ingredientes: ["arroz", "cebolla", "morrón", "zanahoria", "condimento de arroz"] },
  { nombre: "Tortilla de papa", tipo: "acompanamiento", ingredientes: ["papa", "huevo"] },
  { nombre: "Revuelto de zapallito", tipo: "acompanamiento", ingredientes: ["cebolla", "morrón", "zapallitos", "huevo"] },
  { nombre: "Fideos con manteca", tipo: "acompanamiento", ingredientes: ["fideos", "manteca"] },
  { nombre: "Puré de zapallo", tipo: "acompanamiento", ingredientes: ["zapallo"] },

  // ---------- PLATOS QUE SE COMEN SOLOS ----------
  { nombre: "Ravioles", tipo: "solo", ingredientes: ["ravioles", "cebolla", "morrón", "tomate triturado", "vino"] },
  { nombre: "Ñoquis", tipo: "solo", ingredientes: ["ñoquis", "cebolla", "morrón", "tomate triturado", "vino"] },
  { nombre: "Pastel de papa", tipo: "solo", ingredientes: ["papa", "cebolla", "morrón", "carne picada", "huevo", "mozzarella"] },
  { nombre: "Pizza", tipo: "solo", ingredientes: ["harina para pizza", "tomate triturado", "cebolla", "mozzarella"] },
  { nombre: "Tarta", tipo: "solo", variantes: [
    { etiqueta: "jamón y mozzarella", ingredientes: ["masa de tarta", "jamón", "mozzarella"] },
    { etiqueta: "choclo", ingredientes: ["masa de tarta", "choclo", "huevo", "queso crema", "cebolla"] },
    { etiqueta: "atún", ingredientes: ["masa de tarta", "atún", "cebolla", "espinaca", "morrón"] }
  ] },
  { nombre: "Empanadas", tipo: "solo", variantes: [
    { etiqueta: "de carne", ingredientes: ["tapas de empanada", "carne picada", "cebolla", "morrón", "huevo"] },
    { etiqueta: "de jamón y queso", ingredientes: ["tapas de empanada", "jamón", "mozzarella"] }
  ] },
  { nombre: "Lasaña", tipo: "solo", ingredientes: ["masa de lasaña", "tomate triturado", "cebolla", "morrón", "carne picada", "jamón", "mozzarella"] },
  { nombre: "Polenta", tipo: "solo", ingredientes: ["polenta", "cebolla", "mozzarella", "tomate triturado", "morrón"], opcionales: ["pollo", "carne picada"] },
  { nombre: "Tacos", tipo: "solo", ingredientes: ["tapas de empanada", "cebolla", "morrón", "zanahoria", "lechuga", "tomate", "choclo", ["churrasquitos de carne", "pechuga de pollo"]] },
  { nombre: "Chao fan", tipo: "solo", ingredientes: ["brotes de soja", "zanahoria", "cebolla", "huevo", "arroz", "salsa de soja", "pechuga de pollo", "morrón"] },
  { nombre: "Guiso de arroz", tipo: "solo", ingredientes: ["cebolla", "morrón", "carne", "tomate triturado", "cubito de caldo", "zanahoria", "arroz"] },
  { nombre: "Guiso de fideos", tipo: "solo", ingredientes: ["cebolla", "morrón", "carne", "tomate triturado", "cubito de caldo", "zanahoria", "fideos"] },
  { nombre: "Choripán", tipo: "solo", ingredientes: ["chorizos", "tomate", "lechuga", "pan"] },
  { nombre: "Panchos", tipo: "solo", ingredientes: ["salchichas", "pan para panchos"] },
  { nombre: "Sopa", tipo: "solo", ingredientes: ["sobrecito de sopa", "fideos para sopa"] },
  { nombre: "Sanguche de milanesa", tipo: "solo", ingredientes: ["milanesas", "tomate", "lechuga", "pan"] }
];