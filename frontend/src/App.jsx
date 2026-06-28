import React from 'react';
import KmailAuth from './components/KmailAuth';
import { EmailProvider } from './context/EmailContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import ComposeModal from './components/ComposeModal';
import { useEmail } from './context/EmailContext';
import './App.css';

function KmailApp() {
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
    <KmailAuth>
      {({ signOut, user }) => (
        <EmailProvider>
          <KmailApp user={user} signOut={signOut} />
        </EmailProvider>
      )}
    </KmailAuth>
  );
}
