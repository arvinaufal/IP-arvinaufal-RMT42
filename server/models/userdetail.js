'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserDetail.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  UserDetail.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: `User is required!`
        },
        notNull: {
          msg: `User is required!`
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: `Name is required!`
        },
        notNull: {
          msg: `Name is required!`
        }
      }
    },
    inumber: DataTypes.STRING,
    address: DataTypes.TEXT,
    gender: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserDetail',
  });

  UserDetail.beforeCreate((user) => {
    console.log(user);
    let inumber = 'M-';
    inumber += new Date().getFullYear() + `-`;
    inumber += user.userId + '-';
    user.gender ? inumber += 'F-' : inumber += 'M-';
    inumber += 'IPUSTAKA'
    user.inumber = inumber;
  });
  return UserDetail;
};