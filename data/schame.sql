DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    cityName VARCHAR(255),
    formatName VARCHAR(255),
    lat VARCHAR(255),
    lon VARCHAR(255)
  );