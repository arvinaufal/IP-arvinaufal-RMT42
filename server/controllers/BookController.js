const { Op } = require('sequelize');
const { Book, User, sequelize } = require('../models');
const { generateBookPromt, chatAI } = require('../helpers/openai');
const { fetchGBooks } = require('../helpers/googlebooks');

class BookController {
    static async getAll(req, res, next) {
        let { filter, page = 1, q, sortBy, limit } = req.query;
        const { userId } = req.params;
        let queryOptions = {
            attributes: ['id', 'title', 'isbn', 'author', 'synopsis', 'pageCount', 'stock', 'publisher', 'publishedDate', 'lang', 'imgUrl', 'status', 'category', 'pricePerWeek'],
            limit: 16,
            offset: 0,
            where: {}
        };

        if (userId) queryOptions.where.userId = userId;


        try {
            const books = await Book.findAndCountAll(queryOptions);
            const datas = {
                books: books.rows,
            }
            res.status(200).json(datas);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const book = await Book.findByPk(req.params.bookId);
            if (!book) throw ({ name: "NotFound" });
            res.status(200).json(book);
        } catch (error) {
            next(error);
        }
    }

    // static async create(req, res, next) {
    //     const { title, isbn, author, synopsis, pageCount, stock, publisher, publishedDate, lang, imgUrl, status, category, pricePerWeek } = req.body;
    //     try {
    //         const book = await Book.create({ title, isbn, author, synopsis, pageCount, stock, publisher, publishedDate, lang, imgUrl, status, category, pricePerWeek });
    //         res.status(201).json(book);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // static async delete(req, res, next) {
    //     const { bookId } = req.params;
    //     try {
    //         let book = await Book.findByPk(bookId);

    //         if (!book) throw ({ name: "NotFound" });

    //         await book.destroy();
    //         res.status(200).json({ message: `Book with id: ${book.id} success to delete` });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    static async findBook(req, res, next) {
        const { desc } = req.body;
        try {
            const promt = generateBookPromt(desc);
            const bookTitle = await chatAI(promt);
            const books = await fetchGBooks(bookTitle, 1);
            let book = books[0];

            const existingBook = await Book.findOne({
                where: {
                    [Op.and]: [
                        { title: book.title },
                        { isbn: book.isbn }
                    ]
                }
            });

            let result = '';
            !existingBook ? result = await Book.create(book) : result = existingBook;
            let code = existingBook ? 200 : 201;
          
            res.status(code).json({ message: 'Successfully find book', data: result });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = BookController;