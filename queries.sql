CREATE TYPE Province AS ENUM (
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NT',
  'NS',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT'
);

CREATE TABLE "User" (
  user_id SERIAL PRIMARY KEY,
  email_address text UNIQUE NOT NULL,
  phone_address int UNIQUE,
  phone_id SERIAL,
  postal_code varchar(10),
  province Province NOT NULL
);

CREATE TABLE "Category" (
  category_id SERIAL PRIMARY KEY,
  acronym varchar(10) UNIQUE NOT NULL,
  title varchar(50) NOT NULL,
  category_description text
);

CREATE TABLE "Topic" (
  topic_id SERIAL PRIMARY KEY,
  acronym varchar(10) UNIQUE NOT NULL
);

CREATE TABLE "CategoryTopic" (
  categoryTopic_id SERIAL PRIMARY KEY,
  -- category_id int NOT NULL,
  category_acronym varchar(10) NOT NULL,
  -- topic_id int NOT NULL,
  topic_acronym varchar(10) NOT NULL
);

CREATE TABLE "UserCategoryTopic" (
  user_id Int NOT NULL,
  categoryTopic_id int NOT NULL,
  email_notice boolean NOT NULL,
  sms_notice boolean NOT NULL,
  PRIMARY KEY (id, categoryTopic_id)
);

CREATE INDEX ON "User" (email_address);

CREATE INDEX ON "Category" (acronym);

CREATE INDEX ON "Topic" (acronym);

CREATE UNIQUE INDEX ON "CategoryTopic" (category_acronym, topic_acronym);

COMMENT ON COLUMN "User".postal_code IS 'Has to be a valid postal code';

COMMENT ON COLUMN "Category".acronym IS 'Letters only';

-- COMMENT ON COLUMN Topic.acronym IS 'Letters only';

ALTER TABLE "CategoryTopic" ADD FOREIGN KEY (category_acronym) REFERENCES "Category" (acronym) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CategoryTopic" ADD FOREIGN KEY (topic_acronym) REFERENCES "Topic" (acronym) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCategoryTopic" ADD FOREIGN KEY (id) REFERENCES "User" (user_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCategoryTopic" ADD FOREIGN KEY (categoryTopic_id) REFERENCES "CategoryTopic" (categoryTopic_id) ON DELETE CASCADE ON UPDATE CASCADE;
