'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, X, AlertCircle } from 'lucide-react';

// Tipos de archivo de video permitidos
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// Tamaño máximo de archivo (500MB)
const FILE_SIZE = 2000;
const MAX_FILE_SIZE = FILE_SIZE * 1024 * 1024;
// function formatFileSize(sizeMB) {
//   if (sizeMB < 1024) {
//     return sizeMB.toFixed(2) + ' MB';
//   } else {
//     return (sizeMB / 1024).toFixed(2) + ' GB';
//   }
// }

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
}

export function VideoDropzone({
  onFileSelect,
  selectedFile,
  onClearFile,
}: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa MP4, WebM, OGG, MOV, AVI o MKV.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return (
        'El archivo es muy grande. Máximo ' + formatFileSize(MAX_FILE_SIZE)
      );
    }
    return null;
  }, []);

  // Manejar selección de archivo
  const handleFileChange = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  // Eventos de drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileChange(files[0]);
      }
    },
    [handleFileChange]
  );

  // Click para seleccionar archivo
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Input file change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileChange(files[0]);
      }
    },
    [handleFileChange]
  );

  // Formatear tamaño de archivo
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, []);

  return (
    <div className='w-full space-y-3'>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type='file'
        accept={ALLOWED_VIDEO_TYPES.join(',')}
        onChange={handleInputChange}
        className='hidden'
      />

      {/* Dropzone o archivo seleccionado */}
      {!selectedFile ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed p-8
            transition-all duration-300 flex flex-col items-center gap-4
            ${
              isDragging
                ? 'border-[#5FD3BC] bg-[#5FD3BC]/10'
                : 'border-white/20 hover:border-white/30 hover:bg-white/2'
            }
          `}
        >
          {/* Icono animado */}
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isDragging ? 'scale-110' : ''}
            `}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Upload
              className={`w-7 h-7 transition-colors duration-300 ${
                isDragging ? 'text-white' : 'text-white/60'
              }`}
            />
          </div>

          {/* Texto */}
          <div className='text-center'>
            <p className='text-sm font-medium text-white/80 mb-1'>
              {isDragging
                ? 'Suelta el video aquí'
                : 'Arrastra un video o haz clic para seleccionar'}
            </p>
            <p className='text-xs text-white/40'>
              MP4, WebM, OGG, MOV, AVI, MKV - Máximo{' '}
              {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        </div>
      ) : (
        // Archivo seleccionado
        <div
          className='relative rounded-2xl border-2 p-4 transition-all duration-300'
          style={{
            borderColor: '#5FD3BC',
            background:
              'linear-gradient(135deg, rgba(95, 211, 188, 0.08) 0%, rgba(95, 211, 188, 0.02) 100%)',
          }}
        >
          <div className='flex items-center gap-4'>
            {/* Icono de video */}
            <div
              className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-transparent border border-white/20'
            >
              <FileVideo className='w-6 h-6 text-white' />
            </div>

            {/* Info del archivo */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-white truncate'>
                {selectedFile.name}
              </p>
              <p className='text-xs text-white/50'>
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Botón eliminar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFile();
              }}
              className='w-8 h-8 rounded-full flex items-center justify-center
                bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70
                transition-all duration-200'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20'>
          <AlertCircle className='w-4 h-4 text-red-400 shrink-0' />
          <p className='text-xs text-red-400'>{error}</p>
        </div>
      )}
    </div>
  );
}
