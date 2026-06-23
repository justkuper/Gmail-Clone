import React, { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import { useEmail } from '../context/EmailContext';
import './Header.css';

export default function Header() {
  const { searchQuery, setSearchQuery, setSidebarOpen, sidebarOpen } = useEmail();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="header">
      {/* Left: hamburger + logo */}
      <div className="header-left">
        <button
          className="icon-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Main menu"
        >
          <span className="material-icons">menu</span>
        </button>
        <div className="logo">
          <svg width="36" height="26" viewBox="0 0 36 26">
            <path d="M4 4h28l-14 9L4 4z" fill="#EA4335"/>
            <path d="M4 4v18h28V4L18 13 4 4z" fill="#FBBC05"/>
            <path d="M4 4v18h11V11L4 4z" fill="#34A853"/>
            <path d="M32 4v18H21V11l11-7z" fill="#4285F4"/>
          </svg>
          <span className="logo-text">Gmail</span>
        </div>
      </div>

      {/* Center: search bar */}
      <div className={`search-bar-wrapper ${searchFocused ? 'focused' : ''}`}>
        <button className="search-icon">
          <span className="material-icons">search</span>
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Search mail"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>
            <span className="material-icons">close</span>
          </button>
        )}
        <button className="search-filter" title="Show search options">
          <span className="material-icons">tune</span>
        </button>
      </div>

      {/* Right: icons + avatar */}
      <div className="header-right">
        <button className="icon-btn" title="Help">
          <span className="material-icons">help_outline</span>
        </button>
        <button className="icon-btn" title="Settings">
          <span className="material-icons">settings</span>
        </button>
        <button className="icon-btn" title="Google apps">
          <span className="material-icons">apps</span>
        </button>
        <div className="avatar-wrapper">
          <button
            className="avatar-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Account"
          >
            <div className="avatar">G</div>
          </button>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="avatar large">G</div>
                <p className="user-email">Gmail Clone User</p>
              </div>
              <hr />
              <button className="user-menu-item" onClick={handleSignOut}>
                <span className="material-icons">logout</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
