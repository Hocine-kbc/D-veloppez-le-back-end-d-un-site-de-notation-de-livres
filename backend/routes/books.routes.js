const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const multer = require('../middlewares/multer-config');
const booksController = require('../controllers/books.controller');

router.get('/', booksController.getAllBooks);
router.get('/bestrating', booksController.getBestRating);
router.get('/:id', booksController.getOneBook);
router.post('/', auth, multer, booksController.createBook);
router.put('/:id', auth, multer, booksController.modifyBook);
router.delete('/:id', auth, booksController.deleteBook);
router.post('/:id/rating', auth, booksController.rateBook);

module.exports = router;
