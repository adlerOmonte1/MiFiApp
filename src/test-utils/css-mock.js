// Stub para los imports de CSS en las pruebas.
//
// Metro (web) sabe cargar `@/global.css` y los `*.module.css`, pero Jest no:
// intenta evaluarlos como JavaScript y revienta con "Unexpected token ':'".
// Como el CSS solo afecta a la plataforma web y las pruebas corren sobre el
// renderer de RN, alcanza con neutralizarlos.
//
// Es un Proxy y no un objeto vacío para que también sirva a los CSS modules:
// `styles.loQueSea` devuelve el nombre de la clase en vez de undefined, así
// una prueba puede afirmar sobre className sin romperse.
module.exports = new Proxy(
  {},
  {
    get: (_destino, propiedad) => (propiedad === "__esModule" ? false : String(propiedad)),
  },
);
