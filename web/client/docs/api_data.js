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
    "group": "NAVADMIN",
    "version": "1.0.0",
    "description": "<p>Gets a single message based on message year and number</p>",
    "sampleRequest": [
      {
        "url": "https://usn.herokuapp.com/v1/message/navadmin/15/213"
      }
    ],
    "filename": "web/message.js",
    "groupTitle": "NAVADMIN",
    "name": "GetMessageNavadminYearNumber"
  },
  {
    "type": "get",
    "url": "/messages/navadmin/:year",
    "title": "Get messages data for a given year",
    "group": "NAVADMIN",
    "version": "1.0.0",
    "description": "<p>Gets a list of message data for a given year</p>",
    "sampleRequest": [
      {
        "url": "https://usn.herokuapp.com/v1/messages/navadmin/16"
      }
    ],
    "filename": "web/messages.js",
    "groupTitle": "NAVADMIN",
    "name": "GetMessagesNavadminYear"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "web/client/docs/main.js",
    "group": "_home_vagrant_appdev_navy_search_api_web_client_docs_main_js",
    "groupTitle": "_home_vagrant_appdev_navy_search_api_web_client_docs_main_js",
    "name": ""
  }
] });
