import { useEffect } from 'react';

/**
 * Hook để quản lý notification nhắc họp trước 1 giờ
 * @param {Array} meetings - Danh sách cuộc họp
 * @param {String} userEmail - Email người dùng hiện tại
 * @param {Array} rooms - Danh sách phòng
 */
function useMeetingReminder(meetings = [], userEmail = null, rooms = []) {
  useEffect(() => {
    if (!userEmail || !Array.isArray(meetings)) return;

    // Yêu cầu permission thông báo
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const cleanups = [];

    meetings.forEach(meeting => {
      // Kiểm tra xem người dùng có tham gia cuộc họp này không
      const isParticipant = meeting.participantDetails?.some(
        p => p.user?.email === userEmail
      ) || meeting.organizer?.email === userEmail || meeting.secretary?.email === userEmail;

      if (!isParticipant) return;

      const meetingStart = new Date(meeting.startTime || meeting.start);
      const now = new Date();
      const timeUntilMeeting = meetingStart.getTime() - now.getTime();
      const oneHourMs = 60 * 60 * 1000;

      // Nếu cuộc họp bắt đầu trong 1 giờ tới và chưa bắt đầu
      if (timeUntilMeeting > 0 && timeUntilMeeting <= oneHourMs) {
        const room = rooms.find(r => r.id === meeting.roomId);
        const roomName = room?.name || meeting.roomId;
        const title = `🔔 Nhắc họp: ${meeting.title}`;
        const body = `Phòng ${roomName} - Bắt đầu lúc ${meetingStart.toLocaleTimeString('vi-VN')}`;

        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '📅' });
        }
      }

      // Schedule reminder nếu chưa tới 1 giờ
      if (timeUntilMeeting > oneHourMs) {
        const timeout = setTimeout(() => {
          const room = rooms.find(r => r.id === meeting.roomId);
          const roomName = room?.name || meeting.roomId;
          const title = `🔔 Nhắc họp: ${meeting.title}`;
          const body = `Phòng ${roomName} - Bắt đầu lúc ${meetingStart.toLocaleTimeString('vi-VN')}`;

          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '📅' });
          }
        }, timeUntilMeeting - oneHourMs);

        cleanups.push(() => clearTimeout(timeout));
      }
    });

    return () => cleanups.forEach(cleanup => cleanup());
  }, [meetings, userEmail, rooms]);
}

export default useMeetingReminder;
