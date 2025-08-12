'use client';

import { useState, useCallback } from 'react';
import markdownToHtml from 'zenn-markdown-html';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';

interface ZennEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ZennEditor({ 
  value, 
  onChange, 
  placeholder = "記事の内容をMarkdown形式で入力してください...",
  className = "" 
}: ZennEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const renderPreview = () => {
    try {
      const html = markdownToHtml(value);
      // HTMLエスケープを解除してプレビュー表示
      const unescapedHtml = html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&');
      
      // PrismJSによるハイライトを実行（プレビュー表示後）
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Prism) {
          // python3エイリアスを設定
          if (window.Prism.languages.python && !window.Prism.languages.python3) {
            window.Prism.languages.python3 = window.Prism.languages.python;
          }
          
          window.Prism.highlightAll();
        }
      }, 200);
      
      return DOMPurify.sanitize(unescapedHtml);
    } catch (error) {
      console.error('Preview rendering error:', error);
      return '<p>プレビューの表示中にエラーが発生しました</p>';
    }
  };

  return (
    <div className={`zenn-editor ${className}`}>
      <style jsx global>{`
        .zenn-editor {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .zenn-editor-toolbar {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .zenn-editor-textarea {
          width: 100%;
          min-height: 500px;
          padding: 20px;
          border: 1px solid #e1e5e9;
          border-radius: 0;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          background: #fff;
        }
        
        .zenn-editor-textarea:focus {
          border-color: #3ea8ff;
          box-shadow: 0 0 0 1px #3ea8ff;
        }
        
        .zenn-editor-container {
          border: 1px solid #e1e5e9;
          border-radius: 0 0 8px 8px;
        }
        
        .zenn-editor-split {
          display: flex;
          height: 500px;
        }
        
        .zenn-editor-split .zenn-editor-textarea {
          border-right: 1px solid #e1e5e9;
          border-radius: 0;
          flex: 1;
          min-height: auto;
          height: 100%;
        }
        
        .zenn-preview {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #fff;
        }
      `}</style>
      
      <div className="zenn-editor-toolbar">
        <Button
          type="button"
          variant={mode === 'edit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('edit')}
        >
          編集
        </Button>
        <Button
          type="button"
          variant={mode === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('preview')}
        >
          プレビュー
        </Button>
        <Button
          type="button"
          variant={mode === 'split' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('split')}
        >
          分割表示
        </Button>
      </div>
      
      <div className="znc zenn-editor-container">
        {mode === 'edit' && (
          <textarea
            className="zenn-editor-textarea"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
          />
        )}
        
        {mode === 'preview' && (
          <div 
            className="zenn-preview"
            style={{ minHeight: '500px' }}
            dangerouslySetInnerHTML={{ __html: renderPreview() }}
          />
        )}
        
        {mode === 'split' && (
          <div className="zenn-editor-split">
            <textarea
              className="zenn-editor-textarea"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
            />
            <div 
              className="zenn-preview"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
          </div>
        )}
      </div>
    </div>
  );
}