Project 2 for CS50 Web App


This project is "One page application". In a beginning user have to enter display name. To prevent mess with same names user will be asked to enter email as well. 
All this info (as well as last visited channel) will be kept on client side until user click "logout".
Now user can create a channel. Name of a channel can't repeat. Otherwise user will see modal window with alarm message.
Then he can send messages. Also user can delete his own message (this is "personal touch"). The message will disappear with css animation feature.
In one channel can't be more than 100 messages. If so, first one will be deleted.
After posting if messages area is bigger than screen, it scrolls down to the last message.
This events will broadcast to all user who is on this chat application.
Also for convenience of user in the channel badge there is a counter of messages ("personal touch").
If the screen is small, then the left column with channels will be hidden, and on top in navigation bar will appear a menu with channels ("personal touch").
Because I'm Russian speaker, I've included encoding and decoding of sending messages and channels names. Otherwise text will be unreadable.
After creating the channel, the user will be switched to it. But this will not affect other users.
They will remain where they are, but will see new channels and changing of message counters.


This is it in general.
Have a nice day.


static/
-- pic/       -> pictures for the project
-- quire.js   -> JavaScript functions etc.
-- styles.css -> additional styles for the index.html 

templates/
-- index.html -> One page (it's OnePageApp :)

application.py -> python programm
README.md      -> this file
requirements.txt -> I add only "urllib.parse import unquote" not shure if it is in python3 main distribution
