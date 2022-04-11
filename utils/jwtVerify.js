const express = require('express');
const {jwtVerify} = require('./jwt');
const cookieParser = require("cookie-parser");

const jwtAuth = express.Router();
jwtAuth.use(cookieParser());

jwtAuth.use((req, res, next) => {
	const jwtToken = req.headers['authorization'] || ''
	//let token = jwtToken.replace('Bearer ', '');
	let token = req.cookies.token;
	
	//token = token.replace(/['"]+/g,'');
	
	if (token) {
		jwtVerify(token, (err, decoded) => {
			if (err) {
				return res.status(401).json({ message: err.message }).end();
			} else {
				req.jwtUser = decoded;
				next();
			}
		})
	} else {
		res.send({message: 'Token no proveída'});
	}
});

module.exports = {jwtAuth}