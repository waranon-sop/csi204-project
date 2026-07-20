export const addAdminNotification = async (user, action, target, type) => {
  try {
    const newNotif = {
      user: user || 'System',
      action: action,
      target: target,
      time: 'Just now',
      type: type || 'system',
      read: false
    };
    
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  } catch (e) {
    console.error('Failed to save notification', e);
  }
};
