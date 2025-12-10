import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FileUploadModal = ({ onClose }) => {
  const { currentWorkspace, uploadFile, currentConversation } = useStore();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const workspaceId = currentWorkspace?.id || currentConversation?.workspace_id;
    if (!workspaceId) {
      toast.error('Please select a workspace first');
      return;
    }

    setUploading(true);
    try {
      await uploadFile(workspaceId, file);
      toast.success('File uploaded successfully');
      onClose();
    } catch (e) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in max-w-md"
        onClick={(e) => e.stopPropagation()}
        data-testid="file-upload-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Upload File</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-[hsl(239,84%,67%)] bg-[hsl(239,84%,67%)]/5' : 'border-border'
            }`}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="w-10 h-10 mx-auto text-[hsl(239,84%,67%)]" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">PDF, TXT, MD files supported</p>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.py,.js,.ts,.json"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Files will be used as context for AI conversations in this workspace.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(239,84%,67%)] text-white rounded-lg hover:bg-[hsl(239,84%,60%)] disabled:opacity-50 transition-colors"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
