import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Copy, Search, RotateCcw, Code, FileText, Moon, Sun } from 'lucide-react';
import JsonView from '@uiw/react-json-view';
import Highlighter from 'react-highlight-words';

interface URLToolProps {}

const URLTool: React.FC<URLToolProps> = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  }, []);

  // Check if the output is valid JSON
  const jsonData = useMemo(() => {
    try {
      if (outputText.trim()) {
        return JSON.parse(outputText);
      }
    } catch {
      // Not valid JSON
    }
    return null;
  }, [outputText]);

  const isValidJSON = jsonData !== null;

  const handleEncode = useCallback(() => {
    try {
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
    } catch (error) {
      setOutputText('Error: Invalid input for encoding');
    }
  }, [inputText]);

  const handleDecode = useCallback(() => {
    try {
      // First replace + with spaces, then decode
      const preprocessed = inputText.replace(/\+/g, ' ');
      const decoded = decodeURIComponent(preprocessed);
      setOutputText(decoded);
    } catch (error) {
      setOutputText('Error: Invalid URL-encoded string');
    }
  }, [inputText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, [outputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setSearchTerm('');
  }, []);

  const renderOutput = () => {
    if (!outputText) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
          <FileText className="w-8 h-8 mr-2" />
          <span>Output will appear here...</span>
        </div>
      );
    }

    if (isValidJSON && jsonData) {
      return (
        <div className="json-viewer-container">
          <JsonView
            value={jsonData}
            theme={isDarkMode ? "dark" : "light"}
            rootName={false}
            enableClipboard={false}
            style={{
              backgroundColor: 'transparent',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
             lineHeight: '1.5',
             padding: '8px',
            }}
           collapsed={1}
           displayDataTypes={true}
           displayObjectSize={true}
           quotesOnKeys={false}
           sortKeys={false}
          />
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100">
        {searchTerm ? (
          <Highlighter
            highlightClassName="bg-yellow-200 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-900 rounded px-1"
            searchWords={[searchTerm]}
            autoEscape={true}
            textToHighlight={outputText}
          />
        ) : (
          outputText
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 relative">
            <Code className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">URL Encode/Decode Tool</h1>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="absolute right-0 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encode and decode URL strings with automatic JSON formatting and search functionality.
            Perfect for debugging APIs, working with query parameter, and data processing.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Input
              </h2>
              <button
                onClick={handleClear}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Clear all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to encode or URL-encoded string to decode..."
              className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleEncode}
                disabled={!inputText.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Code className="w-4 h-4" />
                Encode
              </button>
              <button
                onClick={handleDecode}
                disabled={!inputText.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Decode
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Output
                {isValidJSON && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    JSON
                  </span>
                )}
              </h2>
              {outputText && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    copySuccess
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {/* Search Box */}
            {outputText && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search in output..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  />
                </div>
              </div>
            )}

            {/* Output Display */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-48 max-h-96 overflow-auto border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              {renderOutput()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
          <p>Tip: This tool automatically detects and formats JSON output for better readability.</p>
        </div>
      </div>
    </div>
  );
};

export default URLTool;