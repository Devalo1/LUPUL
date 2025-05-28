import React, { useState, useRef } from "react";
import {
  Upload,
  File,
  Download,
  Eye,
  Trash2,
  Camera,
  Image,
} from "lucide-react";
import { DocumentAttachment } from "../../types/accounting";

interface DocumentUploadProps {
  documentType: "zreport" | "settlement" | "invoice" | "stock" | "calendar";
  attachments: DocumentAttachment[];
  canEdit: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  onView: (attachment: DocumentAttachment) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  attachments,
  canEdit,
  onUpload,
  onDelete,
  onView,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !canEdit) return;

    const fileArray = Array.from(files);

    // Validare tipuri de fișiere
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const validFiles = fileArray.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipul de fișier ${file.type} nu este permis`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert(`Fișierul ${file.name} este prea mare (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploading(true);
      try {
        await onUpload(validFiles);
      } catch (error) {
        console.error("Error uploading files:", error);
        alert("Eroare la încărcarea fișierelor");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case "zreport":
        return "Z Report";
      case "settlement":
        return "Reconciliere";
      case "invoice":
        return "Factură";
      case "stock":
        return "Stoc";
      default:
        return "Document";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-900">
          Documente {getDocumentTypeLabel()}
        </h4>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <Upload className="w-4 h-4 mr-1" />
              Încarcă fișier
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
            >
              <Camera className="w-4 h-4 mr-1" />
              Fotografiază
            </button>
          </div>
        )}
      </div>

      {/* File input pentru încărcare normală */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* File input pentru cameră */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop zone */}
      {canEdit && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Trage fișierele aici sau{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              selectează din calculator
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Acceptă: JPG, PNG, PDF, DOC, XLS (max 10MB)
          </p>
        </div>
      )}

      {/* Loading state */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Se încarcă...</span>
        </div>
      )}

      {/* Lista documentelor */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Documente atașate ({attachments.length})
          </h5>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)} •{" "}
                      {new Date(attachment.uploadedAt).toLocaleDateString(
                        "ro-RO"
                      )}
                    </p>
                    {attachment.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attachment.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(attachment)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                    title="Vizualizează"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={attachment.url}
                    download={attachment.originalName}
                    className="p-1 text-green-600 hover:text-green-700"
                    title="Descarcă"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => onDelete(attachment.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Șterge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <File className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">Nu sunt documente atașate</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
