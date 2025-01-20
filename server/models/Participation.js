// models/Participation.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import Event from './Event.js';
import User from './User.js';

const Participation = sequelize.define('Participation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    }
  },
  checkInTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Define relationships
Participation.belongsTo(User, { foreignKey: 'userId' });
Participation.belongsTo(Event, { foreignKey: 'eventId' });
User.hasMany(Participation, { foreignKey: 'userId' });
Event.hasMany(Participation, { foreignKey: 'eventId' });

export default Participation;