
import React, { useState, useEffect } from 'react';
import { editImage } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon } from './icons';

interface ImageEditorProps {
  initialImage: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ initialImage }) => {
  const [baseImage, setBaseImage] = useState<string | null>(initialImage || null);
  const [baseImageType, setBaseImageType] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Add a retro filter');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBaseImage(initialImage);
    setEditedImage(null);
  }, [initialImage]);
  
  const fileToBase64 = (file: File): Promise<{base64: string, type: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve({ base64, type: file.type });
      };
      reader.onerror = error => reject(error);
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const {base64, type} = await fileToBase64(file);
        setBaseImage(base64);
        setBaseImageType(type);
        setEditedImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to read the image file.");
      }
    }
  };
  
  const handleEdit = async () => {
    if (!baseImage || !prompt) {
      setError('Please provide a base image and a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      // If the initial image is from a URL, we need to fetch and convert it first.
      // For this app, we'll assume the initialImage prop is already a data URL or can be used directly if it's not a user upload.
      // A more robust solution would handle URL fetching. Here we just handle user uploads.
      const imageToEdit = baseImage;
      const mimeType = baseImageType || 'image/png'; // Default MIME type
      const newImage = await editImage(imageToEdit, mimeType, prompt);
      setEditedImage(newImage);
    } catch (err) {
      console.error(err);
      setError('Failed to edit the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Image Editor</h2>
        <p className="text-text-secondary mt-1">Modify an image with a simple instruction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <label htmlFor="image-upload" className="block text-sm font-medium text-text-primary mb-2">
                {baseImage ? 'Change Image' : 'Upload Image'}
            </label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-base hover:bg-gray-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                    </div>
                    <input id="image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"/>
                </label>
            </div>
            {baseImage && (
                <div>
                    <h3 className="text-md font-semibold text-text-primary mb-2">Original Image</h3>
                    <img src={baseImageType ? `data:${baseImageType};base64,${baseImage}`: baseImage} alt="Base" className="rounded-lg w-full object-contain max-h-64" />
                </div>
            )}
        </div>
        <div className="space-y-4">
            <div className="w-full">
                <label htmlFor="edit-prompt" className="block text-sm font-medium text-text-primary mb-2">
                    Editing Instruction
                </label>
                <input
                    id="edit-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Make the sky purple"
                    className="w-full px-4 py-2 bg-base rounded-md border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                    disabled={loading || !baseImage}
                />
            </div>
            <button
                onClick={handleEdit}
                disabled={loading || !baseImage || !prompt}
                className="w-full px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? 'Editing...' : 'Apply Edit'}
            </button>
            {loading ? <Spinner message="Applying your edit..."/> : editedImage && (
                <div>
                    <h3 className="text-md font-semibold text-text-primary mb-2">Edited Image</h3>
                    <img src={`data:image/png;base64,${editedImage}`} alt="Edited" className="rounded-lg w-full object-contain max-h-64" />
                </div>
            )}
        </div>
      </div>
       {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default ImageEditor;
