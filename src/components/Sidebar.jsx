import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { MessageSquare, Folder, Plus, Search, Trash2, ChevronLeft, Image, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import NewProjectModal from './NewProjectModal';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import UserProfile from './UserProfile';

const Sidebar = ({ onCollapse }) => {
  const {
    mode,
    setMode,
    conversations,
    workspaces,
    currentConversation,
    currentWorkspace,
    setCurrentConversation,
    setCurrentWorkspace,
    createConversation,
    deleteConversation,
    deleteWorkspace,
    searchQuery,
    setSearchQuery,
    fetchConversations,
    theme,
    setTheme,
  } = useStore();

  const navigate = useNavigate();
  const [showNewProject, setShowNewProject] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleNewChat = async () => {
    try {
      // In workspace mode, create chat in workspace; otherwise standalone
      const workspaceId = mode === 'workspace' ? currentWorkspace?.id : null;
      const conv = await createConversation(workspaceId);
      setCurrentConversation(conv);
      toast.success('New chat created');
    } catch (e) {
      toast.error('Failed to create chat');
    }
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      toast.success('Chat deleted');
    } catch (e) {
      toast.error('Failed to delete chat');
    }
  };

  const handleDeleteWorkspace = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteWorkspace(id);
      toast.success('Project deleted');
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentConversation(null);
    if (newMode === 'chats') {
      setCurrentWorkspace(null);
      fetchConversations(); // Fetch standalone chats
    }
  };

  // Filter conversations - only show standalone (no workspace) in Chats mode
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    // In chats mode, only show conversations WITHOUT a workspace
    if (mode === 'chats') {
      return matchesSearch && !c.workspace_id;
    }
    return matchesSearch;
  });

  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background" data-testid="sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Logo size="md" />
          <button
            onClick={onCollapse}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            data-testid="collapse-sidebar-btn"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* New Button */}
        <button
          onClick={mode === 'chats' ? handleNewChat : () => setShowNewProject(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
          data-testid="new-chat-btn"
        >
          <Plus className="w-4 h-4" />
          {mode === 'chats' ? 'New Chat' : 'New Project'}
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="px-4 py-3">
        <div className="mode-switch">
          <button
            onClick={() => handleModeChange('workspace')}
            className={`mode-switch-item ${mode === 'workspace' ? 'active' : ''}`}
            data-testid="mode-workspace-btn"
          >
            Workspace
          </button>
          <button
            onClick={() => handleModeChange('chats')}
            className={`mode-switch-item ${mode === 'chats' ? 'active' : ''}`}
            data-testid="mode-chats-btn"
          >
            Chats
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2">
        {mode === 'chats' ? (
          <>
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Chats
            </div>
            {filteredConversations.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">No standalone chats yet</p>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv)}
                  onMouseEnter={() => setHoveredItem(conv.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`sidebar-item group ${currentConversation?.id === conv.id ? 'active' : ''}`}
                  data-testid={`chat-item-${conv.id}`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  {hoveredItem === conv.id && (
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="p-1 hover:bg-destructive/20 rounded transition-colors"
                      data-testid={`delete-chat-${conv.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </div>
            {filteredWorkspaces.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">No projects yet</p>
            ) : (
              filteredWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setCurrentConversation(null);
                    fetchConversations(ws.id);
                  }}
                  onMouseEnter={() => setHoveredItem(ws.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`sidebar-item group ${currentWorkspace?.id === ws.id ? 'active' : ''}`}
                  data-testid={`workspace-item-${ws.id}`}
                >
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: ws.color }}
                  />
                  <span className="flex-1 truncate">{ws.name}</span>
                  {hoveredItem === ws.id && (
                    <button
                      onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                      className="p-1 hover:bg-destructive/20 rounded transition-colors"
                      data-testid={`delete-workspace-${ws.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => navigate('/artifacts')}
          className="sidebar-item w-full"
          data-testid="artifacts-gallery-btn"
        >
          <Image className="w-4 h-4" />
          <span>Artifacts Gallery</span>
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="sidebar-item w-full"
          data-testid="theme-toggle-sidebar"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Profile */}
        <div className="pt-2 border-t border-border mt-2">
          <UserProfile />
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </div>
  );
};

export default Sidebar;
