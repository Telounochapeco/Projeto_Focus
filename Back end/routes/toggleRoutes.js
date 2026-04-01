const express = require("express");
const router = express.Router();

let statusBloqueador = false;

router.get("/status", (req, res) => {
  res.json({ ativo: statusBloqueador });
});

router.post("/toggle", (req, res) => {
  statusBloqueador = !statusBloqueador;
  console.log("Bloqueador:", statusBloqueador);
  res.json({ ativo: statusBloqueador });
});

module.exports = router;