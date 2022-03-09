const { AuthenticationError } = require("apollo-server")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config")


module.exports = async(req) => {
    try {
        
        if(!req.headers.authorization) throw new AuthenticationError("UnAuthorization !")
        const token = req.headers.authorization
        const user =  jwt.verify(token, JWT_SECRET)
        return user

    }catch(e){
        throw new AuthenticationError("UnAuthorization !")
    }
}