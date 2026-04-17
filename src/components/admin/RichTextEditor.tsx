"use client";

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Type, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, 
  Link as LinkIcon, Undo, Redo, Eraser, Palette
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addLink = useCallback(() => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-t-lg">
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setTextColor('#ef4444')}
            className="w-4 h-4 rounded-full bg-red-500 border border-white/20 hover:scale-110 transition-transform"
            title="Red Text"
          />
          <button
            onClick={() => setTextColor('#3b82f6')}
            className="w-4 h-4 rounded-full bg-blue-500 border border-white/20 hover:scale-110 transition-transform"
            title="Blue Text"
          />
          <button
            onClick={() => setTextColor('#10b981')}
            className="w-4 h-4 rounded-full bg-emerald-500 border border-white/20 hover:scale-110 transition-transform"
            title="Green Text"
          />
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Clear Color"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-1 px-2">
        <button
          onClick={addLink}
          className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-slate-900 dark:text-slate-100',
      },
    },
  });

  // Ensure content syncs when prop changes from outside
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col w-full border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 shadow-sm overflow-hidden min-h-[400px]">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
