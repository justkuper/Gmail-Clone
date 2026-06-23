import React, { useState } from 'react';
import { useEmail } from '../context/EmailContext';
import { format, isToday, isThisYear } from 'date-fns';
import './EmailList.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isThisYear(d)) return format(d, 'MMM d');
  return format(d, 'MMM d, yyyy');
}

function EmailRow({ email, onSelect }) {
  const { toggleStar, markRead, trashEmail } = useEmail();
  const [hovered, setHovered] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleStar = (e) => {
    e.stopPropagation();
    toggleStar(email.id, email.isStarred);
  };

  const handleTrash = (e) => {
    e.stopPropagation();
    trashEmail(email.id);
  };

  const handleCheck = (e) => {
    e.stopPropagation();
    setChecked(!checked);
  };

  const handleClick = () => {
    onSelect(email);
    if (!email.isRead) markRead(email.id);
  };

  const snippet = email.bodyText
    ? email.bodyText.substring(0, 100)
    : email.body.replace(/<[^>]+>/g, '').substring(0, 100);

  return (
    <div
      className={`email-row ${!email.isRead ? 'unread' : ''} ${checked ? 'checked' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox + avatar */}
      <div className="row-left">
        <div className="checkbox-wrapper" onClick={handleCheck}>
          {checked || hovered ? (
            <div className={`checkbox ${checked ? 'checked' : ''}`}>
              {checked && <span className="material-icons" style={{ fontSize: 14, color: 'white' }}>check</span>}
            </div>
          ) : (
            <div className="sender-avatar">{(email.from || '?').charAt(0).toUpperCase()}</div>
          )}
        </div>
        <button
          className={`star-btn ${email.isStarred ? 'starred' : ''}`}
          onClick={handleStar}
          title={email.isStarred ? 'Unstar' : 'Star'}
        >
          <span className="material-icons">
            {email.isStarred ? 'star' : 'star_border'}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="row-content">
        <span className="row-from">{email.from}</span>
        <span className="row-meta">
          <span className="row-subject">{email.subject || '(no subject)'}</span>
          <span className="row-snippet"> — {snippet}</span>
        </span>
      </div>

      {/* Right: date + actions */}
      <div className="row-right">
        {hovered ? (
          <div className="row-actions" onClick={e => e.stopPropagation()}>
            <button className="action-btn" title="Archive" onClick={() => {}}>
              <span className="material-icons">archive</span>
            </button>
            <button className="action-btn" title="Delete" onClick={handleTrash}>
              <span className="material-icons">delete</span>
            </button>
            <button className="action-btn" title="Mark as unread" onClick={() => markRead(email.id, false)}>
              <span className="material-icons">mail</span>
            </button>
            <button className="action-btn" title="Snooze" onClick={() => {}}>
              <span className="material-icons">snooze</span>
            </button>
          </div>
        ) : (
          <span className="row-date">{formatDate(email.sentAt)}</span>
        )}
      </div>
    </div>
  );
}

export default function EmailList() {
  const { emails, loading, activeFolder, openCompose, setSelectedEmail, markRead } = useEmail();
  const [selectAll, setSelectAll] = useState(false);

  const folderLabel = activeFolder.charAt(0) + activeFolder.slice(1).toLowerCase();

  if (loading) {
    return (
      <div className="email-list-loading">
        <div className="spinner"></div>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="email-list">
      {/* Toolbar */}
      <div className="list-toolbar">
        <div className="toolbar-left">
          <div
            className={`checkbox ${selectAll ? 'checked' : ''}`}
            onClick={() => setSelectAll(!selectAll)}
            style={{ cursor: 'pointer' }}
          >
            {selectAll && <span className="material-icons" style={{ fontSize: 14, color: 'white' }}>check</span>}
          </div>
          <button className="toolbar-btn" title="More options">
            <span className="material-icons" style={{ fontSize: 18 }}>arrow_drop_down</span>
          </button>
          <button className="toolbar-btn" title="Refresh" onClick={() => {}}>
            <span className="material-icons">refresh</span>
          </button>
          <button className="toolbar-btn" title="More">
            <span className="material-icons">more_vert</span>
          </button>
        </div>
        <div className="toolbar-right">
          <span className="page-info">1–{emails.length} of {emails.length}</span>
          <button className="toolbar-btn">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="toolbar-btn">
            <span className="material-icons">chevron_right</span>
          </button>
          <button className="toolbar-btn" title="Toggle view">
            <span className="material-icons">view_list</span>
          </button>
        </div>
      </div>

      {/* Tabs (Inbox only) */}
      {activeFolder === 'INBOX' && (
        <div className="inbox-tabs">
          <button className="tab active">
            <span className="material-icons">inbox</span>
            Primary
          </button>
          <button className="tab">
            <span className="material-icons">people</span>
            Social
          </button>
          <button className="tab">
            <span className="material-icons">local_offer</span>
            Promotions
          </button>
        </div>
      )}

      {/* Email rows */}
      {emails.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">inbox</span>
          <p>No conversations in {folderLabel}</p>
        </div>
      ) : (
        <div className="email-rows">
          {emails.map(email => (
            <EmailRow
              key={email.id}
              email={email}
              onSelect={(e) => setSelectedEmail(e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
