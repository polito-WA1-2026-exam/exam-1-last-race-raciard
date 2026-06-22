import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('./database/last-race.db');

const stations = [
  // Original 12
  "Pietro Smusi Ave.", "Orazio Grinzosi Monument", "Claudio Torres St.", "Bibbiena Square",
  "Porta Belandi", "Borgo Catafratto", "Zephir Boulevard", "Bruno Strati Tower",
  "Mhanz Road", "Porto Caselli", "Piermenti Gardens", "Bruttovedere",
  // New 3 (Canova Bridge, Foscari Gate, & Valdoria Crossing removed)
  "Stellario Park", "Montecchi Heights", "Rialto East"
];
// Station IDs after insert (autoincrement, insertion order):
//  1 Pietro Smusi Ave.        2 Orazio Grinzosi Monument  3 Claudio Torres St.
//  4 Bibbiena Square          5 Porta Belandi             6 Borgo Catafratto
//  7 Zephir Boulevard         8 Bruno Strati Tower        9 Mhanz Road
// 10 Porto Caselli            11 Piermenti Gardens        12 Bruttovedere
// 13 Stellario Park           14 Montecchi Heights        15 Rialto East
//
// Interchange stations:
//   Claudio Torres St.(3)    → Red + Blue
//   Bibbiena Square(4)       → Red + Green
//   Porta Belandi(5)         → Red + Yellow
//   Porto Caselli(10)        → Blue + Green
//   Stellario Park(13)       → Green + Yellow

const lines = [
  // Red:    Pietro ─ Orazio ─ Claudio ─ Bibbiena ─ Porta ─ Borgo
  { name: "Red Line", stations: ["Pietro Smusi Ave.", "Orazio Grinzosi Monument", "Claudio Torres St.", "Bibbiena Square", "Porta Belandi", "Borgo Catafratto"] },
  // Blue:   Zephir ─ Bruno ─ Claudio ─ Mhanz ─ Porto ─ Piermenti
  { name: "Blue Line", stations: ["Zephir Boulevard", "Bruno Strati Tower", "Claudio Torres St.", "Mhanz Road", "Porto Caselli", "Piermenti Gardens"] },
  // Green:  Bruttovedere ─ Bibbiena ─ Porto ─ Stellario
  { name: "Green Line", stations: ["Bruttovedere", "Bibbiena Square", "Porto Caselli", "Stellario Park"] },
  // Yellow: Montecchi ─ Porta ─ Rialto East ─ Stellario
  { name: "Yellow Line", stations: ["Montecchi Heights", "Porta Belandi", "Rialto East", "Stellario Park"] }
];

const events = [
  { description: "Quiet journey", effect: 0 },
  { description: "Wrong platform", effect: -1 },
  { description: "Kind passenger", effect: 2 },
  { description: "Ticket check", effect: 0 },
  { description: "Pickpocket", effect: -3 },
  { description: "Found a coin", effect: 2 },
  { description: "Musician at the station", effect: 1 },
  { description: "Technical fault", effect: -2 },
  { description: "Fast transit", effect: 2 },
  { description: "Delayed train", effect: -1 },
  { description: "Vending machine refund", effect: 3 },
  { description: "Lost your ticket", effect: -2 },
  { description: "Crowded carriage", effect: 0 },
  { description: "Empty seat found", effect: 1 },
  { description: "Fined for snacking", effect: -1 },
  { description: "Helped a tourist", effect: 2 },
  { description: "Dropped wallet", effect: -3 },
  { description: "Found a dropped pass", effect: 4 }
];

const users = [
  { username: "giuseppe", password: "webapp" },
  { username: "antimo", password: "prova" },
  { username: "pasquale", password: "ciao" },
  { username: "michele", password: "buonasera" }
];

db.serialize(() => {
  // Drop tables
  db.run("DROP TABLE IF EXISTS connections");
  db.run("DROP TABLE IF EXISTS lines");
  db.run("DROP TABLE IF EXISTS stations");
  db.run("DROP TABLE IF EXISTS events");
  db.run("DROP TABLE IF EXISTS games");
  db.run("DROP TABLE IF EXISTS users");

  // Create tables
  db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        hash TEXT NOT NULL,
        salt TEXT NOT NULL
    )`);

  db.run(`CREATE TABLE stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

  db.run(`CREATE TABLE lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

  db.run(`CREATE TABLE connections (
        line_id INTEGER NOT NULL,
        station_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        PRIMARY KEY (line_id, station_id),
        FOREIGN KEY (line_id) REFERENCES lines(id),
        FOREIGN KEY (station_id) REFERENCES stations(id)
    )`);

  db.run(`CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        effect INTEGER NOT NULL
    )`);

  db.run(`CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        start_station_id INTEGER NOT NULL,
        destination_station_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (start_station_id) REFERENCES stations(id),
        FOREIGN KEY (destination_station_id) REFERENCES stations(id)
    )`);

  // Insert stations
  const insertStation = db.prepare("INSERT INTO stations (name) VALUES (?)");
  stations.forEach(s => insertStation.run(s));
  insertStation.finalize();

  // Insert events
  const insertEvent = db.prepare("INSERT INTO events (description, effect) VALUES (?, ?)");
  events.forEach(e => insertEvent.run(e.description, e.effect));
  insertEvent.finalize();

  // Insert lines and connections
  lines.forEach((l, lIdx) => {
    db.run("INSERT INTO lines (name) VALUES (?)", [l.name], function (err) {
      if (err) return console.error(err.message);
      const lineId = this.lastID;
      const insertConn = db.prepare("INSERT INTO connections (line_id, station_id, position) VALUES (?, ?, ?)");
      l.stations.forEach((sName, sPos) => {
        db.get("SELECT id FROM stations WHERE name = ?", [sName], (err, row) => {
          if (row) insertConn.run(lineId, row.id, sPos);
        });
      });
    });
  });

  // Insert users
  users.forEach(u => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(u.password, salt, 32).toString('hex');
    db.run("INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)", [u.username, hash, salt], function (err) {
      if (err) return;
      const userId = this.lastID;

      // Insert some games for user1 and user2
      if (u.username === "giuseppe") {
        db.get("SELECT id FROM stations WHERE name = 'Pietro Smusi Ave.'", (err, sRow) => {
          db.get("SELECT id FROM stations WHERE name = 'Bruttovedere'", (err, dRow) => {
            if (sRow && dRow) {
              db.run("INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)", [userId, sRow.id, dRow.id, 8]);
            }
          });
        });
        db.get("SELECT id FROM stations WHERE name = 'Rialto East'", (err, sRow) => {
          db.get("SELECT id FROM stations WHERE name = 'Orazio Grinzosi Monument'", (err, dRow) => {
            if (sRow && dRow) {
              db.run("INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)", [userId, sRow.id, dRow.id, 11]);
            }
          });
        });
      } else if (u.username === "antimo") {
        db.get("SELECT id FROM stations WHERE name = 'Montecchi Heights'", (err, sRow) => {
          db.get("SELECT id FROM stations WHERE name = 'Pietro Smusi Ave.'", (err, dRow) => {
            if (sRow && dRow) {
              db.run("INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)", [userId, sRow.id, dRow.id, 10]);
            }
          });
        });
      }
    });
  });

  console.log("Database seeded successfully!");
});
