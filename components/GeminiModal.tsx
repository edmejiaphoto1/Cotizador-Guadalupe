
import React, { useState } from 'react';
import { generateDescription } from '../services/geminiService';
import { STRINGS } from '../constants';
import type { Language } from '../App';
import { SparklesIcon } from './icons';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  language: Language;
}

const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose, onInsert, language }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const s = STRINGS[language];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedText('');
    try {
      const result = await generateDescription(prompt, language);
      setGeneratedText(result);
    } catch (error) {
      console.error(error);
      setGeneratedText(language === 'es' ? 'Error al generar.' : 'Error generating.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    onInsert(generatedText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl transform transition-all">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{s.geminiModalTitle}</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="gemini-prompt" className="block text-sm font-medium text-gray-700 mb-1">{s.geminiModalPrompt}</label>
            <textarea
              id="gemini-prompt"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={language === 'es' ? 'Ej: Piso para 2000 pies², 15 escalones, 2 descansos...' : 'e.g., Flooring for 2000 sq ft, 15 steps, 2 landings...'}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isLoading ? s.generating : s.geminiModalButton}
            </button>
          </div>

          {generatedText && (
            <div>
              <label htmlFor="gemini-result" className="block text-sm font-medium text-gray-700 mb-1">{s.geminiModalResult}</label>
              <textarea
                id="gemini-result"
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                value={generatedText}
                readOnly
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            {s.close}
          </button>
          <button
            onClick={handleInsert}
            disabled={!generatedText}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {s.insertDescription}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiModal;
