module.exports = (sequelize, DataTypes) => {
    const schema = {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        genre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ISBN: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [4],
                    msg: "ISBN must be 4 characters or longer"
                }
            },
        }
    };

    return sequelize.define('Book', schema);
};