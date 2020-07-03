# Collection of Tampermonkey scripts for Conquer Club

## Content
### 1. Conquer Club -  Watch This Game
### 2. Conquer Club - Team Spoils
### 3. Conquer Club - Handy Game History

## Conquer Club -  Watch This Game
Need to know what's happening in other games you are not playing? Looking after tournament or friend's game? Too tired to bookmark dozens of games you like to watch?

Here it comes, script that allows you to mark certain games you like and see them in additional tab on the main screen!


Script works in Firefox and Google Chrome. Fully compatible with BOB.

User Guide - https://www.conquerclub.com/forum/viewtopic.php?f=526&t=139337&p=3041094#p3041094

### TODO
Check if it is possible to integrate with chat sniffer
Go to next "watched" game
Sort by game state option

### Changelog
#### Version 1.4.4
* Fixed - "watch"/"unwatch" links stopped working after recent site update - thanks to dgz345 for the fix
* Added - support of Polymorphic games
* Added - support of Zombie spoils
* Added - support of Parachute forts and No forts
* Added - support of Trench Warfare
* Added - support of Round Limits

#### Version 1.4.3
* Fixed - "watch all player's games" link was not in place
* Fixed - Now script makes 3 requests to the server instead of dozens. This will greatly speed-up tab loading time. Try it yourself!

#### Version 1.4.2
* Added - "watch this tournament" snippet to tournament pages
* Added - freemiums now have correct rank icons
* Added - reserved slots now show correctly for waiting games

#### Version 1.4.1
* Added - "watch" snippet to each [game] tag
* Added - empty slots now show correctly for waiting games
* Fixed - USA map pack names don't overlap anymore
* Fixed - game players don't overlap anymore

#### Version 1.4.0
* Added - confirmation on "unwatch all games" action.
* Added - Chrome support
* Added - Sort by game number option

### Version 1.3.3:
* Added - option to watch waiting games
* Fixed - script was not loading tab when you were watching game that has recently expired
* Fixed - script was not loading tab when there were no games being watched

#### Version 1.3.2:
* Added - ability to go back to watched tab itself when hitting "Back" button
* Added loading animation
* Added link on profile page to watch player's game
* Misc fix of the update mechanism

#### Version 1.3.1:
* Fixed - Watch tournament bug
* Fixed - Appearing the script menu when logged out
* Added "Uwatch all games" option in the menu

#### Version 1.3.0:
* Script menu added
* You can now follow tournament active games and players' active games
* Added version control system


#### Version 1.2.3:
* Bug fixing due to site changes
* Escaping apostrophe and quote characters in map names
* Fixed Cook players breaking the script

#### Version 1.2.2:
* Fixed 'watch' links not showing on game finder pages.
* Added ratings pages to excludes.

#### Version 1.2.1:
* Fixed beta maps overlay

#### Version 1.2:
* Major code rewrite (and I mean major)
* Changed the script to use CC API
* Games are now sorted by time (desc - so you see games with recent changes on top)

#### Version 1.1a, 1.1b:
* Bug fixing due to site changes

#### Version 1.1:
* Simple color coding for links (so you don't mess them with site actions)
* Added unwatch to 'watched games' tab (thanks to sherkaner for code snippet)
* Fixed bug to display watch/unwatch link inside the game below the players list

## Conquer Club - Team Spoils
Shows what spoils your teammates have!

## Conquer Club - Hangy Game History
Provides a visual display of the game log (history)
