//Ce fichier configure Multer pour :
//Accepter uniquement certains types d’images (jpg, jpeg, png, gif)
//Enregistrer les fichiers dans un dossier images/
// //Générer des noms de fichiers uniques
//Limiter la taille du fichier à 5 Mo

const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Ici, tous les fichiers sont stockés dans le dossier images/.
  },

  filename: (req, file, callback) => {
    //Définit le nom du fichier enregistré :

    const name = file.originalname.split(' ').join('_'); //On remplace les espaces dans le nom original par des underscores (_)
    const extension = MIME_TYPES[file.mimetype]; //pour rendre le nom unique
    if (!extension) {
      //Si le type MIME n’est pas supporté, une erreur est retournée.
      return callback(new Error('Type de fichier non supporté'));
    }
    callback(null, name + Date.now() + '.' + extension);
  },
});

//Fonction de filtrage des fichiers :
//Vérifie si le type MIME est dans la liste autorisée
//Si oui → accepte le fichier
//Sinon → rejette avec une erreur (Type de fichier non supporté...)

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error('Type de fichier non supporté. Utilisez jpg, jpeg, png ou gif.'), false);
  }
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
  },
}).single('image');
