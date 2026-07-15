export const addAdminNotification = (user, action, target, type) => {
  try {
    const existing = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    const newNotif = {
      id: Date.now(),
      user: user || 'System',
      action: action,
      target: target,
      time: 'Just now',
      type: type || 'system',
      read: false
    };
    const updated = [newNotif, ...existing];
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification', e);
  }
};
