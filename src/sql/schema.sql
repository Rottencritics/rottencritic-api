CREATE TABLE IF NOT EXISTS films(
    id SERIAL PRIMARY KEY,
    imdbId VARCHAR(20) UNIQUE
);

CREATE TABLE IF NOT EXISTS reviewers(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    password VARCHAR(128) -- FIXME: Update this when salt is decided.
);

CREATE TABLE IF NOT EXISTS reviews(
    reviewer SERIAL REFERENCES reviewers(id),
    film SERIAL REFERENCES films(id),
    rating INTEGER DEFAULT 0,
    PRIMARY KEY (reviewer,film)
);
