## The JavaScript Shaolin : A Google Maps application

# What is it ?
Basically, it is a CRUD of doctors living in Paris. Everything must be made with
Node.js, AngularJS and MongoDB, so basically, full JavaScript.

Everything is working in real time on all instances of the application.

When inserting/modifying, the application queries Google Maps different addresses,
and pick the one that is in Paris if there is one.
Then it adds it on the map of all users, and all users have the same permission
on this new created doctor.

## How was it developped ?

It has been devlopped using a main applicative bricks :

    - Obviously Node, Angular and Mongo
    - Node modules :
        - Express
        - Jade
        - GoogleMaps
        - Mongoose
        - Socket.io
    - Angular small external extension in order to use Google Maps
in an easier way.

I have been going in a lot of different directions, and had to step back
an incredible number of times. Getting the best pratices in Angular isn't
as easy as we could think at the first sight.

## Apologies

For not being able to write more, but I'm getting really tired,
and need to leave in 3 hours.
Note that I've tried my best to keep my code presentable, knowing that
you would observe it after.

## Finally

I really hope you will enjoy it, and that it will suit your needs.
