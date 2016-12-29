define({ "api": [
  {
    "type": "get",
    "url": "/message/ALNAV/:year/:number",
    "title": "Get message from year and number",
    "group": "ALNAV",
    "version": "1.0.0",
    "description": "<p>Gets a single message based on message year and number</p>",
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/message/ALNAV/16/042"
      }
    ],
    "filename": "web/routes/message.js",
    "groupTitle": "ALNAV",
    "name": "GetMessageAlnavYearNumber"
  },
  {
    "type": "get",
    "url": "/messages/ALNAV/:year",
    "title": "Get messages data for a given year",
    "group": "ALNAV",
    "version": "1.0.0",
    "description": "<p>Gets a list of message data for a given year</p>",
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/messages/ALNAV/16"
      }
    ],
    "filename": "web/routes/messages.js",
    "groupTitle": "ALNAV",
    "name": "GetMessagesAlnavYear"
  },
  {
    "type": "get",
    "url": "/message",
    "title": "Get message",
    "group": "Message",
    "version": "1.0.0",
    "description": "<p>Gets a single message via attribute query</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"NAVADMIN\"",
              "\"ALNAV\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Message type</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "2",
            "optional": false,
            "field": "year",
            "description": "<p>Year in YY format (15, 16, etc...)</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "size": "3",
            "optional": false,
            "field": "num",
            "description": "<p>Message number (004, 052, 213, etc...)</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i https://www.navysearch.org/v1.0/message?type=NAVADMIN&year=16&num=042",
        "type": "json"
      }
    ],
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/message"
      }
    ],
    "filename": "web/routes/message.js",
    "groupTitle": "Message",
    "name": "GetMessage"
  },
  {
    "type": "get",
    "url": "/message/:id",
    "title": "Get message from ID",
    "group": "Message",
    "version": "1.0.0",
    "description": "<p>Gets a single message based on message ID</p>",
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/message/NAVADMIN16123"
      }
    ],
    "filename": "web/routes/message.js",
    "groupTitle": "Message",
    "name": "GetMessageId"
  },
  {
    "type": "get",
    "url": "/messages/count",
    "title": "Get count data for all message types",
    "group": "Message",
    "version": "1.0.0",
    "description": "<p>Gets count data for all message types</p>",
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/messages/count"
      }
    ],
    "filename": "web/routes/messages.js",
    "groupTitle": "Message",
    "name": "GetMessagesCount"
  },
  {
    "type": "get",
    "url": "/messages/search",
    "title": "Search messages",
    "group": "Message",
    "version": "1.0.0",
    "description": "<p>Search messages</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "q",
            "description": "<p>String to search for</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Search for messages containing \"PRT\":",
        "content": "curl -i https://www.navysearch.org/v1.0/messages/search?q=PRT",
        "type": "json"
      }
    ],
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/messages/search"
      }
    ],
    "filename": "web/routes/messages.js",
    "groupTitle": "Message",
    "name": "GetMessagesSearch"
  },
  {
    "type": "get",
    "url": "/message/NAVADMIN/:year/:number",
    "title": "Get message from year and number",
    "group": "NAVADMIN",
    "version": "1.0.0",
    "description": "<p>Gets a single message based on message year and number</p>",
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/message/NAVADMIN/15/213"
      }
    ],
    "filename": "web/routes/message.js",
    "groupTitle": "NAVADMIN",
    "name": "GetMessageNavadminYearNumber"
  },
  {
    "type": "get",
    "url": "/messages/NAVADMIN/:year",
    "title": "Get messages data for a given year",
    "group": "NAVADMIN",
    "version": "1.0.0",
    "description": "<p>Gets a list of message data for a given year</p>",
    "sampleRequest": [
      {
        "url": "https://www.navysearch.org/api/v1.0/messages/NAVADMIN/16"
      }
    ],
    "filename": "web/routes/messages.js",
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
    "filename": "web/apidocs/main.js",
    "group": "_home_vagrant_appdev_navy_search_web_apidocs_main_js",
    "groupTitle": "_home_vagrant_appdev_navy_search_web_apidocs_main_js",
    "name": ""
  }
] });
