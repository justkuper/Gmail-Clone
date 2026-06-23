import React, { useState } from 'react';
import { useEmail } from '../context/EmailContext';
import { format } from 'date-fns';
import './EmailDetail.css';

export default function EmailDetail({ email, onBack }) {
  const { toggleStar, trashEmail, openCompose, markRead } = useEmail();
  const [showFullHeaders, setShowFullHeaders] = useState(false);

  const handleReply = () => {
    openCompose({
      to: [email.from],
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `<br/><br/><div class="gmail_quote">On ${format(new Date(email.sentAt), 'PPpp')}, ${email.from} wrote:<br/><blockquote>${email.body}</blockquote></div>`,
    });
  };

  const handleForward = () => {
    openCompose({
      to: [],
      subject: email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`,
      body: `<br/><br/>---------- Forwarded message ---------<br/>From: ${email.from}<br/>Date: ${format(new Date(email.sentAt), 'PPpp')}<br/>Subject: ${email.subject}<br/><br/>${email.body}`,
    });
  };

  const handleTrash = () => {
    trashEmail(email.id);
    onBack();
  };

  return (
    <div className="email-detail">
      {/* Top toolbar */}
      <div className="detail-toolbar">
        <div className="toolbar-left">
          <button className="icon-btn" onClick={onBack} title="Back to list">
            <span className="material-icons">arrow_back</span>
          </button>
          <button className="icon-btn" title="Archive">
            <span className="material-icons">archive</span>
          </button>
          <button className="icon-btn" title="Report spam">
            <span className="material-icons">report</span>
          </button>
          <button className="icon-btn" title="Delete" onClick={handleTrash}>
            <span className="material-icons">delete</span>
          </button>
          <button className="icon-btn" title="Mark as unread" onClick={() => markRead(email.id, false)}>
            <span className="material-icons">mail</span>
          </button>
          <button className="icon-btn" title="Snooze">
            <span className="material-icons">snooze</span>
          </button>
          <button className="icon-btn" title="Move to">
            <span className="material-icons">folder</span>
          </button>
          <button className="icon-btn" title="Labels">
            <span className="material-icons">label</span>
          </button>
          <button className="icon-btn" title="More">
            <span className="material-icons">more_vert</span>
          </button>
        </div>
        <div className="toolbar-right">
          <button className="icon-btn">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="icon-btn">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="detail-content">
        {/* Subject */}
        <div className="detail-subject">
          <h2>{email.subject || '(no subject)'}</h2>
          <button
            className={`star-btn ${email.isStarred ? 'starred' : ''}`}
            onClick={() => toggleStar(email.id, email.isStarred)}
            title={email.isStarred ? 'Unstar' : 'Star'}
          >
            <span className="material-icons">
              {email.isStarred ? 'star' : 'star_border'}
            </span>
          </button>
          {email.isImportant && (
            <span className="material-icons important-marker" title="Important">
              label_important
            </span>
          )}
          <button className="icon-btn" title="Print">
            <span className="material-icons">print</span>
          </button>
          <button className="icon-btn" title="Open in new window">
            <span className="material-icons">open_in_new</span>
          </button>
        </div>

        {/* Message bubble */}
        <div className="message-bubble">
          {/* Sender info */}
          <div className="message-header">
            <div className="sender-avatar-lg">{email.from.charAt(0).toUpperCase()}</div>
            <div className="message-meta">
              <div className="meta-top">
                <span className="meta-from">{email.from}</span>
                <div className="meta-actions">
                  <button className="icon-btn-sm" title="Reply">
                    <span className="material-icons">reply</span>
                  </button>
                  <button className="icon-btn-sm" title="More">
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>
              </div>
              <div className="meta-bottom">
                <button
                  className="meta-to"
                  onClick={() => setShowFullHeaders(!showFullHeaders)}
                >
                  to {email.to.join(', ')}
                  <span className="material-icons" style={{ fontSize: 16 }}>
                    {showFullHeaders ? 'arrow_drop_up' : 'arrow_drop_down'}
                  </span>
                </button>
                <span className="meta-date">
                  {format(new Date(email.sentAt), 'MMM d, yyyy, h:mm a')}
                </span>
              </div>
              {showFullHeaders && (
                <div className="full-headers">
                  <div><strong>from:</strong> {email.from}</div>
                  <div><strong>to:</strong> {email.to.join(', ')}</div>
                  {email.cc?.length > 0 && <div><strong>cc:</strong> {email.cc.join(', ')}</div>}
                  <div><strong>date:</strong> {format(new Date(email.sentAt), 'PPpp')}</div>
                  <div><strong>subject:</strong> {email.subject}</div>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div
            className="message-body"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />

          {/* Attachments */}
          {email.attachments?.length > 0 && (
            <div className="attachments">
              <p className="attachments-label">
                <span className="material-icons">attach_file</span>
                {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
              </p>
              <div className="attachment-list">
                {email.attachments.map((att, i) => (
                  <div key={i} className="attachment-chip">
                    <span className="material-icons">description</span>
                    <span>{att.filename}</span>
                    <span className="att-size">{(att.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply / Forward */}
          <div className="reply-strip">
            <button className="reply-btn" onClick={handleReply}>
              <span className="material-icons">reply</span>
              Reply
            </button>
            <button className="reply-btn" onClick={() => {}}>
              <span className="material-icons">reply_all</span>
              Reply all
            </button>
            <button className="reply-btn" onClick={handleForward}>
              <span className="material-icons">forward</span>
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
