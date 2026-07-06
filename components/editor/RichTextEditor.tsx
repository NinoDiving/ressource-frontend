'use client';

import { useEffect, useRef } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const tools = [
  { label: 'Titre', command: 'formatBlock', value: 'h2' },
  { label: 'Sous-titre', command: 'formatBlock', value: 'h3' },
  { label: 'B', command: 'bold' },
  { label: 'I', command: 'italic' },
  { label: 'U', command: 'underline' },
  { label: 'Liste', command: 'insertUnorderedList' },
  { label: '1.', command: 'insertOrderedList' },
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const updateValue = () => {
    onChange(editorRef.current?.innerHTML ?? '');
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateValue();
  };

  const addLink = () => {
    const url = window.prompt('URL du lien');
    if (!url) return;
    runCommand('createLink', url);
  };

  const addImage = () => {
    const url = window.prompt("URL de l'image");
    if (!url) return;
    runCommand('insertImage', url);
  };

  return (
    <div className="rounded-xl border border-grey/10 bg-[#F5F5F5]/50 overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-grey/10 bg-white/50 p-3">
        {tools.map((tool) => (
          <button
            key={`${tool.command}-${tool.value ?? ''}`}
            type="button"
            onClick={() => runCommand(tool.command, tool.value)}
            className="min-w-9 rounded-lg border border-grey/10 bg-white px-3 py-2 text-sm font-medium text-grey transition-all hover:bg-grey/5"
          >
            {tool.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="min-w-9 rounded-lg border border-grey/10 bg-white px-3 py-2 text-sm font-medium text-grey transition-all hover:bg-grey/5"
        >
          Lien
        </button>
        <button
          type="button"
          onClick={addImage}
          className="min-w-9 rounded-lg border border-grey/10 bg-white px-3 py-2 text-sm font-medium text-grey transition-all hover:bg-grey/5"
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => runCommand('removeFormat')}
          className="min-w-9 rounded-lg border border-grey/10 bg-white px-3 py-2 text-sm font-medium text-grey transition-all hover:bg-grey/5"
        >
          Nettoyer
        </button>
      </div>

      <div className="relative">
        {!value && placeholder ? (
          <span className="pointer-events-none absolute left-4 top-4 text-grey/40">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateValue}
          onBlur={updateValue}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            updateValue();
          }}
          className="rich-text-editor min-h-[250px] p-4 text-grey outline-none"
        />
      </div>
    </div>
  );
}
