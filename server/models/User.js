import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('eventOrganizer', 'participant'),
    allowNull: false,
    defaultValue: 'participant',
  },
}, {
  timestamps: true,
});

export default User;