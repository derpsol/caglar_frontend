import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { DiplomaTypes } from '../src/models';
import { getDetailsForIsbn } from '../src/api';
import diplomaData from '../src/data/json/diploma.json';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'json');
const BOOKS_FILE_PATH = path.join(DATA_DIR, 'books.json');

const STATIC_DATA: DiplomaTypes.BookMetadata[] = [
  {
    isbn: ['0769551661', '9780769551661'],
    title:
      'Guide to the Software Engineering Body of Knowledge (SWEBOK®): Version 3.0',
    thumbnail:
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1422647423l/20665102.jpg',
    link:
      'https://www.goodreads.com/book/show/20665102-guide-to-the-software-engineering-body-of-knowledge-swebok-r',
  },
];

const collectBooks = (curriculum: DiplomaTypes.Curriculum) => {
  const books: DiplomaTypes.CourseBook[] = [];
  const { terms, extras } = curriculum;

  // Main books
  for (const term of terms) {
    const { courses } = term;
    for (const course of courses) {
      books.push(...course.books);
    }
  }

  // Extras
  for (const extra of extras) {
    books.push(...extra.books);
  }

  return books;
};

const process = async (
  curriculum: DiplomaTypes.Curriculum,
  filePath: string,
) => {
  const books = collectBooks(curriculum);
  const booksData: DiplomaTypes.BookMetadata[] = [];

  const promises = books.map(async (book) => {
    const { isbn } = book;
    const [isbn10, isbn13] = isbn;

    const staticData = STATIC_DATA.find(
      (s) => s.isbn.includes(isbn10) || s.isbn.includes(isbn13),
    );

    if (staticData) {
      return {
        isbn,
        staticData,
      };
    }

    const data = await getDetailsForIsbn(isbn13);
    return {
      isbn,
      data,
    };
  });

  try {
    const results = await Promise.all(promises);
    for (const result of results) {
      const { isbn, data, staticData } = result;

      if (staticData) {
        booksData.push({
          ...staticData,
          isbn,
        });
      } else if (data) {
        const {
          volumeInfo: {
            title,
            subtitle,
            imageLinks: { thumbnail },
            canonicalVolumeLink,
          },
        } = data.items[0];

        // Attach to the object
        booksData.push({
          isbn,
          title,
          subtitle,
          thumbnail,
          link: canonicalVolumeLink,
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    // Sort books and write to file
    booksData.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
    fs.writeFile(filePath, JSON.stringify(booksData, null, 2));
  }
};

process(diplomaData as DiplomaTypes.Curriculum, BOOKS_FILE_PATH);
