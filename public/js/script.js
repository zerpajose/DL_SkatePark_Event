let url = "http://localhost:3000/";

//index.html
let skaters = [];
let tbody = document.getElementById("cuerpo");

async function getData(a) {
  await axios.get(`${url}skaters`).then((data) => {
    
    skaters = data.data;

    tbody.innerHTML = "";

    skaters.forEach((p, i) => {
      let estado;
      if(a){
        if(p.estado){
          estado = `<input type="checkbox" id="estado" name="estado" value="${p.email}" checked onclick="cambioEstado(event)"></input>`
        }
        else{
          estado = `<input type="checkbox" id="estado" name="estado" value="${p.email}" onclick="cambioEstado(event)"></input>`
        }
      }
      else{
        if(p.estado){
          estado = `<td class="approved">Aprobado</td>`;
        }
        else{
          estado = `<td class="revision">En Revision</td>`;
        }
      }
      

      tbody.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td><img style="object-fit: cover; width: 100px; height: 100px;" src="img/${p.foto}" alt="${p.nombre}"></img></td>
          <td>${p.nombre}</td>
          <td>${p.anos_experiencia}</td>
          <td>${p.especialidad}</td>
          <td>${estado}</td>
        </tr>
      `;
    });
  });
}

//Registro.html

async function nuevoSkater(){
  let alert_msg = document.getElementById("msg");

  let email = document.getElementById("email");
  let nombre = document.getElementById("nombre");
  let password = document.getElementById("password");
  let rep_password = document.getElementById("rep_password");
  let anos_experiencia = document.getElementById("anos_experiencia");
  let especialidad = document.getElementById("especialidad");
  let foto = document.getElementById("foto");

  if(email.value == "" || nombre.value == "" || password.value == "" || rep_password.value == "" || anos_experiencia.value == "" || especialidad.value == "" || foto.value == ""){
    alert_msg.innerHTML = "Algun campo vacío";
    alert_msg.style.display = "block";

    setTimeout(function(){
      alert_msg.style.display = "none";
    }, 5000);  
  }
  else{
    if(verifyRepeatPass(password.value, rep_password.value)){
      let formData = new FormData();

      formData.append("email", email.value);
      formData.append("nombre", nombre.value);
      formData.append("password", password.value);
      formData.append("anos_experiencia", anos_experiencia.value);
      formData.append("especialidad", especialidad.value);
      formData.append("foto", foto.files[0]);

      await axios.post(`${url}skater`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      }).then(()=> window.location.href = '/');
    }
    else{
      alert_msg.innerHTML = "Deben coincidir los campos de password";
      alert_msg.style.display = "block";
      setTimeout(function(){
        alert_msg.style.display = "none";
      }, 5000); 
    }
  }
}

// login.html

async function login(e){
  e.preventDefault();

  let email = document.getElementById("email");
  let password = document.getElementById("password");

  let formData = new FormData();

  formData.append("email", email.value);
  formData.append("password", password.value);
  
  await axios.post(`${url}login`, formData).then((r) => {

    let alert_msg = document.getElementById("msg");

    let id_msg = r.data.id_msg;
    let admin = r.data.admin;

    if(admin){
      window.location.replace("/admin");
    }
    else{
      if(id_msg == "datos_incorrectos"){
        let msg = r.data.msg;
        alert_msg.innerHTML = msg;
        alert_msg.style.display = "block";
        setTimeout(function(){
          alert_msg.style.display = "none";
        }, 5000); 
      }
      else{
        cargarEdit();
      }
    }
  });
}

async function cargarEdit(){
  await axios.get(`${url}edit`).then(window.location.href = '/edit');
}

async function editSkater(){

  let nombre = document.getElementById("nombre");
  let password = document.getElementById("password");
  let rep_password = document.getElementById("rep_password");
  let anos_experiencia = document.getElementById("anos_experiencia");
  let especialidad = document.getElementById("especialidad");
  let alert_msg = document.getElementById("msg");

  let formData = new FormData();
  formData.append("nombre", nombre.value);
  formData.append("password", password.value);
  formData.append("anos_experiencia", anos_experiencia.value);
  formData.append("especialidad", especialidad.value);

  if(nombre.value == "" || password.value == "" || rep_password.value == "" || anos_experiencia.value == "" || especialidad.value == ""){
    alert_msg.innerHTML = "Algun campo vacio";
    alert_msg.style.display = "block";
    setTimeout(function(){
      alert_msg.style.display = "none";
    }, 5000); 
    console.log(`Campo Vacio`);
  }
  else{
    if(verifyRepeatPass(password.value, rep_password.value)){
      await axios.put(`${url}edit`, formData).then(()=> window.location.href = '/');
    }
    else{
      alert_msg.innerHTML = "Deben coincidir los campos de password";
      alert_msg.style.display = "block";
      setTimeout(function(){
        alert_msg.style.display = "none";
      }, 5000); 
      console.log(`Deben coincidir los campos de password`);
    }
  }
}

async function deleteSkater(){

  await axios.delete(`${url}skater`).then((r)=> {
    window.location.href = '/'
  });
}

function verifyRepeatPass(pass, reppass){
  if(pass == reppass){
    return true;
  }
  else{
    return false;
  }
}

async function cambioEstado(e){
  
  let formData = new FormData();
  formData.append("email", e.target.value);
  formData.append("checked", e.target.checked);

  await axios.put(`${url}estado`, formData).then(()=> window.location.href = '/admin');
}