import express from "express";
import { syncProspectContact } from "./Controller/syncProspectContact.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  syncProspectContact();
  res.send("Health is Ok");
});

export { app };
