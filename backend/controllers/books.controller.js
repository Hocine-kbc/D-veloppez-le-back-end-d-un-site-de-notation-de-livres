const Book = require('../models/book.model');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

exports.createBook = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image n'a été fournie" });
    }

    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Conversion en WebP
    const webpFilename = `${path.parse(req.file.filename).name}.webp`;
    const webpPath = path.join('images', webpFilename);

    sharp(req.file.path)
      .resize(400, 600)
      .webp({ quality: 80 })
      .toFile(webpPath)
      .then(() => {
        fs.unlinkSync(req.file.path);

        const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get('host')}/images/${webpFilename}`,
        });

        book
          .save()
          .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
          .catch((error) => {
            console.error("Erreur lors de l'enregistrement du livre:", error);
            res.status(400).json({ error: error.message });
          });
      })
      .catch((error) => {
        console.error("Erreur lors de la conversion de l'image:", error);
        res.status(500).json({ error: "Erreur lors du traitement de l'image" });
      });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Non autorisé' });
      } else {
        if (req.file) {
          // Conversion en WebP
          const webpFilename = `${path.parse(req.file.filename).name}.webp`;
          const webpPath = path.join('images', webpFilename);

          sharp(req.file.path)
            .resize(400, 600)
            .webp({ quality: 80 })
            .toFile(webpPath)
            .then(() => {
              // Suppression du fichier original
              fs.unlinkSync(req.file.path);

              // Suppression de l'ancienne image
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {});

              // Mise à jour de l'URL de l'image
              bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${webpFilename}`;

              Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                .catch((error) => res.status(400).json({ error }));
            })
            .catch((error) => {
              console.error("Erreur lors de la conversion de l'image:", error);
              res.status(500).json({ error: "Erreur lors du traitement de l'image" });
            });
        } else {
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié !' }))
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Non autorisé' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.ratings.find((r) => r.userId === req.auth.userId)) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      book.ratings.push({
        userId: req.auth.userId,
        grade: req.body.rating,
      });

      const totalRatings = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;

      book
        .save()
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
