/**
 * Utility để tạo link Google Calendar thủ công
 */

function toUTCGCalDate(date) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

export function buildGoogleCalendarLink(meeting, room) {
  if (!meeting || !meeting.startTime) return '';

  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);
  
  const title = encodeURIComponent(meeting.title);
  const dates = `${toUTCGCalDate(startDate)}/${toUTCGCalDate(endDate)}`;
  const location = encodeURIComponent(room ? `${room.name} - ${room.location}` : 'Meeting');
  
  const details = encodeURIComponent(
    `Title: ${meeting.title}\n` +
    `Room: ${room?.name || 'N/A'}\n` +
    `Organizer: ${meeting.organizer?.name || 'N/A'}\n` +
    `Secretary: ${meeting.secretary?.name || 'N/A'}\n` +
    `Documents: ${(meeting.documentsUrls || []).join(', ') || 'None'}\n` +
    `Description: ${meeting.description || 'N/A'}`
  );
  
  return `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&dates=${dates}&location=${location}&details=${details}`;
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Đã sao chép link vào clipboard!');
  }).catch(err => {
    console.error('Copy error:', err);
    alert('Lỗi khi sao chép link');
  });
}
