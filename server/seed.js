import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('./database/last-race.db');

const stations = [
  "Pietro Smusi Ave.", "Orazio Grinzosi Monument", "Claudio Torres str.", "Bibbiena Square",
  "Fontana Oscura", "Borgo Sereno", "Viale dei Mosaici", "Torre Cinerea",
  "Campo dell'Eco", "Porto Vecchio", "Giardini Segreti", "Belvedere"
];

const lines = [
  { name: "Red Line", stations: ["Pietro Smusi Ave.", "Orazio Grinzosi Monument", "Claudio Torres str.", "Bibbiena Square"] },
  { name: "Blue Line", stations: ["Fontana Oscura", "Borgo Sereno", "Claudio Torres str.", "Viale dei Mosaici"] },
  { name: "Green Line", stations: ["Porta Velaria", "Borgo Sereno", "Torre Cinerea", "Campo dell'Eco"] },
  { name: "Yellow Line", stations: ["Piazza delle Lanterne", "Torre Cinerea", "Porto Vecchio", "Giardini Segreti", "Belvedere"] }
];

const events = [
  { description: "Quiet journey", effect: 0 },
  { description: "Wrong platform", effect: -2 },
  { description: "Kind passenger", effect: 1 },
  { description: "Ticket check", effect: 0 },
  { description: "Pickpocket", effect: -4 },
  { description: "Found a coin", effect: 2 },
  { description: "Musician at the station", effect: 1 },
  { description: "Technical fault", effect: -3 }
];

const users = [
  { username: "user1", password: "password" },
  { username: "user2", password: "password" },
  { username: "user3", password: "password" }
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
      // insertConn.finalize(); // Can't finalize here easily due to async db.get
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
      if (u.username === "user1") {
        db.run("INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)", [userId, 1, 4, 15]);
        db.run("INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)", [userId, 2, 7, 18]);
      } else if (u.username === "user2") {
        db.run("INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)", [userId, 5, 9, 10]);
      }
    });
  });

  console.log("Database seeded successfully!");
});
