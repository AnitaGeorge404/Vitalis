import { useState, useEffect } from 'react';
import './FollowUpReminder.css';

/**
 * Follow-Up Reminder
 * Set reminders to recheck symptoms
 */
function FollowUpReminder({ onReminderSet }) {
  const [showOptions, setShowOptions] = useState(false);
  const [reminder, setReminder] = useState(null);
  const [notificationSupported, setNotificationSupported] = useState(false);

  useEffect(() => {
    // Check notification support
    if ('Notification' in window) {
      setNotificationSupported(true);
    }

    // Check for existing reminder
    const savedReminder = localStorage.getItem('followup_reminder');
    if (savedReminder) {
      const reminderData = JSON.parse(savedReminder);
      if (new Date(reminderData.time) > new Date()) {
        setReminder(reminderData);
      } else {
        localStorage.removeItem('followup_reminder');
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (notificationSupported && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const setReminderTime = async (hours) => {
    await requestNotificationPermission();

    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + hours);

    const reminderData = {
      time: reminderTime.toISOString(),
      label: hours < 24 
        ? `Recheck in ${hours} hour${hours > 1 ? 's' : ''}`
        : `Recheck tomorrow`
    };

    localStorage.setItem('followup_reminder', JSON.stringify(reminderData));
    setReminder(reminderData);
    setShowOptions(false);

    // Set up notification if supported
    if (notificationSupported && Notification.permission === 'granted') {
      const timeUntilReminder = reminderTime - new Date();
      setTimeout(() => {
        new Notification('Vitalis Health Reminder', {
          body: 'Time to recheck your symptoms',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }, timeUntilReminder);
    }

    if (onReminderSet) {
      onReminderSet(reminderData);
    }
  };

  const cancelReminder = () => {
    localStorage.removeItem('followup_reminder');
    setReminder(null);
  };

  const formatReminderTime = (isoTime) => {
    const time = new Date(isoTime);
    return time.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="followup-reminder">
      {!reminder ? (
        <div className="reminder-setup">
          <button 
            className="set-reminder-btn"
            onClick={() => setShowOptions(!showOptions)}
          >
            <span className="reminder-icon">⏰</span>
            Set Follow-Up Reminder
          </button>

          {showOptions && (
            <div className="reminder-options">
              <button onClick={() => setReminderTime(6)}>
                Recheck in 6 hours
              </button>
              <button onClick={() => setReminderTime(12)}>
                Recheck in 12 hours
              </button>
              <button onClick={() => setReminderTime(24)}>
                Recheck tomorrow
              </button>
              {!notificationSupported && (
                <p className="notification-warning">
                  ⚠️ Browser notifications not supported
                </p>
              )}
              {notificationSupported && Notification.permission === 'denied' && (
                <p className="notification-warning">
                  ⚠️ Notifications blocked. Enable in browser settings.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="reminder-active">
          <div className="reminder-info">
            <span className="reminder-icon">✓</span>
            <div className="reminder-text">
              <span className="reminder-label">{reminder.label}</span>
              <span className="reminder-time">{formatReminderTime(reminder.time)}</span>
            </div>
          </div>
          <button className="cancel-reminder-btn" onClick={cancelReminder}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default FollowUpReminder;
