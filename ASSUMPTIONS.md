# Assumpions
1. Provided requirements sheet didnt asked for any specific ORM, I decided to use Entity as it was the most obvious choice as of current industry standard. As the db driver I am using Npgsql.

2. About data modeling, we have two routes. We can create 3 models (SchoolClass, Hold, Student) or 2 models(SchoolClass, Hold). I decided to go with 2 models because a student is only identified by their birth certificate number, they dont have any other information associated with them thus there is no point creating a seperate model for student. this decision makes the data handling easier to deal with.

3. Hold expiration is evaluated lazily at request time instead of by a background/cron job. A cron job that runs every minute would leave a window of up to a minute where an already-expired hold still counts as `HELD`. A cron job will be implemened to clear up the database from already expired holds.