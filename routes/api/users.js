const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

router.post("/signup", bodyParser.urlencoded(), (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const newUser = new User({
        email: req.body.email,
        password: hash,
      });
      newUser
        .save()
        .then(() =>
          res.status(201).json({ message: "Utilisateur créé avec succès !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
});

router.post("/login", bodyParser.urlencoded(), (req, res) => {
  User.findOne({ email: req.body.email }, async (err, foundUser) => {
    if (err) {
      res.status(401).json({ message: err });
    } else {
      if (foundUser) {
        const validPassword = await bcrypt.compare(
          req.body.password,
          foundUser.password
        );
        if (validPassword) {
          const data = {
            time: Date(),
            userId: 12,
          };

          const token = jwt.sign(data, jwtSecretKey);

          res.status(201).json({ message: "Logged in", token: token });
        } else {
          res.status(401).json({ message: "Username or password incorrect" });
        }
      } else {
        res.status(401).json({ message: "Username or password incorrect" });
      }
    }
  });
});

router.get("/users", (req, res) => {
  const token = req.header("auth_app_token_id");

  if (!token) {
    res.status(401).json({ message: "Missing user token" });
  } else {
    const decodedToken = jwt.decode(token, { complete: true });
    if (decodedToken) {
      const verified = jwt.verify(token, jwtSecretKey);
      if (verified) {
        User.find({}).then((users) => {
          res.send(users);
        });
      } else {
        res.status(401).json({ message: "Access denied" });
      }
    } else {
      res.status(401).json({ message: "Invalid user token" });
    }
  }
});

module.exports = router;
