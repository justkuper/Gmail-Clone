import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Email: a
    .model({
      from:        a.string().required(),
      to:          a.string().array().required(),
      cc:          a.string().array(),
      bcc:         a.string().array(),
      subject:     a.string(),
      body:        a.string(),
      bodyText:    a.string(),
      snippet:     a.string(),
      isRead:      a.boolean().required(),
      isStarred:   a.boolean().required(),
      isImportant: a.boolean().required(),
      isDraft:     a.boolean().required(),
      isTrashed:   a.boolean().required(),
      folder:      a.string().required(), // INBOX | SENT | DRAFTS | TRASH | SPAM | STARRED
      labels:      a.string().array(),
      threadId:    a.string(),
      sentAt:      a.datetime().required(),
    })
    .authorization(allow => [allow.owner()]),

  Label: a
    .model({
      name:  a.string().required(),
      color: a.string().required(),
    })
    .authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
