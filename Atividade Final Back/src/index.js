const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

const JWT_SECRET = "your_secret_key";

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

require("./connection");

const Student = mongoose.model("student",{
    name: String,
    email: String,
    password: String,
    course: String,
});

// middleware para veririficar o token!

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).send({error: "Token não fornecido!"});
  };

  const token = authHeader.split(" ")[1];

  jwt.verify(token,JWT_SECRET,(err, user) => {
    if(err){
      return res.status(403).send({error: "Token inválido!"})
    };
    req.user = user;
    next();
  });
};

// Methods HTTP

// Router Post Student

app.post("/students", async(req, res) => {
  try {
    const {name, email, password, course} = req.body;

    const existingStudent = await Student.findOne({email});
    if(existingStudent){
      return res.status(400).send({error: "E-mail já cadastrado!"});
    };

    const hashPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashPassword,
      course
    });
  
    await student.save();
    return res.status(201).send({message: "Aluno criado com sucesso!", student});

  } catch (error) {
    res.status(500).send({error: "Erro ao criar aluno!"});
  };
});

// Router Read Student

app.get("/students", authenticateToken, async(req, res) => {
  try {
    const students = await Student.find();
    return res.send(students);
  } catch (error) {
    return res.status(500).send({error: "Error ao buscar alunos!"});
  };
});

// Routers Read By ID Student

app.get("/students/:id", authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send({ error: "Aluno não encontrado!" });
    }
    res.send(student);
  } catch (error) {
    res.status(500).send({ error: "Erro ao buscar aluno" });
  }
});

// Router Put Student

app.put("/students/:id", async(req, res) => {
  const studentId = await Student.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    course: req.body.course
  }, {
    new: true
  });

  return res.send(studentId);
});

// Router Delete Student

app.delete("/students/:id", async(req, res) => {
  const studentId = await Student.findByIdAndDelete(req.params.id);
  return res.send(studentId);
});

// Router Login Student

app.post("/login", async(req, res) => {
  try {
    const {email, password} = req.body;

    const students = await Student.findOne({ email });

    if(!students){
      return res.status(404).send({error: "Aluno não encontrado!"});
    };

    const isPasswordValid = await bcrypt.compare(password, students.password);
    if(!isPasswordValid){
      return res.status(401).send({error: "credenciais inválidas"});
    };

    const token = jwt.sign(
      {id: students._id, email: students.email},
      JWT_SECRET,
      {expiresIn: "1h"}
    );

    return res.send({message: "Login bem-sucedido", token});

  } catch (error) {
    return res.status(500).send({error: "error ao fazer o login"});
  };
});

