import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';

const EmailContext = createContext();
const client = generateClient();

export function EmailProvider({ children }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeFolder, setActiveFolder] = useState('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeDraft, setComposeDraft] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const buildFilter = useCallback((folder, query) => {
    const conditions = [];

    if (folder === 'INBOX') {
      conditions.push({ folder: { eq: 'INBOX' } });
      conditions.push({ isTrashed: { eq: false } });
    } else if (folder === 'STARRED') {
      conditions.push({ isStarred: { eq: true } });
      conditions.push({ isTrashed: { eq: false } });
    } else if (folder === 'SENT') {
      conditions.push({ folder: { eq: 'SENT' } });
    } else if (folder === 'DRAFTS') {
      conditions.push({ isDraft: { eq: true } });
    } else if (folder === 'TRASH') {
      conditions.push({ isTrashed: { eq: true } });
    } else if (folder === 'SPAM') {
      conditions.push({ folder: { eq: 'SPAM' } });
    }

    if (query) {
      conditions.push({
        or: [
          { subject: { contains: query } },
          { bodyText: { contains: query } },
          { from: { contains: query } },
        ],
      });
    }

    return conditions.length > 0 ? { and: conditions } : undefined;
  }, []);

  const fetchEmails = useCallback(async (folder = activeFolder) => {
    setLoading(true);
    try {
      const filter = buildFilter(folder, searchQuery);
      const { data: items, errors } = await client.models.Email.list({
        filter,
        limit: 50,
      });
      if (errors) throw errors;
      setEmails(
        (items || []).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      );
    } catch (err) {
      console.error('fetchEmails error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFolder, searchQuery, buildFilter]);

  useEffect(() => {
    fetchEmails(activeFolder);
  }, [activeFolder, searchQuery]);

  // Real-time subscriptions
  useEffect(() => {
    const createSub = client.models.Email.onCreate().subscribe({
      next: ({ data: newEmail }) => {
        setEmails(prev => [newEmail, ...prev]);
      },
      error: err => console.error('onCreate sub error:', err),
    });

    const updateSub = client.models.Email.onUpdate().subscribe({
      next: ({ data: updated }) => {
        setEmails(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
      },
      error: err => console.error('onUpdate sub error:', err),
    });

    const deleteSub = client.models.Email.onDelete().subscribe({
      next: ({ data: deleted }) => {
        setEmails(prev => prev.filter(e => e.id !== deleted.id));
      },
      error: err => console.error('onDelete sub error:', err),
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

  const markRead = async (id, isRead = true) => {
    const { errors } = await client.models.Email.update({ id, isRead });
    if (!errors) setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead } : e));
  };

  const toggleStar = async (id, current) => {
    const isStarred = !current;
    const { errors } = await client.models.Email.update({ id, isStarred });
    if (!errors) setEmails(prev => prev.map(e => e.id === id ? { ...e, isStarred } : e));
  };

  const trashEmail = async (id) => {
    const { errors } = await client.models.Email.update({ id, isTrashed: true, folder: 'TRASH' });
    if (!errors) {
      setEmails(prev => prev.filter(e => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
    }
  };

  const permanentDelete = async (id) => {
    const { errors } = await client.models.Email.delete({ id });
    if (!errors) {
      setEmails(prev => prev.filter(e => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
    }
  };

  const sendEmail = async (emailData) => {
    const { errors } = await client.models.Email.create({
      ...emailData,
      folder: 'SENT',
      isRead: true,
      isStarred: false,
      isImportant: false,
      isDraft: false,
      isTrashed: false,
      sentAt: new Date().toISOString(),
    });
    if (errors) throw errors;
  };

  const saveDraft = async (emailData) => {
    const { errors } = await client.models.Email.create({
      ...emailData,
      folder: 'DRAFTS',
      isRead: true,
      isStarred: false,
      isImportant: false,
      isDraft: true,
      isTrashed: false,
      sentAt: new Date().toISOString(),
    });
    if (errors) throw errors;
  };

  const openCompose = (draft = null) => {
    setComposeDraft(draft);
    setComposeOpen(true);
  };

  const closeCompose = () => {
    setComposeOpen(false);
    setComposeDraft(null);
  };

  const unreadCount = emails.filter(e => !e.isRead && !e.isTrashed).length;

  return (
    <EmailContext.Provider value={{
      emails,
      selectedEmail,
      setSelectedEmail,
      activeFolder,
      setActiveFolder,
      searchQuery,
      setSearchQuery,
      loading,
      composeOpen,
      composeDraft,
      sidebarOpen,
      setSidebarOpen,
      unreadCount,
      fetchEmails,
      markRead,
      toggleStar,
      trashEmail,
      permanentDelete,
      sendEmail,
      saveDraft,
      openCompose,
      closeCompose,
    }}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  return useContext(EmailContext);
}
