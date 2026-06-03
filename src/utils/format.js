import dayjs from 'dayjs';

export const formatDateTime = (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-');
export const formatDate = (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-');

export const normalizePhone = (value = '') => value.replace(/\s+/g, '').trim();
