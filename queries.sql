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
  category_id int NOT NULL,
  topic_id int NOT NULL
);

CREATE TABLE "UserCategoryTopic" (
  id Int NOT NULL,
  categorytopic_id int NOT NULL,
  email_notice boolean NOT NULL,
  sms_notice boolean NOT NULL,
  PRIMARY KEY (id, categorytopic_id)
);

CREATE INDEX ON "User" (email_address);

CREATE INDEX ON "Category" (acronym);

CREATE INDEX ON "Topic" (acronym);

CREATE INDEX ON "CategoryTopic" (category_id, topic_id);

COMMENT ON COLUMN "User".postal_code IS 'Has to be a valid postal code';

COMMENT ON COLUMN "Category".acronym IS 'Letters only';

-- COMMENT ON COLUMN Topic.acronym IS 'Letters only';

ALTER TABLE "CategoryTopic" ADD FOREIGN KEY (category_id) REFERENCES "Category" (category_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CategoryTopic" ADD FOREIGN KEY (topic_id) REFERENCES "Topic" (topic_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCategoryTopic" ADD FOREIGN KEY (id) REFERENCES "User" (user_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCategoryTopic" ADD FOREIGN KEY (categorytopic_id) REFERENCES "CategoryTopic" (categoryTopic_id) ON DELETE CASCADE ON UPDATE CASCADE;
