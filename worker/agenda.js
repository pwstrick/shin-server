/*
 * @Author: strick
 * @Date: 2021-02-03 14:34:44
 * @LastEditTime: 2021-02-03 14:51:59
 * @LastEditors: strick
 * @Description: 
 * @FilePath: /strick/shin-server/worker/agenda.js
 */
import Agenda from 'agenda';
import mongodb from '../db/mongodb';
const connectionOpts = {
  mongo: mongodb.connection,
};

const agenda = new Agenda(connectionOpts);
module.exports = agenda;
