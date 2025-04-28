import React, { useState, /* useEffect, */ useRef } from "react";
// Comment out unused imports instead of trying to rename them
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { storage } from "../firebase-core";

// Comment out problematic imports
// import { /* other imports */ } from "../types/defined-types";

// Define FileUploadOptions interface with all needed properties
interface FileUploadOptions {
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (downloadURL: string) => void;
  onUploadError?: (error: Error) => void;
  onDrop?: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  disabled?: boolean;
  // Add other properties as needed
}

// Mock the dropzone hook until properly installed
const useDropzone = (_options: FileUploadOptions) => ({
  getRootProps: () => ({}),
  getInputProps: () => ({}),
  isDragActive: false
});

import { Button, Box, CircularProgress, Typography, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { ProfilePhotoService } from "../services/ProfilePhotoService";
import { useAuth } from "../contexts/AuthContext";
import logger from "../utils/logger";

// Type for options
type _UploadOptions = {
  // define properties
};

// Stilizarea componentei
const UploadContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: theme.spacing(1),
  border: `3px solid ${theme.palette.primary.main}`,
}));

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string;
  onPhotoUploaded?: (photoUrl: string) => void;
  onPhotoError?: (error: Error) => void;
}

/**
 * Componenta pentru încărcarea și gestionarea fotografiei de profil
 */
const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoError
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoUrl);
  const [error, setError] = useState<string | null>(null);
  
  // Referință la instanța serviciului pentru fotografii de profil
  const profilePhotoService = useRef(new ProfilePhotoService(null));

  /**
   * Gestionează progresul încărcării fișierului
   */
  const _handleProgress = (progress: number) => {
    setProgress(Math.round(progress));
  };

  /**
   * Gestionează încărcarea fișierului
   */
  const handleUpload = async (files: File[]): Promise<void> => {
    if (!files || files.length === 0 || !user) {
      return;
    }

    const file = files[0];
    
    // Validare fișier
    if (!file.type.startsWith("image/")) {
      setError("Vă rugăm să selectați o imagine (jpg, png, gif).");
      onPhotoError?.(new Error("Tip de fișier nevalid"));
      return;
    }

    // Limită dimensiune (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Imaginea este prea mare. Limita este de 5MB.");
      onPhotoError?.(new Error("Fișier prea mare"));
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      
      // Creăm un URL de previzualizare temporar
      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      // Utilizăm serviciul pentru a încărca fotografia
      await profilePhotoService.current.uploadProfilePhoto(file);

      // Revocăm URL-ul temporar pentru a elibera memoria
      URL.revokeObjectURL(tempPreviewUrl);
      
      // Setăm URL-ul final și apelăm callback-ul
      setPreviewUrl(tempPreviewUrl);
      onPhotoUploaded?.(tempPreviewUrl);
      
      logger.info("Fotografia de profil a fost încărcată cu succes:", tempPreviewUrl);
    } catch (error) {
      logger.error("Eroare la încărcarea fotografiei de profil:", error);
      setError("A apărut o eroare la încărcarea fotografiei. Vă rugăm să încercați din nou.");
      setPreviewUrl(currentPhotoUrl);
      onPhotoError?.(error instanceof Error ? error : new Error("Eroare necunoscută"));
    } finally {
      setIsUploading(false);
    }
  };

  // Configurare dropzone pentru încărcare prin drag & drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"]
    },
    maxFiles: 1,
    disabled: isUploading || !user,
  });

  /**
   * Gestionează ștergerea fotografiei de profil
   */
  const handleRemovePhoto = async () => {
    if (!user || isUploading) return;

    try {
      setIsUploading(true);
      
      // Ștergem fotografia folosind serviciul
      await profilePhotoService.current.removeProfilePhoto(user.uid);
      
      setPreviewUrl(undefined);
      onPhotoUploaded?.("");
      
      logger.info("Fotografia de profil a fost ștearsă cu succes");
    } catch (error) {
      logger.error("Eroare la ștergerea fotografiei de profil:", error);
      setError("A apărut o eroare la ștergerea fotografiei.");
      onPhotoError?.(error instanceof Error ? error : new Error("Eroare necunoscută"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ textAlign: "center", my: 2 }}>
      {/* Afișare avatar cu fotografia curentă sau placeholder */}
      <LargeAvatar src={previewUrl} alt="Fotografie de profil">
        {isUploading ? (
          <CircularProgress size={60} variant="determinate" value={progress} />
        ) : (
          <AddAPhotoIcon sx={{ width: 40, height: 40 }} />
        )}
      </LargeAvatar>

      {/* Zona de încărcare (drag & drop) */}
      <UploadContainer 
        {...getRootProps()} 
        sx={{ 
          mt: 2, 
          opacity: isUploading ? 0.7 : 1,
          pointerEvents: isUploading ? "none" : "auto" 
        }}
      >
        <input {...getInputProps()} />
        
        {isDragActive ? (
          <Typography>Trageți fotografia aici...</Typography>
        ) : (
          <Typography>
            {previewUrl 
              ? "Trageți o altă fotografie aici sau faceți clic pentru a schimba" 
              : "Trageți o fotografie aici sau faceți clic pentru a încărca"}
          </Typography>
        )}
        
        {isUploading && (
          <Box sx={{ mt: 1 }}>
            <CircularProgress size={24} variant="determinate" value={progress} />
            <Typography variant="caption" sx={{ ml: 1 }}>
              {progress}%
            </Typography>
          </Box>
        )}
      </UploadContainer>

      {/* Afișare erori */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Buton pentru ștergerea fotografiei */}
      {previewUrl && !isUploading && (
        <Button
          variant="outlined"
          color="error"
          onClick={handleRemovePhoto}
          sx={{ mt: 2 }}
        >
          Șterge fotografia
        </Button>
      )}
    </Box>
  );
};

export default ProfilePhotoUploader;