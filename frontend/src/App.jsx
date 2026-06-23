import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { EmailProvider } from './context/EmailContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import ComposeModal from './components/ComposeModal';
import { useEmail } from './context/EmailContext';
import './App.css';

function GmailApp() {
  const { selectedEmail, setSelectedEmail, composeOpen, sidebarOpen } = useEmail();

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          {selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              onBack={() => setSelectedEmail(null)}
            />
          ) : (
            <EmailList />
          )}
        </main>
      </div>
      {composeOpen && <ComposeModal />}
    </div>
  );
}

export default function App() {
  return (
    <Authenticator
      loginMechanisms={['email']}
      signUpAttributes={['email']}
      components={{
        Header() {
          return (
            <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <path d="M6 10h28l-14 10L6 10z" fill="#EA4335"/>
                  <path d="M6 10v20h28V10L20 20 6 10z" fill="#FBBC05"/>
                  <path d="M6 10v20h12V18L6 10z" fill="#34A853"/>
                  <path d="M34 10v20H22V18l12-8z" fill="#4285F4"/>
                </svg>
                <span style={{ fontSize: 28, fontFamily: "'Google Sans', sans-serif", color: '#5f6368', letterSpacing: -1 }}>
                  <span style={{ color: '#4285F4' }}>G</span>
                  <span style={{ color: '#EA4335' }}>m</span>
                  <span style={{ color: '#FBBC05' }}>a</span>
                  <span style={{ color: '#4285F4' }}>i</span>
                  <span style={{ color: '#34A853' }}>l</span>
                  <span style={{ color: '#EA4335' }}> Clone</span>
                </span>
              </div>
            </div>
          );
        },
      }}
    >
      {({ signOut, user }) => (
        <EmailProvider>
          <GmailApp user={user} signOut={signOut} />
        </EmailProvider>
      )}
    </Authenticator>
  );
}
