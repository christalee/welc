# WeLC

A minimal audio player. As of 2026-10-15, it plays music selected from any mounted filesystem (including remote sources) via the client's native filepicker or the media library (which is restricted to a specific directory on the server). Features include: displaying file metadata, sorting the playlist by name asc/desc, shuffling the playlist, clearing the playlist, skipping ahead in the playlist by clicking on a filename. It also includes a media library, which takes a directory name as input and scans the filepaths and metadata into the DB, then displays them in a table with checkboxes, from which files can be played.

For insight into how this project is deployed, check out [my blog post](https://christalee.teallabs.org/posts/deploying-welc.html) on that topic.

Up next (2026-10-25): release/deploy script, search bar, history tab

## How to run this project

1. Clone the repo
2. Install the backend dependencies (ideally in a venv): `cd api && pip install -r requirements.txt`
3. Set up a Postgres DB called `welc`
4. Create a `.env.development` file (which will not be source-controlled) with correct values for these variables:
```
FLASK_APP=app.py
FLASK_ENV=development
DB_PORT=5432  # change if you use a non-default port
DB_NAME=welc
DB_USERNAME=YOUR_USERNAME
DB_PASSWORD=YOUR_PASSWORD
VITE_MUSIC_DIR=/path/to/your_music
```
5. Create the relevant tables (from inside the venv): `alembic upgrade head`
6. Run the backend dev server: `npm run api`
7. Install the frontend dependencies: `npm install`
8. Run the frontend dev server: `npm run dev`
9. View the results at `http://localhost:5173/`

## How to run tests on this project

1. Set up a Postgres DB called `welc_test`.
2. Create a `.env.testing` file (which will not be source-controlled) with correct values for these variables:
```
FLASK_APP=app.py
FLASK_ENV=testing
DB_PORT=5432  # change if you use a non-default port
DB_NAME=welc_test
DB_USERNAME=YOUR_TEST_USERNAME
DB_PASSWORD=YOUR_TEST_PASSWORD
VITE_MUSIC_DIR=/path/to/welc/cypress/fixtures
```
3. Create the relevant tables (from inside the venv): `alembic --name test upgrade head`
4. Run the frontend E2E tests headless (`npm run ci`) or interactively (`npm run api:test && npm run dev:test && npm run cypress`)
5. Run the backend API tests (from the root dir `/welc` with the venv activated): `pytest --envfile .env.testing`
6. Run the frontend unit tests: `npm run vitest` (watch mode) or `npm run vitest -- run` (single-run mode)

## Credits

The audio files included as part of the test suite are from the Library of Congress's National Jukebox project, which contains recordings in the public domain.

Van Eps, Fred, and Paul Eno. [A Rag-Time Episode.](https://www.loc.gov/item/jukebox-129854/) 1911. Audio.

Fried, Martin, Eddie Edwards, Larry Shields, Benny Krueger, J. Russel Robinson, Tony Sbarbaro, Otis Spencer, et al. [Broadway Rose.](https://www.loc.gov/item/jukebox-39314/) 1920. Audio.

Conway's Band, Julius Lenzberg, and Patrick Conway. [Hungarian Rag.](https://www.loc.gov/item/jukebox-133500/) 1913. Audio.

O'Hare, William Christopher, Henry Lodge, and Arthur Pryor's Band. [Temptation Rag](https://www.loc.gov/item/jukebox-129052/). 1910. Audio.

Arthur Pryor's Band, William Schulz, and Ted Snyder. [Ramshackle Rag.](https://www.loc.gov/item/jukebox-131069/) 1911. Audio.

Whiteman, Paul, Con Conrad, and Paul Whiteman Orchestra. [Moonlight.](https://www.loc.gov/item/jukebox-40078/) 1921. Audio.