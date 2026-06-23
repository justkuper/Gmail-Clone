# Gmail Clone — React + AWS Amplify

A pixel-faithful Gmail clone with a React frontend and an AWS Amplify backend. No Plaid or banking code.

---

## Project Structure

```
GMAIL CLONE/
├── frontend/                   # React app (Create React App)
│   ├── public/index.html
│   └── src/
│       ├── App.jsx             # Root — wraps Authenticator + GmailApp
│       ├── aws-exports.js      # Amplify config (replace after deploy)
│       ├── context/
│       │   └── EmailContext.js # Global state + AppSync calls
│       ├── components/
│       │   ├── Header.jsx/css  # Search bar, avatar, sign-out
│       │   ├── Sidebar.jsx/css # Compose button, folder nav, labels
│       │   ├── EmailList.jsx/css
│       │   ├── EmailDetail.jsx/css
│       │   └── ComposeModal.jsx/css
│       └── graphql/
│           ├── queries.js
│           ├── mutations.js
│           └── subscriptions.js
│
└── backend/                    # Amplify backend
    ├── amplify/
    │   ├── cli.json
    │   ├── team-provider-info.json
    │   └── backend/
    │       ├── backend-config.json
    │       ├── api/gmailclone/
    │       │   └── schema.graphql   # Email, Thread, Label models
    │       ├── auth/gmailcloneauth/ # Cognito (email sign-in)
    │       └── function/emailSender/# Lambda → SES for real sending
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- AWS account
- Amplify CLI: `npm install -g @aws-amplify/cli`
- AWS CLI configured: `aws configure`

---

## Setup

### 1 — Deploy the backend

```bash
cd backend
npm install
amplify init          # follow prompts, choose "dev" environment
amplify push --yes    # deploys Cognito, AppSync/DynamoDB, S3, Lambda
```

After `amplify push` finishes, copy the generated `aws-exports.js` to the frontend:

```bash
cp amplify/aws-exports.js ../frontend/src/aws-exports.js
```

### 2 — Run the frontend

```bash
cd frontend
npm install
npm start             # http://localhost:3000
```

---

## Features

| Feature | Details |
|---------|---------|
| Auth | Email/password via Cognito (sign up, sign in, verify) |
| Inbox | Unread count, star, checkbox select, hover actions |
| Folders | Inbox, Starred, Sent, Drafts, Spam, Trash |
| Email detail | Full headers, HTML body, reply/forward |
| Compose | Rich-text editor (bold, italic, underline, lists, links), Cc/Bcc, minimize/maximize |
| Real-time | AppSync subscriptions push new emails live |
| Search | Filters by subject, body, and sender |
| Labels | Personal, Work, Finance (extensible via DynamoDB) |

---

## Environment

The frontend reads all AWS config from `src/aws-exports.js` — no `.env` file needed. Replace the placeholder values in that file with the real outputs from `amplify push`.

---

## Sending real email

The `emailSender` Lambda uses Amazon SES. Before it can send:
1. Verify your sender domain in the SES console.
2. (Sandbox) Verify recipient addresses too, or request production access.

---

## Tech stack

- **Frontend:** React 18, AWS Amplify UI React (auth), date-fns, Material Icons
- **Backend:** AWS AppSync (GraphQL), Amazon DynamoDB, Amazon Cognito, Amazon S3, AWS Lambda, Amazon SES
