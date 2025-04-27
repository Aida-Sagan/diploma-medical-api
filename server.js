const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Подключение к SQLite базе
const dbPath = path.resolve(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Ошибка подключения к БД:', err.message);
  console.log('✅ БД подключена');
});

// Создание таблиц при запуске
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    gender TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER,
    date TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY (patientId) REFERENCES patients(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medical_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER NOT NULL,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (patientId) REFERENCES patients(id)
  )`);
});

// API: Patients
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/patients', (req, res) => {
  const { fullName, birthDate, gender } = req.body;
  db.run(
    'INSERT INTO patients (fullName, birthDate, gender) VALUES (?, ?, ?)',
    [fullName, birthDate, gender],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// API: Appointments
app.get('/api/appointments', (req, res) => {
  db.all(
    `SELECT appointments.id, patients.fullName, appointments.date, appointments.reason
     FROM appointments
     JOIN patients ON patients.id = appointments.patientId`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/appointments', (req, res) => {
  const { patientId, date, reason } = req.body;
  db.run(
    'INSERT INTO appointments (patientId, date, reason) VALUES (?, ?, ?)',
    [patientId, date, reason],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/appointments/:id/delete', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM appointments WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Ошибка удаления приёма');
    res.redirect('/appointments');
  });
});


// API: Medical History
app.post('/api/history', (req, res) => {
  const { patientId, diagnosis, notes } = req.body;
  db.run(
    'INSERT INTO medical_history (patientId, diagnosis, notes) VALUES (?, ?, ?)',
    [patientId, diagnosis, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get('/api/history/:id', (req, res) => {
  db.all(
    `SELECT mh.id, mh.diagnosis, mh.notes, p.fullName
     FROM medical_history mh
     JOIN patients p ON p.id = mh.patientId
     WHERE mh.patientId = ?`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// UI: Пациенты
app.get('/', (req, res) => {
  db.all('SELECT * FROM patients', (err, patients) => {
    if (err) return res.status(500).send('Ошибка загрузки пациентов');
    res.render('index', { patients });
  });
});

// UI: Приёмы
app.get('/appointments', (req, res) => {
  db.all(
    `SELECT appointments.id, patients.fullName, appointments.date, appointments.reason
     FROM appointments
     JOIN patients ON patients.id = appointments.patientId`,
    (err, appointments) => {
      if (err) return res.status(500).send('Ошибка загрузки приёмов');
      db.all('SELECT * FROM patients', (err, patients) => {
        if (err) return res.status(500).send('Ошибка загрузки пациентов');
        res.render('appointments', { appointments, patients });
      });
    }
  );
});

app.post('/appointments', (req, res) => {
  const { patientId, date, reason } = req.body;
  db.run(
    'INSERT INTO appointments (patientId, date, reason) VALUES (?, ?, ?)',
    [patientId, date, reason],
    (err) => {
      if (err) return res.status(500).send('Ошибка при создании приёма');
      res.redirect('/appointments');
    }
  );
});

// UI: История болезней
app.get('/history', (req, res) => {
  db.all('SELECT * FROM patients', (err, patients) => {
    if (err) return res.status(500).send('Ошибка загрузки пациентов');
    db.all(
      `SELECT mh.*, p.fullName
       FROM medical_history mh
       JOIN patients p ON p.id = mh.patientId`,
      (err, history) => {
        if (err) return res.status(500).send('Ошибка истории');
        res.render('history', { patients, history });
      }
    );
  });
});

app.post('/history', (req, res) => {
  const { patientId, diagnosis, notes } = req.body;
  db.run(
    'INSERT INTO medical_history (patientId, diagnosis, notes) VALUES (?, ?, ?)',
    [patientId, diagnosis, notes],
    (err) => {
      if (err) return res.status(500).send('Ошибка добавления');
      res.redirect('/history');
    }
  );
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});