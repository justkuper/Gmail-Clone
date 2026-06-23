import React, { useState } from 'react';
import { useEmail } from '../context/EmailContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { folder: 'INBOX',   label: 'Inbox',        icon: 'inbox' },
  { folder: 'STARRED', label: 'Starred',       icon: 'star_border' },
  { folder: 'SENT',    label: 'Sent',          icon: 'send' },
  { folder: 'DRAFTS',  label: 'Drafts',        icon: 'drafts' },
  { folder: 'SPAM',    label: 'Spam',          icon: 'report_gmailerrorred' },
  { folder: 'TRASH',   label: 'Trash',         icon: 'delete' },
];

const MORE_ITEMS = [
  { folder: 'IMPORTANT', label: 'Important',   icon: 'label_important' },
  { folder: 'CHATS',     label: 'Chats',       icon: 'chat_bubble_outline' },
  { folder: 'SCHEDULED', label: 'Scheduled',   icon: 'schedule' },
  { folder: 'ALL_MAIL',  label: 'All Mail',    icon: 'all_inbox' },
];

export default function Sidebar() {
  const { activeFolder, setActiveFolder, openCompose, unreadCount, sidebarOpen, setSelectedEmail } = useEmail();
  const [showMore, setShowMore] = useState(false);

  if (!sidebarOpen) return null;

  const handleNav = (folder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
  };

  return (
    <aside className="sidebar">
      {/* Compose */}
      <div className="compose-wrapper">
        <button className="compose-btn" onClick={() => openCompose()}>
          <span className="material-icons">edit</span>
          <span className="compose-label">Compose</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.folder}
            className={`nav-item ${activeFolder === item.folder ? 'active' : ''}`}
            onClick={() => handleNav(item.folder)}
          >
            <span className="material-icons nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.folder === 'INBOX' && unreadCount > 0 && (
              <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
        ))}

        <button
          className="nav-item more-toggle"
          onClick={() => setShowMore(!showMore)}
        >
          <span className="material-icons nav-icon">
            {showMore ? 'expand_less' : 'expand_more'}
          </span>
          <span className="nav-label">{showMore ? 'Less' : 'More'}</span>
        </button>

        {showMore && MORE_ITEMS.map(item => (
          <button
            key={item.folder}
            className={`nav-item ${activeFolder === item.folder ? 'active' : ''}`}
            onClick={() => handleNav(item.folder)}
          >
            <span className="material-icons nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Labels section */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>Labels</span>
          <button className="icon-btn-sm" title="Create new label">
            <span className="material-icons" style={{ fontSize: 18 }}>add</span>
          </button>
        </div>
        <div className="label-item">
          <span className="label-dot" style={{ background: '#16a765' }}></span>
          <span>Personal</span>
        </div>
        <div className="label-item">
          <span className="label-dot" style={{ background: '#4285F4' }}></span>
          <span>Work</span>
        </div>
        <div className="label-item">
          <span className="label-dot" style={{ background: '#FF7537' }}></span>
          <span>Finance</span>
        </div>
      </div>
    </aside>
  );
}
