import moment from 'moment';

/**
 * 日期格式
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).format(format);
}