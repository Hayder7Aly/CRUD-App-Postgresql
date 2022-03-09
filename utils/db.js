const {sequelize} = require("../Models")
const connectToDB = () => {
    try {
        sequelize.authenticate()
        sequelize.sync()
        console.log("Successfully Connect with Database !");
    }catch(e){
        console.log("Error : ", e);

    }
}

module.exports = connectToDB
