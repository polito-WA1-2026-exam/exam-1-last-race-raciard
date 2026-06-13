# Database Schema Description

This document describes the database schema for the "Last Race" application.

## Tables

### `users`
Stores registered users.
- `id`: Primary Key, Integer, Autoincrement.
- `username`: Unique, String. The user's login name.
- `hash`: String. The hashed password.
- `salt`: String. The salt used for hashing.

### `stations`
Stores the stations in the underground network.
- `id`: Primary Key, Integer, Autoincrement.
- `name`: Unique, String. The name of the station.

### `lines`
Stores the metro lines.
- `id`: Primary Key, Integer, Autoincrement.
- `name`: Unique, String. The name of the line (e.g., "Red Line").

### `connections`
Represents the stations belonging to each line and their order.
- `line_id`: Foreign Key referencing `lines(id)`.
- `station_id`: Foreign Key referencing `stations(id)`.
- `position`: Integer. The order of the station within the line.
- Primary Key: (`line_id`, `station_id`).

### `events`
Stores random events that can occur during a segment.
- `id`: Primary Key, Integer, Autoincrement.
- `description`: String. Description of the event.
- `effect`: Integer. The coin effect (-4 to +4).

### `games`
Stores the results of games played by registered users.
- `id`: Primary Key, Integer, Autoincrement.
- `user_id`: Foreign Key referencing `users(id)`.
- `start_station_id`: Foreign Key referencing `stations(id)`.
- `destination_station_id`: Foreign Key referencing `stations(id)`.
- `score`: Integer. The final number of coins.
- `date`: DateTime. When the game was played.
