# Assumpions

Ans of Bonus Question 1:
Even If we run two backend instances with a single database the held+confirmed count will never exceed totalSeats
because the actual lives in the postgres database, not only in the backend application. Every hold request
opens a transaction and locks the class row. So instance A and instance B queue up on it the same way two request
to one instance would.

1. Provided requirements sheet didnt asked for any specific ORM, I decided to use Entity as it was the most obvious choice as of current industry standard. As the db driver I am using Npgsql.

2. About data modeling, we have two routes. We can create 3 models (SchoolClass, Hold, Student) or 2 models(SchoolClass, Hold). I decided to go with 2 models because a student is only identified by their birth certificate number, they dont have any other information associated with them thus there is no point creating a seperate model for student. this decision makes the data handling easier to deal with.

3. Hold expiration is evaluated lazily at request time instead of by a background/cron job. A cron job that runs every minute would leave a window of up to a minute where an already-expired hold still counts as `HELD`. Separately, a background worker (`HoldExpiryWorker`) runs every minute and marks every `HELD` hold past its expiry as `EXPIRED`, so the stored status catches up even for classes nobody touches. Correctness never depends on it; it only keeps the database tidy. The sweep is a single guarded `UPDATE`, so running it on several backend instances at once is safe.

4. Confirming a hold that belongs to another student returns `404`, not `403`, so the hold's existence isn't revealed.

5. Confirming an already confirmed hold returns `200` with the same response, so repeated "Pay Admission Fee" clicks are safe.

6. Confirming an expired or cancelled hold returns `409 Conflict`.

7. Cancelling an already cancelled hold returns `204`, keeping `DELETE` idempotent.

8. Only a `HELD`, unexpired hold can be cancelled; cancelling a confirmed or expired hold returns `409 Conflict`.

9. The current time comes from the backend's clock through an injected `TimeProvider`, not from the database's `now()`. Each request reads the clock once and uses that value for every check and timestamp, and tests can swap in a fake clock to control expiry. The trade-off is that with several backend instances each one uses its own clock, so small clock differences between servers can move a hold's expiry by that amount. I assume the servers are synced with NTP, which keeps that difference to milliseconds, well below the hold duration.

10. The assignment does not define error response bodies, so errors (`400`, `404`, `409`) use the standard ASP.NET Core ProblemDetails format (`type`, `title`, `status`, `detail`).

11. A student is identified by their birth certificate number, sent in the `X-Student-Id` header. I assume it is exactly 17 ASCII digits (`0-9`), the format of the Bangladeshi birth registration number. A missing header, or a value with letters, spaces, symbols or any other length, returns `400`. The value is stored as text rather than a number so leading zeros are kept.
