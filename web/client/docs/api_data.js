define({ "api": [
  {
    "type": "get",
    "url": "/message/:id",
    "title": "Get message from ID",
    "group": "Message",
    "version": "1.0.0",
    "description": "<p>Gets a single message based on message ID</p>",
    "sampleRequest": [
      {
        "url": "https://usn.herokuapp.com/v1/message/navadmin16123"
      }
    ],
    "filename": "web/message.js",
    "groupTitle": "Message",
    "name": "GetMessageId"
  },
  {
    "type": "get",
    "url": "/message/navadmin/:year/:number",
    "title": "Get message from year and number",
    "group": "Message",
    "version": "1.0.0",
    "description": "<p>Gets a single message based on message year and number</p>",
    "sampleRequest": [
      {
        "url": "https://usn.herokuapp.com/v1/message/navadmin/15/213"
      }
    ],
    "filename": "web/message.js",
    "groupTitle": "Message",
    "name": "GetMessageNavadminYearNumber"
  },
  {
    "type": "get",
    "url": "/messages/:year",
    "title": "Get messages data for a given year",
    "group": "Messages",
    "version": "1.0.0",
    "description": "<p>Gets a list of message data for a given year</p>",
    "sampleRequest": [
      {
        "url": "https://usn.herokuapp.com/v1/messages/16"
      }
    ],
    "filename": "web/messages.js",
    "groupTitle": "Messages",
    "name": "GetMessagesYear"
  }
] });
