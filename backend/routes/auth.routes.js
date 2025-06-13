const express = require('express');
const router = express.Router(); //crée un mini routeur Express dédié aux routes d’authentification.
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup); //Méthode : POST //// URL : /api/auth/login
router.post('/login', authController.login);

module.exports = router;
