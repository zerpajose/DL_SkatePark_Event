const jwt = require('jsonwebtoken');
const KEY = "misecretkey";

const jwtVerify = (token,cb) => {
    //console.log(`Token before: ${token}`);
    jwt.verify(token, KEY,(err,decoded) => {
        //console.log("jwtVerify: " + err);
        cb(err,decoded);
    });
}

const jwtSign = ({email, password, admin}) => {
    const payload = {email, password,admin,};
    return jwt.sign(payload, KEY);
}

module.exports = {
    jwtVerify,
    jwtSign
}