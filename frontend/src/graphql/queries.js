export const listEmails = /* GraphQL */ `
  query ListEmails(
    $filter: ModelEmailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEmails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        from
        to
        cc
        bcc
        subject
        body
        bodyText
        isRead
        isStarred
        isImportant
        isDraft
        isTrashed
        folder
        labels
        threadId
        sentAt
        owner
        attachments {
          filename
          contentType
          size
          key
        }
      }
      nextToken
    }
  }
`;

export const getEmail = /* GraphQL */ `
  query GetEmail($id: ID!) {
    getEmail(id: $id) {
      id
      from
      to
      cc
      bcc
      subject
      body
      bodyText
      isRead
      isStarred
      isImportant
      isDraft
      isTrashed
      folder
      labels
      threadId
      sentAt
      owner
      attachments {
        filename
        contentType
        size
        key
      }
    }
  }
`;

export const listLabels = /* GraphQL */ `
  query ListLabels {
    listLabels {
      items {
        id
        name
        color
        owner
      }
    }
  }
`;
