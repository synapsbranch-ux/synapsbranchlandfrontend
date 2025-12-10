import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      token: null,

      initAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, isAuthenticated: true });
          // Fetch user profile (don't logout on failure during init)
          get().fetchUser().catch(() => {
            console.log('User fetch failed on init, keeping token');
          });
        }
      },

      fetchUser: async () => {
        try {
          const res = await axios.get(`${API}/auth/me`);
          set({ user: res.data });
        } catch (e) {
          console.error('Failed to fetch user:', e);
          // Only logout if explicitly a 401/403
          if (e.response?.status === 401 || e.response?.status === 403) {
            get().logout();
          }
        }
      },

      login: async (email, password) => {
        try {
          const res = await axios.post(`${API}/auth/login`, { email, password });
          const token = res.data.access_token;
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, isAuthenticated: true });
          await get().fetchUser();
        } catch (e) {
          throw e;
        }
      },

      register: async (email, password, name) => {
        try {
          await axios.post(`${API}/auth/register`, { email, password, name });
          await get().login(email, password);
        } catch (e) {
          throw e;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },

      // OAuth Functions
      initiateGoogleAuth: async () => {
        try {
          const res = await axios.get(`${API}/auth/google`);
          // Redirect to Google auth URL
          window.location.href = res.data.auth_url;
        } catch (e) {
          console.error('Failed to initiate Google auth:', e);
          throw new Error('Google authentication is not configured');
        }
      },

      initiateGitHubAuth: async () => {
        try {
          const res = await axios.get(`${API}/auth/github`);
          // Redirect to GitHub auth URL
          window.location.href = res.data.auth_url;
        } catch (e) {
          console.error('Failed to initiate GitHub auth:', e);
          throw new Error('GitHub authentication is not configured');
        }
      },

      handleOAuthCallback: async (code, state) => {
        try {
          // Try Google callback first
          let res;
          try {
            res = await axios.get(`${API}/auth/google/callback`, {
              params: { code, state }
            });
          } catch (googleError) {
            // If Google fails, try GitHub
            if (googleError.response?.status === 400) {
              res = await axios.get(`${API}/auth/github/callback`, {
                params: { code, state }
              });
            } else {
              throw googleError;
            }
          }

          const token = res.data.access_token;
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({
            token,
            isAuthenticated: true,
            user: res.data.user
          });
        } catch (e) {
          console.error('OAuth callback error:', e);
          throw e;
        }
      },

      // Invite Code Functions
      validateInviteCode: async (code) => {
        try {
          const res = await axios.post(`${API}/auth/validate-invite`, { code });
          if (res.data.success) {
            // Update user's access_granted status
            await get().fetchUser();
          }
          return res.data;
        } catch (e) {
          console.error('Failed to validate invite code:', e);
          throw e;
        }
      },

      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      initTheme: () => {
        const { theme } = get();
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Mode: 'workspace' or 'chats'
      mode: 'chats',
      setMode: (mode) => set({ mode }),

      // Workspaces
      workspaces: [],
      currentWorkspace: null,
      loadingWorkspaces: false,

      fetchWorkspaces: async () => {
        set({ loadingWorkspaces: true });
        try {
          const res = await axios.get(`${API}/workspaces`);
          set({ workspaces: res.data, loadingWorkspaces: false });
        } catch (e) {
          console.error('Failed to fetch workspaces:', e);
          set({ loadingWorkspaces: false });
        }
      },

      createWorkspace: async (data) => {
        try {
          const res = await axios.post(`${API}/workspaces`, data);
          set((state) => ({ workspaces: [res.data, ...state.workspaces] }));
          return res.data;
        } catch (e) {
          console.error('Failed to create workspace:', e);
          throw e;
        }
      },

      updateWorkspace: async (id, data) => {
        try {
          const res = await axios.put(`${API}/workspaces/${id}`, data);
          set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === id ? res.data : w)),
            currentWorkspace: state.currentWorkspace?.id === id ? res.data : state.currentWorkspace,
          }));
          return res.data;
        } catch (e) {
          console.error('Failed to update workspace:', e);
          throw e;
        }
      },

      deleteWorkspace: async (id) => {
        try {
          await axios.delete(`${API}/workspaces/${id}`);
          set((state) => ({
            workspaces: state.workspaces.filter((w) => w.id !== id),
            currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
          }));
        } catch (e) {
          console.error('Failed to delete workspace:', e);
          throw e;
        }
      },

      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

      // Conversations
      conversations: [],
      currentConversation: null,
      loadingConversations: false,

      fetchConversations: async (workspaceId = null) => {
        set({ loadingConversations: true });
        try {
          const url = workspaceId
            ? `${API}/conversations?workspace_id=${workspaceId}`
            : `${API}/conversations?standalone=true`;
          const res = await axios.get(url);
          set({ conversations: res.data, loadingConversations: false });
        } catch (e) {
          console.error('Failed to fetch conversations:', e);
          set({ loadingConversations: false });
        }
      },

      createConversation: async (workspaceId = null) => {
        try {
          const res = await axios.post(`${API}/conversations`, {
            workspace_id: workspaceId,
            title: 'New Chat',
          });
          set((state) => ({ conversations: [res.data, ...state.conversations] }));
          return res.data;
        } catch (e) {
          console.error('Failed to create conversation:', e);
          throw e;
        }
      },

      deleteConversation: async (id) => {
        try {
          await axios.delete(`${API}/conversations/${id}`);
          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
          }));
        } catch (e) {
          console.error('Failed to delete conversation:', e);
          throw e;
        }
      },

      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

      // Messages
      messages: [],
      loadingMessages: false,
      streamingMessage: null,

      fetchMessages: async (conversationId) => {
        set({ loadingMessages: true, messages: [] });
        try {
          const res = await axios.get(`${API}/messages?conversation_id=${conversationId}`);
          set({ messages: res.data, loadingMessages: false });
        } catch (e) {
          console.error('Failed to fetch messages:', e);
          set({ loadingMessages: false });
        }
      },

      addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
      },

      setStreamingMessage: (content) => set({ streamingMessage: content }),

      // Branches
      branches: [],
      currentBranch: 'main',

      fetchBranches: async (conversationId) => {
        try {
          const res = await axios.get(`${API}/conversations/${conversationId}/branches`);
          set({ branches: res.data });
        } catch (e) {
          console.error('Failed to fetch branches:', e);
        }
      },

      setCurrentBranch: (branch) => set({ currentBranch: branch }),

      createBranch: async (messageId, branchName, content) => {
        try {
          const res = await axios.post(`${API}/messages/${messageId}/fork`, {
            new_branch_name: branchName,
            new_content: content,
          });
          return res.data;
        } catch (e) {
          console.error('Failed to create branch:', e);
          throw e;
        }
      },

      // Tree data for git graph
      treeData: null,
      loadingTree: false,

      fetchTree: async (conversationId) => {
        set({ loadingTree: true });
        try {
          const res = await axios.get(`${API}/conversations/${conversationId}/tree`);
          set({ treeData: res.data, loadingTree: false });
        } catch (e) {
          console.error('Failed to fetch tree:', e);
          set({ loadingTree: false });
        }
      },

      // Chat with streaming simulation
      sending: false,

      sendMessage: async (conversationId, content, parentId = null, branchName = 'main', model = 'amazon.nova-pro-v1:0', canvasContext = null) => {
        set({ sending: true, streamingMessage: '' });
        const { token } = get();

        // Import canvas store actions dynamically to avoid circular deps
        const { useCanvasStore } = await import('./useCanvasStore');
        const canvasStore = useCanvasStore.getState();

        // Stream parsing state
        let inCanvas = false;
        let canvasBuffer = '';
        let chatBuffer = '';
        let streamingText = '';
        let currentCanvasLanguage = 'javascript';
        let generatedArtifacts = [];  // Track artifacts for embedding in message

        // Regex patterns for canvas tags
        const CANVAS_START_REGEX = /<canvas\s+lang="(\w+)">/;
        const CANVAS_END_TAG = '</canvas>';

        try {
          const response = await fetch(`${API}/chat/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              content,
              parent_id: parentId,
              branch_name: branchName,
              model,
              canvas_context: canvasContext
            })
          });

          if (!response.ok) throw new Error('Network response was not ok');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'meta') {
                    // Add user message
                    set((state) => ({
                      messages: [...state.messages, data.user_message],
                    }));
                  } else if (data.type === 'chunk') {
                    // Process chunk through stream router
                    let remaining = data.content;

                    while (remaining.length > 0) {
                      if (!inCanvas) {
                        // Look for canvas start tag
                        const startMatch = remaining.match(CANVAS_START_REGEX);

                        if (startMatch) {
                          // Found canvas start - output chat text before it
                          const beforeCanvas = remaining.slice(0, startMatch.index);
                          if (beforeCanvas) {
                            chatBuffer += beforeCanvas;
                            streamingText += beforeCanvas;
                            set({ streamingMessage: streamingText });
                          }

                          // Start canvas mode
                          inCanvas = true;
                          canvasBuffer = '';
                          const language = startMatch[1] || 'javascript';
                          currentCanvasLanguage = language;
                          canvasStore.startAIWriting(language);

                          // Skip past the tag
                          remaining = remaining.slice(startMatch.index + startMatch[0].length);
                        } else {
                          // No canvas tag - all goes to chat
                          chatBuffer += remaining;
                          streamingText += remaining;
                          set({ streamingMessage: streamingText });
                          remaining = '';
                        }
                      } else {
                        // In canvas mode - look for end tag
                        const endIndex = remaining.indexOf(CANVAS_END_TAG);

                        if (endIndex !== -1) {
                          // Found end tag
                          const canvasContent = remaining.slice(0, endIndex);
                          if (canvasContent) {
                            canvasBuffer += canvasContent;
                            canvasStore.appendContent(canvasContent);
                          }

                          // Exit canvas mode
                          inCanvas = false;
                          canvasStore.stopAIWriting();

                          // Save artifact to database (async, don't block)
                          const artifactData = {
                            content: canvasBuffer,
                            language: currentCanvasLanguage,
                            workspace_id: get().currentWorkspace?.id || null,
                            conversation_id: conversationId
                          };

                          // Save via API
                          fetch(`${API}/canvas`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(artifactData)
                          })
                            .then(res => res.json())
                            .then(savedArtifact => {
                              generatedArtifacts.push({
                                artifactId: savedArtifact.artifact_id,
                                content: canvasBuffer,
                                language: currentCanvasLanguage
                              });
                            })
                            .catch(err => console.error('Failed to save canvas artifact:', err));

                          // Add artifact placeholder to chat stream
                          const artifactPlaceholder = `\n\n[CANVAS_ARTIFACT:${currentCanvasLanguage}]\n\n`;
                          streamingText += artifactPlaceholder;
                          set({ streamingMessage: streamingText });

                          // Continue with text after </canvas>
                          remaining = remaining.slice(endIndex + CANVAS_END_TAG.length);
                        } else {
                          // No end tag yet - all goes to canvas
                          canvasBuffer += remaining;
                          canvasStore.appendContent(remaining);
                          remaining = '';
                        }
                      }
                    }
                  } else if (data.type === 'done') {
                    // Ensure canvas writing stops
                    if (inCanvas) {
                      canvasStore.stopAIWriting();
                    }

                    // Finalize
                    set((state) => ({
                      messages: [...state.messages, data.ai_message],
                      streamingMessage: null,
                      sending: false,
                    }));

                    // Refresh history
                    const { mode, currentWorkspace, fetchConversations } = get();
                    if (mode === 'workspace' && currentWorkspace) {
                      fetchConversations(currentWorkspace.id);
                    } else {
                      fetchConversations();
                    }
                  } else if (data.type === 'error') {
                    canvasStore.stopAIWriting();
                    toast.error(`Error: ${data.error}`);
                    set({ sending: false, streamingMessage: null });
                  }
                } catch (e) {
                  console.error('Error parsing stream:', e);
                }
              }
            }
          }
        } catch (e) {
          console.error('Failed to send message:', e);
          canvasStore.stopAIWriting();
          set({ sending: false, streamingMessage: null });
          toast.error('Failed to send message');
        }
      },

      // Regenerate response
      regenerateResponse: async (messageId) => {
        const { currentConversation, currentBranch, messages } = get();
        if (!currentConversation) return;

        // Find the user message before this AI message
        const msgIndex = messages.findIndex((m) => m.id === messageId);
        if (msgIndex <= 0) return;

        const userMessage = messages[msgIndex - 1];
        if (userMessage.role !== 'user') return;

        // Delete the AI message and resend
        try {
          await axios.delete(`${API}/messages/${messageId}`);
          set((state) => ({
            messages: state.messages.filter((m) => m.id !== messageId),
          }));

          // Resend with same content
          const { sendMessage } = get();
          await sendMessage(
            currentConversation.id,
            userMessage.content,
            userMessage.parent_id,
            currentBranch
          );
        } catch (e) {
          console.error('Failed to regenerate:', e);
        }
      },

      // Artifacts
      artifacts: [],
      loadingArtifacts: false,

      fetchArtifacts: async (workspaceId = null) => {
        set({ loadingArtifacts: true });
        try {
          const artifactsPromise = axios.get(workspaceId
            ? `${API}/artifacts?workspace_id=${workspaceId}`
            : `${API}/artifacts`
          );

          // Fetch visualizations if we have a workspace context
          const vizPromise = workspaceId
            ? axios.get(`${API}/workspaces/${workspaceId}/visualizations`)
            : Promise.resolve({ data: [] });

          const [resArtifacts, resViz] = await Promise.all([artifactsPromise, vizPromise]);

          set({ artifacts: [...resArtifacts.data, ...resViz.data], loadingArtifacts: false });
        } catch (e) {
          console.error('Failed to fetch artifacts:', e);
          set({ loadingArtifacts: false });
        }
      },

      // Files (RAG)
      files: [],
      uploadFile: async (workspaceId, file) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('workspace_id', workspaceId);
          const res = await axios.post(`${API}/files/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set((state) => ({ files: [...state.files, res.data] }));
          return res.data;
        } catch (e) {
          console.error('Failed to upload file:', e);
          throw e;
        }
      },

      fetchFiles: async (workspaceId) => {
        try {
          const res = await axios.get(`${API}/files?workspace_id=${workspaceId}`);
          set({ files: res.data });
        } catch (e) {
          console.error('Failed to fetch files:', e);
        }
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'synapsbranch-storage',
      partialize: (state) => ({ theme: state.theme, token: state.token }),
    }
  )
);
