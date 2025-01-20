import { DataTypes } from 'sequelize';
import User from './User.js';
import sequelize from '../database/database.js';

const EventGroup = sequelize.define('EventGroup', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

//an event group belongs to an organizer
EventGroup.belongsTo(User, { foreignKey: 'organizerId' });
// and organizer has many eventgroups
User.hasMany(EventGroup, { foreignKey: 'organizerId' });

export default EventGroup;