import Event from '../models/Event.js';
import sequelize from '../database/database.js';
import { Op} from 'sequelize';

const updateEventStates = async () => {
  const now = new Date();

  try {
    await Event.update({ state: 'OPEN' }, {
      where: {
        startTime: { [Op.lte]: now },
        state: 'CLOSED',
      },
    });

    await Event.update({ state: 'CLOSED' }, {
      where: {
        state: 'OPEN',
        [Op.and]: sequelize.literal(`"startTime" + ("duration" * INTERVAL '1 minute') <= NOW()`),
      },
    });
  } catch (error) {
    console.error('Error updating event states:', error);
  }
};

setInterval(updateEventStates, 30000);

export default updateEventStates;