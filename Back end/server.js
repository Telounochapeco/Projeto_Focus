const express = require("express");
const cors = require("cors");
const routes = require("./routes/toggleRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Backend FocusFlow rodando" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});