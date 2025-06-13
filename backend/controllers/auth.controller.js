const bcrypt = require('bcrypt'); //bcrypt pour hacher le mot de passe
const jwt = require('jsonwebtoken'); //jsonwebtoken (JWT) pour générer un token sécurisé
const User = require('../models/user.model'); //pour interagir avec la base de données MongoDB

/////////////////////////////// Fonction signup /////////////////////////////////////////////
exports.signup = (req, res, next) => {
  bcrypt //hachage du mot de passe
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        //creation de l'utilisateur
        email: req.body.email,
        password: hash,
      });
      user
        .save() //Le nouvel utilisateur est sauvegardé dans la base de données.
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch((error) => {
          if (error.code === 11000) {
            return res.status(400).json({ message: 'Erreur lors de la création du compte' });
          }
          res.status(400).json({ message: 'Cette adresse email est déjà utilisée !' });
        });
    })
    .catch((error) => res.status(500).json({ error }));
};

///////////////////////////////// Fonction de login/////////////////////////////////////////////
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) //On cherche si un utilisateur avec cet email existe.
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt //Compare le mot de passe saisi avec le hash stocké en base.
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            //On envoie un token JWT signé, qui contient l’userId et expire dans 24h.
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
