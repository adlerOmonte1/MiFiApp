// Variables de entorno para las pruebas.
//
// Va en `setupFiles` (no en `setupFilesAfterEnv`) porque tiene que correr
// ANTES de que se cargue cualquier módulo del test: src/api/client.ts lee
// EXPO_PUBLIC_API_URL en el cuerpo del módulo y lanza si falta.
process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000/api";
