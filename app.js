const express = require ( "express" );
const expressFileUpload = require('express-fileupload');
const fs = require("fs");
const bodyParser = require ("body-parser");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { engine } = require("express-handlebars");
const bcrypt = require('bcryptjs');
const {jwtSign} = require('./utils/jwt');
const {jwtAuth} = require('./utils/jwtVerify');

// gestion de cookies para el login
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

const {nuevoSkater, getSkaters, getLogin, getEmail, getSkater, editSkater, deleteSkater, cambiarEstado} = require('./consultas.js');

app.listen(3000, ()=>{
  console.log(`Server running on port 3000`);
});

app.set("view engine", "handlebars");

app.engine("handlebars", engine({
  layoutsDir: __dirname + "/views",
  partialsDir: [
    __dirname + "/views/components/",
    __dirname + "/views/partials/" 
  ],})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: '50mb',
  extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressFileUpload(
  {
      limits: { fileSize: 5242880 }, // 5120 kb
      abortOnLimit: true,
      responseOnLimit: `<a href="/">Volver</a><p>El peso del archivo que intentas subir supera el limite permitido de 5mb</p>`,
  })
);

app.get( "/" ,  (req, res) => {
  res.render("Inicio", {
    layout: "Inicio",
  });
});

app.get( "/skaters" , async (req, res) => {
  const respuesta = await getSkaters();
  res.send(respuesta);
});

app.get( "/skater" , async (req, res) => {
  res.render("Registro", {
    layout: "Registro",
    edit: false,
  });
});

app.post( "/skater" , async (req, res) => {

  const nuevo_skater = req.body;

  let hash = encriptarPass(nuevo_skater.password);

  const foto = req.files.foto;

  const mime = foto.mimetype;
    
  const arrSplit = mime.split("/");

  const nombre_skater = nuevo_skater.nombre;

  const nombre_foto = `${nombre_skater.replace(/ /g, "").toLowerCase()}${uuidv4().slice(0, 8)}.png`;

  let email_existe = await getEmail(nuevo_skater.email);
  
  if(arrSplit[0] != "image"){
    res.end(`
      <a href="/">Volver</a>
      <p>Tipo de archivo no permitido, se permiten solo imagenes</p>
    `);
  }
  else if(email_existe[0].count != 0){
    res.end(`
      <a href="/">Volver</a>
      <p>El email ingresado ya esta registrado</p>
    `);
  }
  else{
    foto.mv(`${__dirname}/public/img/${nombre_foto}`, (err) => {
      if(err) console.log(err);
    });

    await nuevoSkater(nuevo_skater.email, nuevo_skater.nombre, hash, nuevo_skater.anos_experiencia, nuevo_skater.especialidad, nombre_foto);
  }
  res.end();
});

app.get( "/login" , async (req, res) => {
  res.render("Login", {
    layout: "Login",
  });
});

app.post( "/login", async (req, res) => {

  let get_email = await getEmail(req.body.email);

  if(get_email[0].count == 1){
    let hashed_password = await getLogin(req.body.email); 
    let compared = bcrypt.compareSync(req.body.password, hashed_password[0].password);
    let email = req.body.email;
    let password = hashed_password[0].password;
    let admin = hashed_password[0].admin;

    if(compared){
      const token = jwtSign({email, password, admin});
      
      res.cookie('token', token, {
        maxAge: 3600000, // 1 hour
      });
      
      if(admin){
        res.json({
          token: token,
          id_msg: "datos_correctos",
          admin: true
        });
        res.end();
      }
      else{
        res.json({
          token: token,
          id_msg: "datos_correctos",
          admin: false
        });
        res.end();
      }
    }
    else{
      res.json({
        msg: "Alguno de los datos que ingresaste es incorrecto",
        id_msg: "datos_incorrectos"
      });
    }
    res.end();
  }
  else{
    res.json({
      msg:"Alguno de los datos que ingresaste es incorrecto",
      id_msg: "datos_incorrectos"
    });
  }
  res.end();
});

app.get("/edit", jwtAuth, async (req, res) => {
  const skaterData = await getSkater(req.jwtUser.email);

  res.render("Registro", {
    layout: "Registro",
    edit: true,
    skaterData: skaterData[0],
    login: true,
  });
});

app.put("/edit", jwtAuth, async (req, res) => {
  const { nombre, password, anos_experiencia, especialidad } = req.body;

  let hash = encriptarPass(password);

  const respuesta = await editSkater(req.jwtUser.email, nombre, hash, anos_experiencia, especialidad);
  
  res.json({
    msg: respuesta,
    id_msg: "updated"
  });
});

app.delete("/skater", jwtAuth, async (req, res) => {
    
  const resp = await deleteSkater(req.jwtUser.email);

  fs.unlink(`${__dirname}/public/img/${resp.foto}`, (err) => {
    if(err) console.log(`error al eliminar foto`);
  });
  
  if(resp.count > 0){
    res.json({
      msg: `El skater con email ${req.jwtUser.email} fue eliminado con éxito`,
      id_msg: `delete_success`
    });
  }
  else{
    res.json({
      msg: `Error al eliminar el skater`,
      id_msg: `delete_error`
    });
  }
});

app.get("/admin", jwtAuth, async (req, res) => {
  const skaterData = await getSkater(req.jwtUser.email);

  if(req.jwtUser.admin){
    res.render("Inicio", {
      layout: "Inicio",
      admin: true,
      login: true,
    });
  }
  else{
    res.json({
      msg: `Usuario con acceso no autorizado`,
      id_msg: `admin_error`,
      admin: false,
    });
  }
});

app.put("/estado", jwtAuth, async (req, res) => {

  const { email, checked } = req.body;

  if(req.jwtUser.admin){
    const respuesta = await cambiarEstado(email, checked);
    res.json({
      msg: respuesta,
      id_msg: "estado_updated"
    });
  }
  else{
    res.json({
      msg: `Usuario con acceso no autorizado`,
      id_msg: `admin_error`,
      admin: false,
    });
  }
});

app.get("/logout", jwtAuth, async (req, res) => {
  res.clearCookie('token');

  res.render("Inicio", {
    layout: "Inicio",
  });
});

function encriptarPass(pass){
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(pass, salt);
  return hash;
}