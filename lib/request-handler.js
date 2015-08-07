var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var Q = require('q');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  var findAll = Q.nbind(Link.find, Link);
  findAll({})
    .then(function (links) {
      res.json(links);
    })
    .fail(function (error) {
      next(error);
    });
};

exports.saveLink = function(req, res) {
  var url = req.body.url;

  if (!util.isValidUrl(url)) {
    console.log('Not a valid url: ', url);
    return res.send(404);
  }

  var createLink = Q.nbind(Link.create, Link);
  var findLink = Q.nbind(Link.findOne, Link);

  findLink({url: url})
    .then(function (match) {
      if (match) {
        res.send(match);
      } else {
        return  util.getUrlTitle(url);
      }
    })
    .then(function (title) {
      if (title) {
        var newLink = {
          url: url,
          visits: 0,
          base_url: req.headers.origin,
          title: title
        };
        return createLink(newLink);
      }
    })
    .then(function (createdLink) {
      if (createdLink) {
        res.json(createdLink);
      }
    })
    .fail(function (error) {
      next(error);
    });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var findUser = Q.nbind(User.findOne, User);
  findUser({username: username})
    .then(function (user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePasswords(password).
        then(function(foundUser) {
          util.createSession(req, res, foundUser);
        }).fail( function() {
            res.redirect('/login');
          });
        }
      })

};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var findOne = Q.nbind(User.findOne, User);

  // check to see if user already exists
  findOne({username: username})
    .then(function(user) {
      if (user) {
        console.log('Account already exists');
        res.redirect('/signup');
      } else {
        // make a new user if not one
        create = Q.nbind(User.create, User);
        newUser = {
          username: username,
          password: password
        };
        return create(newUser);
      }
    })
    .then(function (user) {
      // create token to send back for auth
      util.createSession(req, res, newUser);
    })
    .fail(function (error) {
      next(error);
    });
};

exports.navToLink = function(req, res) {
  var findLink = Q.nbind(Link.findOne, Link);
  findLink({code: req.params[0]})
    .then(function (link) {
      if (link) {
        link.visits++;
        link.save(function (err, savedLink) {
          if (err) {
            next(err);
          } else {
            res.redirect(savedLink.url);
          }
        })
      } else {
        res.redirect('/');
      }
    })
    .fail(function (error) {
      next(error);
    });
  };
