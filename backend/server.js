const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new Database('snippets.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM snippets').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO snippets (title, language, code) VALUES (?, ?, ?)');
  const initialSnippets = [
    {
      title: "Асинхронная загрузка данных (Fetch API)",
      language: "JavaScript",
      code: "async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Ошибка:', error);\n  }\n}"
    },
    {
      title: "Быстрая сортировка списков (Python List Comp)",
      language: "Python",
      code: "numbers = [5, 2, 9, 1, 5, 6]\nsorted_unique = sorted(list(set(numbers)))\nprint(f'Отсортированный список: {sorted_unique}')"
    },
    {
      title: "Центрирование блока в CSS (Flexbox)",
      language: "CSS",
      code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}"
    }
  ];
  initialSnippets.forEach(s => insert.run(s.title, s.language, s.code));
}

app.get('/api/snippets', (req, res) => {
  try {
    const { language } = req.query;
    let query = 'SELECT * FROM snippets ORDER BY created_at DESC';
    let params = [];

    if (language && language !== 'Все') {
      query = 'SELECT * FROM snippets WHERE LOWER(language) = LOWER(?) ORDER BY created_at DESC';
      params.push(language);
    }

    const snippets = db.prepare(query).all(...params);
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении сниппетов: ' + err.message });
  }
});

app.post('/api/snippets', (req, res) => {
  try {
    const { title, language, code } = req.body;
    if (!title || !language || !code) {
      return res.status(400).json({ error: 'Поля title, language и code обязательны!' });
    }

    const stmt = db.prepare('INSERT INTO snippets (title, language, code) VALUES (?, ?, ?)');
    const result = stmt.run(title, language, code);

    res.status(201).json({
      success: true,
      snippet: { id: result.lastInsertRowid, title, language, code }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Бэкенд запущен на http://localhost:${PORT}`);
});