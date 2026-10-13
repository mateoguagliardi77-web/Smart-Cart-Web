// firebase-config.js
// Configuración e inicialización de Firebase Realtime Database

const firebaseConfig = {
  databaseURL: "[suspicious link removed]"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instancia global de la base de datos
const db = firebase.database();