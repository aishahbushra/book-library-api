module.exports = (sequelize, DataTypes) => {
  const schema = {
    email: {
      type: DataTypes.STRING,
      validate: {
        // allowNull: false,
        isEmail: {
          args: true,
          msg: "Valid email required",
        },
      }
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        allowNull: false
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        // allowNull: false,
        len: {
          args: [8],
          msg: "Password needs to be 8 characters or more"
        },
      }
    }
  };

  return sequelize.define('Reader', schema);
};
