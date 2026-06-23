export const createEmail = /* GraphQL */ `
  mutation CreateEmail($input: CreateEmailInput!) {
    createEmail(input: $input) {
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
    }
  }
`;

export const updateEmail = /* GraphQL */ `
  mutation UpdateEmail($input: UpdateEmailInput!) {
    updateEmail(input: $input) {
      id
      isRead
      isStarred
      isImportant
      isDraft
      isTrashed
      folder
      labels
    }
  }
`;

export const deleteEmail = /* GraphQL */ `
  mutation DeleteEmail($input: DeleteEmailInput!) {
    deleteEmail(input: $input) {
      id
    }
  }
`;

export const createLabel = /* GraphQL */ `
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      id
      name
      color
      owner
    }
  }
`;

export const deleteLabel = /* GraphQL */ `
  mutation DeleteLabel($input: DeleteLabelInput!) {
    deleteLabel(input: $input) {
      id
    }
  }
`;
