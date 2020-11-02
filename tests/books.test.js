/* eslint-disable no-console */
const { expect } = require('chai');
const request = require('supertest');
const { Book } = require('../src/models');
const app = require('../src/app');

describe('/books', () => {
  before(async () => Book.sequelize.sync());

  describe('with no records in the database', () => {
    describe('POST /books', () => {
      it('creates a new book in the database', async () => {
        const response = await request(app).post('/books').send({
          title: 'The Goldfinch',
          author: 'Donna Tartt',
          genre: 'Fiction',
          ISBN: '1234'

        });
        const newBookRecord = await Book.findByPk(response.body.id, {
          raw: true,
        });

        expect(response.status).to.equal(201);
        expect(response.body.title).to.equal('The Goldfinch');
        expect(newBookRecord.title).to.equal('The Goldfinch');
        expect(newBookRecord.author).to.equal('Donna Tartt');
        expect(newBookRecord.genre).to.equal('Fiction');
        expect(newBookRecord.ISBN).to.equal('1234');
      });

      it('doesnt allow a IBSN less than 4 characters', async () => {
        const response = await (await request(app).post('/books').send({
          title: 'Normal People',
          author: 'Sally Rooney',
          genre: 'Fiction',
          ISBN: '123'
        }));
        const newBookRecord = await Book.findByPk(response.body.id, {
          raw: true,

        });

        expect(response.status).to.equal(400);
        expect(response.body).to.equal('Validation error: ISBN must be 4 characters or longer');
      });

    });
  });

  describe('with records in the database', () => {
    let books;

    beforeEach(async () => {
      await Book.destroy({ where: {} });

      books = await Promise.all([
        Book.create({
          title: 'The Goldfinch',
          author: 'Donna Tartt',
          genre: 'Fiction',
          ISBN: '1234'
        }),
        Book.create({ title: 'The Handmaids Tail', author: 'Margaret Atwood', genre: 'Fiction', ISBN: '2345' }),
        Book.create({ title: 'The Crucible', author: 'Arthur Miller', genre: 'Fiction', ISBN: '3456' }),
      ]);
    });

    describe('GET /books', () => {
      it('gets all books records', async () => {
        const response = await request(app).get('/books');

        expect(response.status).to.equal(200);
        expect(response.body.length).to.equal(3);

        response.body.forEach((book) => {
          const expected = books.find((a) => a.id === book.id);

          expect(book.title).to.equal(expected.title);
          expect(book.author).to.equal(expected.author);
        });
      });
    });

    describe('GET /books/:id', () => {
      it('gets book record by id', async () => {
        const book = books[0];
        const response = await request(app).get(`/books/${book.id}`);

        expect(response.status).to.equal(200);
        expect(response.body.title).to.equal(book.title);
        expect(response.body.author).to.equal(book.author);
      });

      it('returns a 404 if the book does not exist', async () => {
        const response = await request(app).get('/books/12345');

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal('The book could not be found.');
      });
    });

    describe('PATCH /books/:id', () => {
      it('updates books author by id', async () => {
        const book = books[0];
        const response = await request(app)
          .patch(`/books/${book.id}`)
          .send({ author: 'Arthur Miller' });
        const updatedBookRecord = await Book.findByPk(book.id, {
          raw: true,
        });

        expect(response.status).to.equal(200);
        expect(updatedBookRecord.author).to.equal('Arthur Miller');
      });

      it('returns a 404 if the book does not exist', async () => {
        const response = await request(app)
          .patch('/books/12345')
          .send({ author: 'Donna Tartt' });

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal('The book could not be found.');
      });
    });

    describe('DELETE /books/:id', () => {
      it('deletes book record by id', async () => {
        const book = books[0];
        const response = await request(app).delete(`/books/${book.id}`);
        const deletedBook = await Book.findByPk(book.id, { raw: true });

        expect(response.status).to.equal(204);
        expect(deletedBook).to.equal(null);
      });

      it('returns a 404 if the book does not exist', async () => {
        const response = await request(app).delete('/books/12345');
        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal('The book could not be found.');
      });
    });
  });
});
