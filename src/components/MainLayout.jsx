import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatView from './ChatView';
import WorkspaceView from './WorkspaceView';
import EmptyState from './EmptyState';
import { useStore } from '../store/useStore';

const MainLayout = () => {
  const { mode, currentConversation, currentWorkspace, fetchConversations, fetchWorkspaces } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchWorkspaces();
  }, [fetchConversations, fetchWorkspaces]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? 'w-0' : 'w-64'} flex-shrink-0 border-r border-border transition-all duration-300 overflow-hidden relative z-10`}
      >
        <Sidebar onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Toggle button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="fixed left-2 top-4 z-50 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          data-testid="expand-sidebar-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              mode === 'chats' ? (
                currentConversation ? (
                  <ChatView key={currentConversation.id} onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                ) : (
                  <EmptyState />
                )
              ) : currentWorkspace ? (
                <WorkspaceView key={currentWorkspace.id} onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
              ) : (
                <EmptyState />
              )
            }
          />
          <Route path="/chat/:id" element={<ChatView onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />} />
          <Route path="/workspace/:id" element={<WorkspaceView onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;
