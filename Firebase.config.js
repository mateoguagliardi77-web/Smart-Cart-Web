// firebase-config.js
// Configuración e inicialización de Firebase Realtime Database

const firebaseConfig = {
  databaseURL: "https://smart-cart-1bd66-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instancia global de la base de datos
const db = firebase.database();
