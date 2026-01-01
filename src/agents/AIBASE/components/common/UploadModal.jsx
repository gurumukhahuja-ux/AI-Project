import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const UploadModal = ({ isOpen, onClose, onUpload, isUploading }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const validateFile = (selectedFile) => {
        setError(null);
        if (!selectedFile) return false;

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            const msg = `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
            setError(msg);
            toast.error(msg);
            return false;
        }
        return true;
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            } else {
                setFile(null); // Clear invalid file
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            } else {
                setFile(null);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSubmit = () => {
        if (file && !error) {
            onUpload(file);
        }
    };

    const reset = () => {
        setFile(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Knowledge</h3>
                    <button
                        onClick={reset}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isUploading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drop Zone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}
                        ${error ? 'border-red-300 bg-red-50' : ''}
                        ${file ? 'border-green-300 bg-green-50' : ''}
                    `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {file ? (
                        <div className="flex flex-col items-center gap-2 text-green-700">
                            <FileText className="w-10 h-10" />
                            <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs opacity-75">{(file.size / 1024 / 1024).toFixed(2)} MB / {MAX_FILE_SIZE_MB} MB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Upload className="w-10 h-10 mb-2 text-gray-400" />
                            <p className="font-medium">Click to browse or drag file here</p>
                            <p className="text-xs text-center text-gray-500 max-w-[200px] leading-relaxed">
                                Supported: All formats (PDF, DOCX, PPT, Excel, Images, Video)
                                <span className="block font-medium text-primary mt-1">(Max 50MB)</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Error / Status Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={reset} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!file || !!error || isUploading}
                        className="min-w-[100px]"
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default UploadModal;
