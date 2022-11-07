CREATE TABLE User (
    user_id int PRIMARY KEY AUTO_INCREMENT, 
    email_address text UNIQUE NOT NULL INDEX,
    phone_address int UNIQUE,
    phone_id int UNIQUE AUTO_INCREMENT,
    postal_code varchar(10),
    province ENUM('AB','BC','MB','NB','NL','NT','NS','NU','ON','PE','QC','SK','YT') NOT NULL
)

CREATE TABLE Category (
    category_id int PRIMARY KEY AUTO_INCREMENT,
    acronym varchar(10) UNIQUE NOT NULL,
    title varchar(50) NOT NULL,
    category_description text 
)

CREATE TABLE Topic (
    topic_id int PRIMARY KEY AUTO_INCREMENT,
    acronym varchar(10) UNIQUE, NOT NULL
)

CREATE TABLE CategoryTopic (
    categoryTopic_id int PRIMARY KEY AUTO_INCREMENT,
    category_id int NOT NULL FOREIGN KEY REFERENCES Category(category_id),
    topic_id int NOT NULL FOREIGN KEY REFERENCES Topic(topic_id)
)

CREATE TABLE UserCategoryTopic (
    user_id int NOT NULL FOREIGN KEY REFERENCES User(user_id),
    categoryTopic_id int NOT NULL FOREIGN KEY REFERENCES CategoryTopic(categoryTopic_id),
    email_notice boolean NOT NULL,
    sms notice boolean NOT NULL
)

-- TODO: create index
-- CREATE INDEX user_email ON User(email_address)
CREATE UNIQUE INDEX category_topic on CategoryTopic(category_id, topic_id)