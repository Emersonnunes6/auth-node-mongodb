require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  app.use(cors());
  next();
});

const User = require("./models/User");

app.get("/", (req, res) => {
  res.status(200).json({ msg: "API Gerenciamento Financeiro" });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Pá! Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(401).json({ msg: "Token invalido!" });
  }
}

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado." });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res
      .status(422)
      .json({ msg: "As credenciais não conferem, tente novamente." });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Logado com sucesso!", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Erro, tente novamente" });
  }
});

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado." });
  }

  res.status(200).json(user);
});

app.post("/auth/register", async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  if (!username) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  const userExists = await User.findOne({ username: username });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro nome." });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    email,
    password: passwordHash,
  });

  try {
    user.save();
    res.status(201).json({ msg: "Usuario criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Erro, tente novamente" });
  }
});

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const tokenDB = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.lyj5bgl.mongodb.net/`;

mongoose
  .connect(tokenDB)
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco!");
  })
  .catch((err) => {
    console.log(err);
    console.log("Erro ao conectar no banco.");
  });
