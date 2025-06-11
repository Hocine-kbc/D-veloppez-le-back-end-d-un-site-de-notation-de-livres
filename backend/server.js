const express = require('express'); // framework Node.js pour créer facilement des serveurs web/API.
const mongoose = require('mongoose'); // bibliothèque pour interagir avec MongoDB de manière simplifiée (modèles, schémas…).
const path = require('path'); //module natif de Node.js pour gérer les chemins de fichiers.
const cors = require('cors'); //permet de gérer les permissions d'accès à ton API depuis d'autres domaines (utile pour le frontend).
require('dotenv').config(); //charge les variables d'environnement depuis un fichier .env (comme MONGODB_URI, PORT, etc.).

const app = express(); //Initialise une instance de l'application Express.

////////////////////////////// Middleware ////////////////////////////////////////////////////
app.use(express.json()); //permet de parser les requêtes JSON (ce que ton frontend envoie).
app.use(cors()); //autorise les requêtes depuis d'autres origines (utile quand ton frontend tourne sur un autre port ou domaine).

///////////////////// Configuration de la base de données ///////////////////////////////////////////
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mon-vieux-grimoire', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

////////////////////////////////////  deffinition des Routes ///////////////////////////////////////
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));

//////////////////////////// Gestion des images ////////////////////////////////////////
app.use('/images', express.static(path.join(__dirname, 'images')));

//////////////////// Demarrage du server ////////////////////////////////////////////
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
