import React, { useState, useRef } from 'react';
import { useEmail } from '../context/EmailContext';
import './ComposeModal.css';

const INITIAL_STATE = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
};

export default function ComposeModal() {
  const { closeCompose, sendEmail, saveDraft, composeDraft } = useEmail();
  const [form, setForm] = useState({
    to: (composeDraft?.to || []).join(', '),
    cc: (composeDraft?.cc || []).join(', '),
    bcc: (composeDraft?.bcc || []).join(', '),
    subject: composeDraft?.subject || '',
    body: composeDraft?.body || '',
  });
  const [showCcBcc, setShowCcBcc] = useState(!!(composeDraft?.cc?.length || composeDraft?.bcc?.length));
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef(null);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const parseEmails = (str) =>
    str.split(/[,;]+/).map(s => s.trim()).filter(Boolean);

  const handleSend = async () => {
    if (!form.to.trim()) {
      setError('Please specify at least one recipient.');
      return;
    }
    setSending(true);
    try {
      await sendEmail({
        from: 'me@kmail.com',
        to: parseEmails(form.to),
        cc: parseEmails(form.cc),
        bcc: parseEmails(form.bcc),
        subject: form.subject || '(no subject)',
        body: bodyRef.current?.innerHTML || form.body,
        bodyText: bodyRef.current?.innerText || form.body,
      });
      closeCompose();
    } catch (err) {
      console.error('Send failed:', err);
      setError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDraft = async () => {
    await saveDraft({
      from: 'me@kmail.com',
      to: parseEmails(form.to),
      cc: parseEmails(form.cc),
      bcc: parseEmails(form.bcc),
      subject: form.subject || '(no subject)',
      body: bodyRef.current?.innerHTML || form.body,
      bodyText: bodyRef.current?.innerText || form.body,
    });
    closeCompose();
  };

  const execFormat = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    bodyRef.current?.focus();
  };

  if (minimized) {
    return (
      <div className="compose-minimized">
        <span>{form.subject || 'New Message'}</span>
        <div className="compose-min-actions">
          <button onClick={() => setMinimized(false)} title="Expand">
            <span className="material-icons">expand_less</span>
          </button>
          <button onClick={closeCompose} title="Discard">
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`compose-modal ${maximized ? 'maximized' : ''}`}>
      {/* Title bar */}
      <div className="compose-header">
        <span className="compose-title">New Message</span>
        <div className="compose-header-actions">
          <button onClick={() => setMinimized(true)} title="Minimize">
            <span className="material-icons">remove</span>
          </button>
          <button onClick={() => setMaximized(!maximized)} title={maximized ? 'Restore' : 'Maximize'}>
            <span className="material-icons">{maximized ? 'fullscreen_exit' : 'open_in_full'}</span>
          </button>
          <button onClick={handleDraft} title="Save & close">
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>

      {/* Recipients */}
      <div className="compose-field">
        <label>To</label>
        <input
          type="text"
          placeholder="Recipients"
          value={form.to}
          onChange={update('to')}
        />
        <button
          className="cc-bcc-toggle"
          onClick={() => setShowCcBcc(!showCcBcc)}
        >
          {showCcBcc ? 'Hide' : 'Cc Bcc'}
        </button>
      </div>

      {showCcBcc && (
        <>
          <div className="compose-field">
            <label>Cc</label>
            <input
              type="text"
              placeholder="Cc"
              value={form.cc}
              onChange={update('cc')}
            />
          </div>
          <div className="compose-field">
            <label>Bcc</label>
            <input
              type="text"
              placeholder="Bcc"
              value={form.bcc}
              onChange={update('bcc')}
            />
          </div>
        </>
      )}

      {/* Subject */}
      <div className="compose-field">
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={update('subject')}
          className="subject-input"
        />
      </div>

      {/* Error */}
      {error && <div className="compose-error">{error}</div>}

      {/* Formatting toolbar */}
      <div className="format-toolbar">
        <button onClick={() => execFormat('bold')} title="Bold"><strong>B</strong></button>
        <button onClick={() => execFormat('italic')} title="Italic"><em>I</em></button>
        <button onClick={() => execFormat('underline')} title="Underline"><u>U</u></button>
        <span className="toolbar-divider" />
        <button onClick={() => execFormat('insertUnorderedList')} title="Bullet list">
          <span className="material-icons">format_list_bulleted</span>
        </button>
        <button onClick={() => execFormat('insertOrderedList')} title="Numbered list">
          <span className="material-icons">format_list_numbered</span>
        </button>
        <span className="toolbar-divider" />
        <button onClick={() => execFormat('justifyLeft')} title="Align left">
          <span className="material-icons">format_align_left</span>
        </button>
        <button onClick={() => execFormat('justifyCenter')} title="Align center">
          <span className="material-icons">format_align_center</span>
        </button>
        <button onClick={() => execFormat('justifyRight')} title="Align right">
          <span className="material-icons">format_align_right</span>
        </button>
        <span className="toolbar-divider" />
        <button onClick={() => execFormat('createLink', prompt('Enter URL:'))} title="Insert link">
          <span className="material-icons">link</span>
        </button>
        <button onClick={() => execFormat('removeFormat')} title="Remove formatting">
          <span className="material-icons">format_clear</span>
        </button>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="compose-body"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: form.body }}
        onInput={() => {}}
        placeholder="Compose email…"
      />

      {/* Bottom bar */}
      <div className="compose-footer">
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
        <div className="footer-actions">
          <button className="footer-btn" title="Formatting options">
            <span className="material-icons">text_format</span>
          </button>
          <button className="footer-btn" title="Attach files">
            <span className="material-icons">attach_file</span>
          </button>
          <button className="footer-btn" title="Insert link">
            <span className="material-icons">link</span>
          </button>
          <button className="footer-btn" title="Insert emoji">
            <span className="material-icons">sentiment_satisfied</span>
          </button>
          <button className="footer-btn" title="Insert drive file">
            <span className="material-icons">add_to_drive</span>
          </button>
          <button className="footer-btn" title="Insert photo">
            <span className="material-icons">image</span>
          </button>
          <button className="footer-btn" title="More options">
            <span className="material-icons">more_vert</span>
          </button>
        </div>
        <button
          className="footer-btn delete-draft"
          title="Discard draft"
          onClick={closeCompose}
        >
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  );
}
