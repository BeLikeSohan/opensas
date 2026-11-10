# Assumpions
1. Provided requirements sheet didnt asked for any specific ORM, I decided to use Entity as it was the most obvious choice as of current industry standard. As the db driver I am using Npgsql.

2. About data modeling, we have two routes. We can create 3 models (SchoolClass, Hold, Student) or 2 models(SchoolClass, Hold). I decided to go with 2 models because a student is only identified by their birth certificate number, they dont have any other information associated with them thus there is no point creating a seperate model for student. this decision makes the data handling easier to deal with.

3. Hold expiration is evaluated lazily at request time instead of by a background/cron job. A cron job that runs every minute would leave a window of up to a minute where an already-expired hold still counts as `HELD`. A cron job will be implemened to clear up the database from already expired holds.

4. Confirming a hold that belongs to another student returns `404`, not `403`, so the hold's existence isn't revealed.

5. Confirming an already confirmed hold returns `200` with the same response, so repeated "Pay Admission Fee" clicks are safe.

6. Confirming an expired or cancelled hold returns `409 Conflict`.

7. Cancelling an already cancelled hold returns `204`, keeping `DELETE` idempotent.

8. Only a `HELD`, unexpired hold can be cancelled; cancelling a confirmed or expired hold returns `409 Conflict`.

9. The current time comes from the backend's clock through an injected `TimeProvider`, not from the database's `now()`. Each request reads the clock once and uses that value for every check and timestamp, and tests can swap in a fake clock to control expiry. The trade-off is that with several backend instances each one uses its own clock, so small clock differences between servers can move a hold's expiry by that amount. I assume the servers are synced with NTP, which keeps that difference to milliseconds, well below the hold duration.
