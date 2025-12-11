const nodemailer = require('nodemailer');
const { format } = require('date-fns');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendMeetingInvitation(to, meetingData) {
    const startTime = format(new Date(meetingData.startTime), 'dd/MM/yyyy HH:mm');
    const endTime = format(new Date(meetingData.endTime), 'HH:mm');

    const mailOptions = {
      from: `"Meeting Room System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Lời mời họp: ${meetingData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Lời Mời Tham Dự Cuộc Họp</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h3>${meetingData.title}</h3>
            <p><strong>📅 Thời gian:</strong> ${startTime} - ${endTime}</p>
            <p><strong>📍 Phòng họp:</strong> ${meetingData.roomName}</p>
            <p><strong>👤 Chủ trì:</strong> ${meetingData.organizerName}</p>
            ${meetingData.secretaryName ? `<p><strong>📝 Thư ký:</strong> ${meetingData.secretaryName}</p>` : ''}
            ${meetingData.description ? `<p><strong>📋 Nội dung:</strong><br/>${meetingData.description}</p>` : ''}
          </div>
          <p style="margin-top: 20px; color: #666;">
            Cuộc họp này đã được thêm vào Google Calendar của bạn.
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMeetingUpdate(to, meetingData) {
    const startTime = format(new Date(meetingData.startTime), 'dd/MM/yyyy HH:mm');
    const endTime = format(new Date(meetingData.endTime), 'HH:mm');

    const mailOptions = {
      from: `"Meeting Room System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Cập nhật cuộc họp: ${meetingData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f57c00;">Thông Báo Cập Nhật Cuộc Họp</h2>
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px;">
            <h3>${meetingData.title}</h3>
            <p><strong>📅 Thời gian:</strong> ${startTime} - ${endTime}</p>
            <p><strong>📍 Phòng họp:</strong> ${meetingData.roomName}</p>
            <p><strong>👤 Chủ trì:</strong> ${meetingData.organizerName}</p>
            ${meetingData.description ? `<p><strong>📋 Nội dung:</strong><br/>${meetingData.description}</p>` : ''}
          </div>
          <p style="margin-top: 20px; color: #666;">
            Thông tin cuộc họp đã được cập nhật trong Google Calendar của bạn.
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMeetingCancellation(to, meetingData) {
    const mailOptions = {
      from: `"Meeting Room System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Hủy cuộc họp: ${meetingData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Thông Báo Hủy Cuộc Họp</h2>
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px;">
            <h3>${meetingData.title}</h3>
            <p>Cuộc họp đã bị hủy.</p>
            <p><strong>👤 Người hủy:</strong> ${meetingData.cancelledBy}</p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMinutesNotification(to, meetingData, minutesUrl) {
    const mailOptions = {
      from: `"Meeting Room System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Biên bản cuộc họp: ${meetingData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #388e3c;">Biên Bản Cuộc Họp</h2>
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px;">
            <h3>${meetingData.title}</h3>
            <p>Biên bản cuộc họp đã được cập nhật.</p>
            <p><a href="${minutesUrl}" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Xem biên bản</a></p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();