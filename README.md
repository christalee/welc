# WeLC

A minimal audio player. As of 2026-09-24, it plays music selected from any mounted filesystem (including remote sources) via the system filepicker. Features include: displaying file metadata, sorting the playlist by name asc/desc, shuffling the playlist, clearing the playlist, skipping ahead in the playlist by clicking on a filename. It also includes a media library, which takes a directory name as input and scans the filepaths and metadata into the DB, then displays them in a table with checkboxes.

Under development (2026-09-24): connecting the media library data with the playlist, so files can be selected and enqueued from the media library tab.

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
```
3. Create the relevant tables (from inside the venv): `alembic --name test upgrade head`
4. Run the frontend tests headless (`npm run ci`) or interactively (`npm run api:test && npm run dev:test && npm run cypress`)
5. Run the backend tests (from inside the venv): `pytest`