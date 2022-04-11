const {Pool} = require("pg");

const pool = new Pool({
    user: "postgres" ,
    host: "localhost" ,
    password: "1a11aaaa" ,
    database: "skatepark" ,
    port: 5432 ,
});

async function nuevoSkater(email, nombre, password, anos_experiencia, especialidad, foto){
    try{
        const result = await pool.query(
        `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado, admin)
        VALUES (
            '${email}',
            '${nombre}',
            '${password}',
            ${anos_experiencia},
            '${especialidad}',
            '${foto}',
            false,
            false
        )
        RETURNING *`);
        return result.rows;
    }catch (e) {
        console.log(e);
        return e;
    }
}

async function getSkaters(){
    try{
        const result = await pool.query(`SELECT * FROM skaters WHERE admin = false`);
        return result.rows;
    } 
    catch(e){
        return e;
    }
} 

async function getSkater(email){
    try{
        const result = await pool.query(`
            SELECT email, nombre, anos_experiencia, especialidad FROM skaters WHERE email='${email}'
        `);
        return result.rows;
    } 
    catch(e){
        return e;
    }
} 

async function getLogin(email){
    try{
        const result = await pool.query(`SELECT password, admin FROM skaters WHERE email='${email}'`);
        return result.rows;
    } 
    catch(e){
        return e;
    }
}

async function getEmail(email){
    try{
        const result = await pool.query(`SELECT COUNT(*) FROM skaters WHERE email='${email}'`);
        return result.rows;
    } 
    catch(e){
        return e;
    }
}

async function editSkater (email, nombre, password, anos_experiencia, especialidad) {
    try {
        const res = await pool.query(
        `UPDATE skaters SET
            nombre = '${nombre}',
            password = '${password}',
            anos_experiencia = ${anos_experiencia},
            especialidad= '${especialidad}'
        WHERE email =  '${email}'  RETURNING *`
        );
        return res.rows;
    } catch (e) {
        console .log(e);
    }
} 

async function deleteSkater (email) {
    try {
        const result = await pool.query( `DELETE FROM skaters WHERE email='${email}' RETURNING *` );

        const dele = {
            count: result.rowCount,
            foto: result.rows[0].foto
        }

        return dele;

    } catch (e) {
        return e;
    }
}

async function cambiarEstado(email, checked){
    try {
        const res = await pool.query(
        `UPDATE skaters SET
            estado='${checked}'
        WHERE email = '${email}'  RETURNING *`
        );
        return res.rows;
    } catch (e) {
        console .log(e);
    }
} 

module.exports = {nuevoSkater, getSkaters, getLogin, getEmail, getSkater, editSkater, deleteSkater, cambiarEstado};
