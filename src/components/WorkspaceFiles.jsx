import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Upload, File, Trash2, FileText, Image as ImageIcon, Code } from 'lucide-react';
import { toast } from 'sonner';

const WorkspaceFiles = ({ workspaceId }) => {
    const { files, uploadFile, fetchFiles } = useStore();
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        await handleUpload(droppedFiles);
    };

    const handleFileSelect = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        await handleUpload(selectedFiles);
    };

    const handleUpload = async (filesList) => {
        setUploading(true);
        try {
            for (const file of filesList) {
                await uploadFile(workspaceId, file);
            }
            toast.success(`${filesList.length} file(s) uploaded`);
            fetchFiles(workspaceId);
        } catch (e) {
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return <ImageIcon className="w-5 h-5" />;
        } else if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp'].includes(ext)) {
            return <Code className="w-5 h-5" />;
        } else {
            return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
            >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                </p>
                <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm"
                >
                    {uploading ? 'Uploading...' : 'Choose Files'}
                </label>
            </div>

            {/* Files List */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Uploaded Files</h4>
                {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                        No files uploaded yet
                    </p>
                ) : (
                    <div className="space-y-2">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getFileIcon(file.filename)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.filename}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        // TODO: Implement delete functionality
                                        toast.info('Delete functionality coming soon');
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 text-destructive rounded transition-all"
                                    title="Delete file"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceFiles;
