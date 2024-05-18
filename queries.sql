select * from yoga.user;
select * from yoga.user where username like '%gen%';
select * from yoga.user where id=362575139;

select * from yoga.membership;
select * from yoga.token;

select * from yoga.lesson;
select * from yoga.lesson where date='2024-01-10';

select * from yoga.available_lessons;
select * from yoga.available_lessons 
where time between '10:00' and '20:00' and date='2024-01-10';

select * from yoga.registered_users;

select * from yoga.attendance;

select * from yoga.get_lesson('2023-05-16','07:00');

select name, username, lessons_avaliable from yoga.user
join yoga.membership on id=user_id;