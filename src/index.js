const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const compression = require("compression");
const path = require("path");

// Configurar variables de entorno
dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

connectDB().then(() => {
    // Habilitar compresión para mejorar el rendimiento
    app.use(compression());

    // Habilitar parser de json para el request body
    app.use(express.json())
  
    // Cache headers para respuestas dinámicas
    app.use((req, res, next) => {
      res.setHeader("Cache-Control", "public, no-store");
      next();
    });
  
    // Cache para archivos estáticos
    app.use(
      express.static(path.join(__dirname, "/public"), {
        maxAge: "1d", // Cache por 1 día
        etag: false,
      })
    );
  
    app.set('trust proxy', 1);
  
    // Set view engine
    app.set("view engine", "ejs");
  
    // Middleware de respuesta
    app.use((req, res, next) => {
      const originalSend = res.send;
  
      res.send = function (body) {
        if (
          typeof body === "object" &&
          !body.data &&
          !body.message &&
          !body.status
        ) {
          body = {
            data: body || null,
            message: res.message || "Success",
            status: res.statusCode || 200,
          };
        }
        originalSend.call(this, body);
      };
  
      next();
    });
  
    // Definir las rutas
    require("./routes/place")(app);

  
    // Error-handling middleware
    app.use((err, req, res, next) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          data: null,
          message: "Invalid request data",
          status: 400,
        });
      }
  
      // Error general del servidor
      console.error(err.stack);
      res.status(err.status || 500).send({
        data: null,
        message: err.message || "Internal Server Error",
        status: err.status || 500,
      });
    });
  
    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
  }).catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1); // Salir del proceso si la conexión a la base de datos falla
  });
  
  app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    console.log(`From IP: ${ip}`);
  
    next();
  });
  
  app.on("listening", function () {
    console.log(
      "Express server started on port %s at %s",
      app.address().port,
      app.address().address
    );
  });