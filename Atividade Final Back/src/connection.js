const mongoose = require("mongoose");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const connect = () => {

    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@dbfinal.zv0m1.mongodb.net/?retryWrites=true&w=majority&appName=DBFinal`,
        {tlsAllowInvalidCertificates: true},
    );

    const connection = mongoose.connection;

    connection.on("error", () => {
        console.log("Erro ao conectar com o mongoDB");
    });

    connection.on("open", () => {
        console.log("Conectado ao mongoDB com sucesso!");
    });
};

connect();
module.exports = mongoose;

