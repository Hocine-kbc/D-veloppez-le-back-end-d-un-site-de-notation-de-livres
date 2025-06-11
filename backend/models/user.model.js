const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //permet de valider que certains champs sont uniques

//Ce schéma définit les champs que chaque document User doit contenir
const userSchema = mongoose.Schema({
  email: {
    type: String, // doit être une chaîne
    required: true, // champ obligatoire
    unique: true, // doit être unique (grâce au plugin)
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
