import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config(dotenv.config({ path: './config.env' }));

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  port: process.env.DB_PORT,
  dialect: 'postgres'
});

export default sequelize;