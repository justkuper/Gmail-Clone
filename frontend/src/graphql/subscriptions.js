export const onCreateEmail = /* GraphQL */ `
  subscription OnCreateEmail($owner: String) {
    onCreateEmail(owner: $owner) {
      id
      from
      to
      subject
      bodyText
      isRead
      isStarred
      folder
      sentAt
      owner
    }
  }
`;

export const onUpdateEmail = /* GraphQL */ `
  subscription OnUpdateEmail($owner: String) {
    onUpdateEmail(owner: $owner) {
      id
      isRead
      isStarred
      isImportant
      isTrashed
      folder
      labels
    }
  }
`;

export const onDeleteEmail = /* GraphQL */ `
  subscription OnDeleteEmail($owner: String) {
    onDeleteEmail(owner: $owner) {
      id
    }
  }
`;
