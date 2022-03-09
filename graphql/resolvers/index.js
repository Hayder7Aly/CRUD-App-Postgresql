const { UserInputError } = require("apollo-server");
const {User, Task} = require("../../Models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config");
const { Op } = require("sequelize");
const authorization = require("../../utils/authorization");

module.exports = {
  Query: {
    getAllUsers: async (_, __, { req }) => {
      const loggedUser = await authorization(req);
      let users = await User.findAll({
        where: {
          id: {
            [Op.ne]: loggedUser.id,
          },
        },
      });

      const tasks = await Task.findAll({
          include:[{
              model: User,
              as: "user",
              attributes: ["id"]
          }]
      })

      console.log("tasks -----------------------------> ", tasks);


      users = users.map(user => {
          const userTasks = tasks.filter(task => task.user.id === user.id)
          user.tasks = userTasks
          return user
      })

      return users;
    },

    getUserTasks: async (_,{id},{req}) => {
        const loggedUser = await authorization(req)
        const tasks = await Task.findAll({
            where: {
                userId: id
            }
        })

        return tasks
    },

    getInitialTasks: async (_,__, {req}) => {
        const loggedUser = await authorization(req)
        const tasks = await Task.findAll({
            include: {
                model: User,
                as: "user",
                attributes: ["username", "id"]
            },
            limit: 10,
            order: [["createdAt", "DESC"]],


        })

        return tasks
    }
  },
  Mutation: {
    registerUser: async (_, { input }) => {
      const { username, password } = input;
      if (username.trim() === "" || password.trim() === "") {
        throw new UserInputError("Values are not be Null or empty !");
      }

      const ifAlreadyExists = await User.findOne({ where: { username } });

      if (ifAlreadyExists) {
        throw new UserInputError(
          `User already take of this '${username}' name`
        );
      }

      const hashPassword = await bcrypt.hash(password, 8);
      const user = new User({ username, password: hashPassword });
      await user.save();
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET
      );
      return {
        username: user.username,
        token,
      };
    },

    login: async (_, { input }) => {
      const { username, password } = input;
      if (username.trim() === "" || password.trim() === "") {
        throw new UserInputError("Values are not be Null or empty !");
      }

      const findUser = await User.findOne({ where: { username } });
      if (!findUser) {
        throw new UserInputError(
          `There is no user of this username : '${username}'`
        );
      }

      const isMatch = await bcrypt.compare(password, findUser.password);
      if (!isMatch) {
        throw new UserInputError(`Incorrect Password !`);
      }

      const token = jwt.sign(
        { username: findUser.username, id: findUser.id },
        JWT_SECRET
      );

      return {
        username: findUser.username,
        token,
      };
    },

    addTask: async (_, {input}, {req}) => {
        const loggedUser = await authorization(req)
        if(input.title.trim()  === "" || input.body.trim() === "") throw new UserInputError(`Empty values are not allowed !`)
        const task = new Task({...input, userId: loggedUser.id})
        await task.save()
        return task
    },

    deleteTask: async(_, {id}, {req}) => {
        const loggedUser = await authorization(req)
        const ifTaskExist = await Task.findOne({where : {id}})
        if(!ifTaskExist) throw new UserInputError(`Task is not exist of this id "${id}"`)
        if(!(ifTaskExist.userId === loggedUser.id)) throw new UserInputError(`Unauthorized to Delete this Task !`)
        await ifTaskExist.destroy()

        return "Deleted Task Successfully !"
    }
  },
};
