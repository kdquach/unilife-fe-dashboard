import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone for display to Vietnam
const VN_TZ = 'Asia/Ho_Chi_Minh';

export const formatDateTime = (date) => (date ? dayjs(date).tz(VN_TZ).format('DD/MM/YYYY HH:mm') : '-');
export const formatDate = (date) => (date ? dayjs(date).tz(VN_TZ).format('DD/MM/YYYY') : '-');

export const normalizePhone = (value = '') => value.replace(/\s+/g, '').trim();
