import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/snippets';
const LANGUAGES = ['Все', 'JavaScript', 'Python', 'CSS', 'HTML', 'Go'];

export default function App() {
  const [snippets, setSnippets] = useState([]);
  const [selectedLang, setSelectedLang] = useState('Все');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  const fetchSnippets = async (lang = selectedLang) => {
    try {
      const res = await axios.get(API_URL, { params: { language: lang } });
      setSnippets(res.data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить сниппеты. Проверьте бэкенд.');
    }
  };

  useEffect(() => { fetchSnippets(selectedLang); }, [selectedLang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !code) return alert('Заполните поля!');
    try {
      await axios.post(API_URL, { title, language, code });
      setTitle('');
      setCode('');
      fetchSnippets(selectedLang);
    } catch (err) {
      alert('Ошибка при сохранении');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Code Snippet Box</h1>
        <p>Ваша локальная база сниппетов</p>
      </header>

      <section className="card">
        <h2 className="card-title">➕ Добавить новый сниппет</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Fetch запрос" />
          </div>
          <div className="form-group">
            <label>Язык</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.filter(l => l !== 'Все').map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Код</label>
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Код..." />
          </div>
          <button type="submit" className="btn">Сохранить сниппет</button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">📚 Каталог</h2>
        <div className="filters">
          {LANGUAGES.map(lang => (
            <button key={lang} className={`filter-btn ${selectedLang === lang ? 'active' : ''}`} onClick={() => setSelectedLang(lang)}>
              {lang}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {snippets.map(s => (
          <div key={s.id} className="snippet-item">
            <div className="snippet-header">
              <span>{s.title}</span>
              <span className="snippet-badge">{s.language}</span>
            </div>
            <pre className="snippet-code"><code>{s.code}</code></pre>
          </div>
        ))}
      </section>
    </div>
  );
}