-- getUserById
select * from "User" where "User".user_id = 1;

-- getUserByEmail
select * from "User" where "User".email_address = 'abc@mail.com';

-- getCategoryTopicByUserId
select * from "UserCategoryTopic", "CategoryTopic" where "UserCategoryTopic".user_id = 1 and "UserCategoryTopic".categoryTopic_id = "CategoryTopic".categoryTopic_id;

-- getCategoryByAcronym
select * from "Category" where "Category".acronym = 'HC';

-- getTopicsOfCategoryByAcronym
select * from "Topic", "CategoryTopic" where "Topic".acronym = "CategoryTopic".topic_acronym and "CategoryTopic".category_acronym = 'HC';
-- select * from "CategoryTopic" where "CategoryTopic".category_acronym = 'HC';

-- getTopicByAcronym
select * from "Topic" where "Topic".acronym = 'tax';

-- MUTATIONS
-- createUser
insert into "User" (email_address, phone_address, postal_code, province) values ('abc@mail.com', 12345, '2j79h2', 'BC');

-- updateUser
update "User" set email_address = 'def@mail.com', phone_address = 123, postal_code = 'tyght', province = 'AB' where user_id = 1;

-- deleteUser
delete from "User" where "User".user_id = 2;

-- createCategory
insert into "Category" (acronym, title, category_description) values ('EDU', 'Education', 'subscribe to receive stuff about education.');

-- updateCategory
update "Category" set acronym = 'ED', title = 'Educational Resources', category_description = 'stuff on edu' where category_id = 1;

-- deleteCategory
delete from "Category" where "Category".category_id = 1;

-- createTopic
insert into "Topic" (acronym) values ('covid');

-- updateTopic
update "Topic" set acronym = 'covid19' where "Topic".topic_id = 1;

-- deleteTopic
delete from "Topic" where "Topic".topic_id = 1;

-- addTopicToCategory
insert into "CategoryTopic" (category_acronym, topic_acronym) values ('ED', 'covid19');

-- userFollowCategoryTopic
insert into "UserCategoryTopic" (user_id, email_notice, sms_notice, categoryTopic_id) select 1, true, false, "CategoryTopic".categoryTopic_id from "CategoryTopic" where "CategoryTopic".category_acronym = 'ED' and "CategoryTopic".topic_acronym = 'tax';

-- userUnfollowCategoryTopic
delete from "UserCategoryTopic" where "UserCategoryTopic".user_id = 1 and "UserCategoryTopic".categoryTopic_id in (select categoryTopic_id from "CategoryTopic" where "CategoryTopic".category_acronym = 'ED' and "CategoryTopic".topic_acronym = 'covid19');

