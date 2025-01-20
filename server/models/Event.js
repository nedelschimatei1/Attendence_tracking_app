import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import EventGroup from './EventGroup.js';

const Event = sequelize.define('Event', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.ENUM('CLOSED', 'OPEN'),
    defaultValue: 'CLOSED',
  },
  accessCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
}, {
  timestamps: true,
});

//an event belongs to an event group
Event.belongsTo(EventGroup, { foreignKey: 'groupId' });
// an event group has many events
EventGroup.hasMany(Event, { foreignKey: 'groupId' });

export default Event;