const { google } = require('googleapis');

class GoogleService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive.file'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async getUserInfo(accessToken) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
  }

  async createCalendarEvent(accessToken, refreshToken, eventData) {
    this.oauth2Client.setCredentials({ 
      access_token: accessToken,
      refresh_token: refreshToken 
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      attendees: eventData.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all'
    });

    return response.data;
  }

  async updateCalendarEvent(accessToken, refreshToken, eventId, eventData) {
    this.oauth2Client.setCredentials({ 
      access_token: accessToken,
      refresh_token: refreshToken 
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      attendees: eventData.attendees || [],
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
      sendUpdates: 'all'
    });

    return response.data;
  }

  async deleteCalendarEvent(accessToken, refreshToken, eventId) {
    this.oauth2Client.setCredentials({ 
      access_token: accessToken,
      refresh_token: refreshToken 
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all'
    });
  }

  async uploadToDrive(accessToken, refreshToken, fileData) {
    this.oauth2Client.setCredentials({ 
      access_token: accessToken,
      refresh_token: refreshToken 
    });

    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    const fileMetadata = {
      name: fileData.name,
      parents: fileData.folderId ? [fileData.folderId] : []
    };

    const media = {
      mimeType: fileData.mimeType,
      body: fileData.stream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    // Make file accessible to anyone with link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return response.data;
  }
}

module.exports = new GoogleService();