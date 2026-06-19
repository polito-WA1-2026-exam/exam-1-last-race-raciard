# Exam #1: "Last Race"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: Main gameplay view. Contains the interactive subway map visualization, handles route planning logic, and displays the step-by-step animation of the executed journey.
- Route `/ranking`: Leaderboard view. Fetches and displays the global ranking of users based on their total cumulative scores across all played games.
- Route `*`: Catch-all wildcard route that automatically redirects any unknown URL paths back to the root `/` page.

## API Server

- POST `/api/sessions`
  - Request body: JSON object containing credentials: `{ "username": "user1", "password": "password" }`
  - Response: `200 OK` with a JSON object of the authenticated user `{ "id": 1, "username": "user1" }`, or `401 Unauthorized` if invalid.
- DELETE `/api/sessions/current`
  - Request parameters: None
  - Response: `204 No Content` upon successful logout.
- GET `/api/sessions/current`
  - Request parameters: None
  - Response: `200 OK` with the current session's user object `{ "id": 1, "username": "user1" }`, or `401 Unauthorized` if not logged in.
- GET `/api/network`
  - Request parameters: None
  - Response: `200 OK` with a JSON object containing the complete topology: `{ "stations": [...], "lines": [...] }`. Stations include `id` and `name`. Lines include `id`, `name`, and ordered `stations`.
- GET `/api/events`
  - Request parameters: None
  - Response: `200 OK` with a JSON array of all available random events, e.g., `[{ "id": 1, "description": "Quiet journey", "effect": 0 }]`.
- GET `/api/ranking`
  - Request parameters: None (Requires Authentication)
  - Response: `200 OK` with a JSON array of the leaderboard: `[{ "username": "user1", "totalScore": 33 }]`.
- POST `/api/games`
  - Request parameters: None (Requires Authentication)
  - Response: `200 OK` with a JSON object dictating the random start and destination stations: `{ "start": { "id": 1, "name": "..." }, "destination": { "id": 12, "name": "..." } }`.
- POST `/api/games/result`
  - Request body: JSON object containing the planned route as an array of station IDs: `{ "route": [1, 2, 3, 4] }`
  - Response: `200 OK` with a JSON object detailing the game's execution result: `{ "score": 15, "steps": [...], "isInvalid": false, "failReason": null }`. Or `403 Forbidden` if the planning timer expired.

## Database Tables

- Table `users` - Stores user credentials. Columns: `id` (PK), `username` (UNIQUE), `hash` (password hash), `salt`.
- Table `stations` - Stores subway stations. Columns: `id` (PK), `name` (UNIQUE).
- Table `lines` - Stores subway lines. Columns: `id` (PK), `name` (UNIQUE).
- Table `connections` - Junction table defining the many-to-many relationship between lines and stations, including order. Columns: `line_id` (FK), `station_id` (FK), `position` (integer indicating the stop order).
- Table `events` - Stores random journey events. Columns: `id` (PK), `description`, `effect` (score modifier).
- Table `games` - Stores completed game records. Columns: `id` (PK), `user_id` (FK), `start_station_id` (FK), `destination_station_id` (FK), `score`, `date`.

## Main React Components

- `GameView` (in `views/GameView.jsx`): Top-level component orchestrating the game phases (SETUP, PLANNING, EXECUTION, RESULT) and layout coordination between the interactive map and the sidebar.
  - `NetworkMap` (in `components/network/NetworkMap.jsx`): Complex SVG canvas utilizing custom hooks (`useWalkAnimation`, `useMapLayout`, `useGameStateDerived`) to visualize the subway network, handle character animation, and allow click-based route planning.
  - `RouteBuilder` (in `components/game/RouteBuilder.jsx`): Sidebar component managing the user's selected path during the planning phase.
  - `JourneyLog` (in `components/game/JourneyLog.jsx`): Sidebar component that renders the step-by-step history of the execution phase, revealing randomly triggered events.
  - `GameControls` (in `components/network/GameControls.jsx`): Header bar managing the global state triggers, such as the "Start Game" button, route submission, and the strict 90-second countdown timer.
- `rankingView` (in `views/rankingView.jsx`): Top-level component that fetches and displays the global ranking of users based on their total cumulative scores across all played games.

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- `user1`, `password`
- `user2`, `password`
- `user3`, `password`

## Use of AI Tools

