eflewis
15-237 Term Project README

THE GOAL OF THE PROJECT:

Create an application that helps directors communicate stage movements to their actors.

WHAT I HAVE SO FAR:

- The app is called Bloocker. Because it's like. Extra vowels. Instead of not enough? Haha...
- Users can register and log in.
- Once logged in, users can create new shows.
--Shows have two types of permission: read and write. 
--Users have two lists of Show ID's : shows for which they have permission and shows to which they have gotten access.
- Everything is stored using MongoDB.

WHAT I WILL HAVE AT THE END OF ALL THIS:

- Users can edit shows to which they have write access, including giving other users read and write access.
- Users can see a list of their active shows on their home page (so far they can only add new shows).
- Users can add movement cues to their shows and edit or delete them.
- Users with read access can see all of the blocking for a show, filterable by the characters involved.
- A screen where users can see the current blocking cue, as well as the one preceding and the one following.
-- Also a way to skip to a cue.
---These let actors walk through a scene with a director. Changes to blocking are real-time, enabled by sockets.
- Users can delete their accounts.
- Passwords still need to get hashed/salted.
- Nice looking CSS, as opposed to no CSS. Responsive design so that directors can more easily add cues from the desktop.
- A less awful name????? <--If there's time at the end.

THIRD PARTY LIBRARY:

I used a third-party library to easily parse GET data from the page URL because I wrote enough server stuff before Evan's awesome
lecture that it's no longer time-efficient to change everything. I also plan to use a hashing library for passwords.