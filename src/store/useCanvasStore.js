import { create } from 'zustand';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useCanvasStore = create((set, get) => ({
    // Canvas State
    isOpen: false,
    mode: 'split',                    // 'code' | 'preview' | 'split'
    language: 'html',                 // Editor language
    content: '',                      // Current editor content

    // Version Control
    versions: [],                     // [{id, content, language, timestamp, saved}]
    currentVersionIndex: -1,

    // Artifact Reference
    artifactId: null,                 // DB ID
    workspaceId: null,                // Associated workspace
    conversationId: null,             // Associated conversation

    // Loading States
    saving: false,
    loadingVersions: false,

    // AI Streaming State
    isAIWriting: false,
    aiWritingLanguage: null,

    // ============= ACTIONS =============

    openCanvas: (content = '', language = 'html', workspaceId = null, conversationId = null) => {
        const existingVersions = get().versions;
        const newVersion = {
            id: Date.now(),
            content,
            language,
            timestamp: new Date().toISOString(),
            saved: false
        };

        set({
            isOpen: true,
            content,
            language,
            workspaceId,
            conversationId,
            versions: [...existingVersions, newVersion],
            currentVersionIndex: existingVersions.length
        });
    },

    closeCanvas: () => {
        set({ isOpen: false });
    },

    toggleCanvas: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen });
    },

    setMode: (mode) => {
        set({ mode });
    },

    setLanguage: (language) => {
        set({ language });
    },

    updateContent: (content) => {
        set({ content });
    },

    // ============= AI STREAMING CONTROL =============

    startAIWriting: (language = null) => {
        const { isOpen } = get();
        // Auto-open canvas if not open
        if (!isOpen) {
            set({ isOpen: true, content: '', isAIWriting: true, aiWritingLanguage: language });
        } else {
            // Clear content and start fresh for new AI generation
            set({ content: '', isAIWriting: true, aiWritingLanguage: language });
        }
        if (language) {
            set({ language });
        }
    },

    stopAIWriting: () => {
        set({ isAIWriting: false, aiWritingLanguage: null });
    },

    appendContent: (chunk) => {
        set((state) => ({ content: state.content + chunk }));
    },

    // ============= VERSION CONTROL =============

    saveVersion: async () => {
        const { content, language, versions, workspaceId, conversationId, artifactId } = get();

        set({ saving: true });

        try {
            const token = localStorage.getItem('token');

            // Save to backend
            const endpoint = artifactId
                ? `${API}/canvas/${artifactId}/versions`
                : `${API}/canvas`;

            const res = await axios.post(endpoint, {
                content,
                language,
                workspace_id: workspaceId,
                conversation_id: conversationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newVersion = {
                id: res.data.version_id || Date.now(),
                content,
                language,
                timestamp: new Date().toISOString(),
                saved: true
            };

            set({
                versions: [...versions, newVersion],
                currentVersionIndex: versions.length,
                artifactId: res.data.artifact_id || artifactId,
                saving: false
            });

            return res.data;
        } catch (e) {
            console.error('Failed to save canvas version:', e);
            set({ saving: false });
            throw e;
        }
    },

    restoreVersion: (index) => {
        const { versions } = get();
        if (index >= 0 && index < versions.length) {
            const version = versions[index];
            set({
                content: version.content,
                language: version.language,
                currentVersionIndex: index
            });
        }
    },

    undo: () => {
        const { currentVersionIndex } = get();
        if (currentVersionIndex > 0) {
            get().restoreVersion(currentVersionIndex - 1);
        }
    },

    redo: () => {
        const { currentVersionIndex, versions } = get();
        if (currentVersionIndex < versions.length - 1) {
            get().restoreVersion(currentVersionIndex + 1);
        }
    },

    // ============= LOAD ARTIFACT =============

    loadArtifact: async (artifactId) => {
        set({ loadingVersions: true });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/canvas/${artifactId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { content, language, versions, workspace_id, conversation_id } = res.data;

            set({
                isOpen: true,
                content,
                language,
                artifactId,
                workspaceId: workspace_id,
                conversationId: conversation_id,
                versions: versions || [],
                currentVersionIndex: (versions?.length || 1) - 1,
                loadingVersions: false
            });
        } catch (e) {
            console.error('Failed to load artifact:', e);
            set({ loadingVersions: false });
            throw e;
        }
    },

    // ============= RESET =============

    reset: () => {
        set({
            isOpen: false,
            mode: 'split',
            language: 'html',
            content: '',
            versions: [],
            currentVersionIndex: -1,
            artifactId: null,
            workspaceId: null,
            conversationId: null,
            saving: false,
            loadingVersions: false
        });
    }
}));
