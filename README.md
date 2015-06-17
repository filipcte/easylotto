EasyLotto - Node.js lottery software
=====

This is a small lottery management app that enables anyone to host their own lottery and have a nice real-life event to do the drawings and determine winners. 

It's built with **Node.js + Express + Mongoose** and it was our (**filipcte** and **dani-z**) first Node project, so there are already many things I would rearchitect in terms of the MVC-like architecture. But hey, it works neatly! :)

## Features
	
* Create and manage any number of lotteries
* Manually add/remove sold tickets (tickets are identified by Color (blue, yellow, green, white, pink), Letter (A-Z) and Number (1-100))
* A drawing screen that draws tickets randomly and shows them on screen
* Mouse click to do another draw

## Ideas for new features

* Add a public side to each lottery to sell tickets, automating that process
* On the public side, show drawings in real-time to potential watchers
* Implement the whole SaaS thing, starting with a marketing site and signup/signin functionality (which is actually partially done)

## Dependencies

* Mongodb

## Install

1. Clone repository
`$ git clone git@github.com:filipcte/easylotto.git easylotto`

2. Install dependencies
```
$ cd easylotto
$ npm install
$ (sudo) npm install -g bower
$ bower install
$ npm install -g grunt-cli
```

3. Run Grunt (just SASS-to-CSS compiling for now)
`$ grunt comp`

4. Start Mongodb
`$ sudo mongod` (on OS X at least)

5. Start node.js server
`$ node server.js`

6. Open app in the browser
`http://localhost:3000/admin/`