export const USER_ROLES = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Counter Staff', value: 'COUNTER_STAFF' },
  { label: 'Kitchen Staff', value: 'KITCHEN_STAFF' },
  { label: 'Customer', value: 'CUSTOMER' },
];

export const roleLabels = USER_ROLES.reduce((acc, role) => {
  acc[role.value] = role.label;
  return acc;
}, {});

export const roleColors = {
  ADMIN: 'red',
  MANAGER: 'orange',
  COUNTER_STAFF: 'blue',
  KITCHEN_STAFF: 'purple',
  CUSTOMER: 'green',
};
