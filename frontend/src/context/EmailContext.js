import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listEmails } from '../graphql/queries';
import { updateEmail, deleteEmail, createEmail } from '../graphql/mutations';
import { onCreateEmail, onUpdateEmail, onDeleteEmail } from '../graphql/subscriptions';

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

  const fetchEmails = useCallback(async (folder = activeFolder) => {
    setLoading(true);
    try {
      const filter = buildFilter(folder, searchQuery);
      const result = await client.graphql({
        query: listEmails,
        variables: { filter, limit: 50 },
      });
      setEmails(result.data.listEmails.items.sort(
        (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
      ));
    } catch (err) {
      console.error('fetchEmails error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFolder, searchQuery]);

  function buildFilter(folder, query) {
    const base = {};
    if (folder === 'INBOX') {
      base.folder = { eq: 'INBOX' };
      base.isTrashed = { eq: false };
    } else if (folder === 'STARRED') {
      base.isStarred = { eq: true };
      base.isTrashed = { eq: false };
    } else if (folder === 'SENT') {
      base.folder = { eq: 'SENT' };
    } else if (folder === 'DRAFTS') {
      base.isDraft = { eq: true };
    } else if (folder === 'TRASH') {
      base.isTrashed = { eq: true };
    } else if (folder === 'SPAM') {
      base.folder = { eq: 'SPAM' };
    }
    if (query) {
      return {
        and: [
          base,
          {
            or: [
              { subject: { contains: query } },
              { bodyText: { contains: query } },
              { from: { contains: query } },
            ],
          },
        ],
      };
    }
    return base;
  }

  useEffect(() => {
    fetchEmails(activeFolder);
  }, [activeFolder, searchQuery]);

  // Real-time subscriptions
  useEffect(() => {
    const createSub = client.graphql({ query: onCreateEmail }).subscribe({
      next: ({ data }) => {
        const newEmail = data.onCreateEmail;
        setEmails(prev => [newEmail, ...prev]);
      },
    });
    const updateSub = client.graphql({ query: onUpdateEmail }).subscribe({
      next: ({ data }) => {
        const updated = data.onUpdateEmail;
        setEmails(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
      },
    });
    const deleteSub = client.graphql({ query: onDeleteEmail }).subscribe({
      next: ({ data }) => {
        const deleted = data.onDeleteEmail;
        setEmails(prev => prev.filter(e => e.id !== deleted.id));
      },
    });
    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

  const markRead = async (id, isRead = true) => {
    await client.graphql({ query: updateEmail, variables: { input: { id, isRead } } });
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead } : e));
  };

  const toggleStar = async (id, current) => {
    const isStarred = !current;
    await client.graphql({ query: updateEmail, variables: { input: { id, isStarred } } });
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isStarred } : e));
  };

  const trashEmail = async (id) => {
    await client.graphql({ query: updateEmail, variables: { input: { id, isTrashed: true, folder: 'TRASH' } } });
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const permanentDelete = async (id) => {
    await client.graphql({ query: deleteEmail, variables: { input: { id } } });
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const sendEmail = async (emailData) => {
    const input = {
      ...emailData,
      folder: 'SENT',
      isRead: true,
      isStarred: false,
      isImportant: false,
      isDraft: false,
      isTrashed: false,
      sentAt: new Date().toISOString(),
    };
    await client.graphql({ query: createEmail, variables: { input } });
  };

  const saveDraft = async (emailData) => {
    const input = {
      ...emailData,
      folder: 'DRAFTS',
      isRead: true,
      isStarred: false,
      isImportant: false,
      isDraft: true,
      isTrashed: false,
      sentAt: new Date().toISOString(),
    };
    await client.graphql({ query: createEmail, variables: { input } });
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
