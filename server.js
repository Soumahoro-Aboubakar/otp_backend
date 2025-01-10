import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./route/opt.route.js";


dotenv.config();
const app = express();

const corsOption = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
//app.use(cors())
// convert all data from client in json data
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log(" successfully connected to mongo-db");
  })  
  .catch((error) => {   
    console.log(error.message);
  });

app.use("/api/auth", authRoute);


app.listen(process.env.PORT, () => {
  console.log(`Serveur en cours d\'exécution sur le port ${process.env.PORT}`);
});
        