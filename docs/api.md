# API Reference

Base URL: `http://localhost:3001/api`

All requests and responses use JSON. Endpoints marked **🔒 auth required** return `401` if the session cookie is missing or expired.

---

## Sessions

### `POST /api/sessions`
Log in. Creates a session cookie.

**Request body**
```json
{ "username": "user1", "password": "password" }
```

**Response `200`**
```json
{ "id": 1, "username": "user1" }
```

**Response `401`** – wrong credentials
```json
{ "message": "Incorrect username or password." }
```

---

### `GET /api/sessions/current`
Check whether the current session is authenticated.

**Response `200`**
```json
{ "id": 1, "username": "user1" }
```

**Response `401`**
```json
{ "error": "Not authenticated" }
```

---

### `DELETE /api/sessions/current`
Log out. Destroys the server-side session.

**Response `204`** – no body

---

## Network

### `GET /api/network`
Return the entire network in a single response: all stations and all lines with their ordered stations. Segments (adjacent station pairs) are derivable client-side from consecutive entries in each line's `stations` array.

**Response `200`**
```json
{
  "stations": [
    { "id": 1, "name": "Pietro Smusi Ave." },
    ...
  ],
  "lines": [
    {
      "id": 1,
      "name": "Red Line",
      "stations": [
        { "id": 1, "name": "Pietro Smusi Ave.", "position": 0 },
        { "id": 2, "name": "Orazio Grinzosi Monument", "position": 1 },
        ...
      ]
    },
    ...
  ]
}
```

---

## Game

### `GET /api/events`
List all random events that can occur during a journey segment.

**Response `200`**
```json
[
  { "id": 1, "description": "Quiet journey", "effect": 0 },
  { "id": 5, "description": "Pickpocket", "effect": -4 },
  ...
]
```

---

### `GET /api/ranking`
List all users who have played at least one game, ordered by best score descending.

**Response `200`**
```json
[
  { "username": "user1", "best_score": 18, "games_played": 2 },
  ...
]
```

---

### `POST /api/games` 🔒
Start a new game. The server picks a random start and destination (minimum 3 stops apart) and stores them in the session.

**Request body** – none

**Response `200`**
```json
{
  "start":       { "id": 5, "name": "Porta Belandi" },
  "destination": { "id": 12, "name": "Bruttovedere" }
}
```

**Response `401`** – not authenticated

**Response `500`** – could not find valid station pair

---

### `POST /api/games/result` 🔒
Submit the planned route. The server validates it, executes it step by step (applying random events), saves the score, and returns the full journey result.

**Request body**
```json
{
  "route": [
    { "s1_id": 5, "s2_id": 6 },
    { "s1_id": 6, "s2_id": 3 },
    ...
  ]
}
```

Each element is one directed segment (departure → arrival station).

**Response `200` – valid route**
```json
{
  "isInvalid": false,
  "score": 17,
  "steps": [
    {
      "segment":     { "s1_id": 5, "s2_id": 6 },
      "lineId":      2,
      "event":       { "description": "Kind passenger", "effect": 1 },
      "coinsBefore": 20,
      "coinsAfter":  21,
      "isFailed":    false
    },
    ...
  ]
}
```

**Response `200` – invalid / incomplete route**
```json
{
  "isInvalid": true,
  "score": 0,
  "steps": [...]
}
```
The player loses all coins and `score` is `0`.

**Response `400`** – no active game in session
```json
{ "error": "No active game" }
```

**Response `403`** – planning time exceeded (> 95 s)
```json
{ "error": "Planning time exceeded" }
```

**Response `401`** – not authenticated

---

## Error format

All error responses share a common shape:
```json
{ "error": "Human-readable message" }
```
