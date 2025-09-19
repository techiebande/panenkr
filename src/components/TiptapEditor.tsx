"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useEffect, useMemo, useRef, useState } from 'react';

// Minimal, fast, production-ready editor with a basic toolbar for short summaries
export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Write a short summary...",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, HTMLAttributes: { class: 'rounded-md' } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-3 min-h-28",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Prevent SSR hydration mismatch in Next.js
    immediatelyRender: false,
  });

  // Force toolbar re-render on selection/updates so active state reflects
  const [, setTbTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => setTbTick((t) => (t + 1) % 1000);
    editor.on('selectionUpdate', update);
    editor.on('update', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('update', update);
    };
  }, [editor]);

  // Hooks must be declared unconditionally before any returns
  const [showHelp, setShowHelp] = useState(false);
  const [openQuick, setOpenQuick] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const Toolbar = useMemo(() => {
    if (!editor) return null;

    const btnBase =
      "inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors select-none";
    const btnActive = "bg-primary/10 border-primary/20 text-primary";
    const btnIdle = "bg-background border-border hover:bg-muted text-foreground";

    const Button = ({
      onClick,
      active,
      disabled,
      label,
    }: {
      onClick: () => void;
      active?: boolean;
      disabled?: boolean;
      label: string;
    }) => (
      <button
        type="button"
        aria-label={label}
        disabled={!!disabled}
        onClick={onClick}
        className={[btnBase, active ? btnActive : btnIdle, disabled ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
      >
        {label}
      </button>
    );

    const setLink = () => {
      const prev = editor.getAttributes('link').href as string | undefined;
      const url = window.prompt('Enter URL', prev || 'https://');
      if (url === null) return;
      if (url === '') {
        editor.chain().focus().unsetLink().run();
      } else {
        editor.chain().focus().setLink({ href: url, target: '_blank', rel: 'noreferrer' }).run();
      }
    };

    const onPickImage = () => {
      if (!fileInputRef.current) return;
      fileInputRef.current.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) return;
      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      e.target.value = '';
    };

    return (
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b bg-background/70">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <Button label="B" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Button label="I" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Button label="U" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <Button label="S" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <Button label="HL" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} />
        <span className="mx-1 w-px bg-border" />
        <Button label="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Button label="H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <span className="mx-1 w-px bg-border" />
        <Button label="•" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Button label="1." active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <Button label="☑" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <span className="mx-1 w-px bg-border" />
        <Button label="❝" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Button label="HR" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <span className="mx-1 w-px bg-border" />
        <Button label="Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <Button label="Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <Button label="Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <span className="mx-1 w-px bg-border" />
        <Button label="Link" active={editor.isActive('link')} onClick={setLink} />
        <Button label="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} />
        <Button label="Img" onClick={onPickImage} />
        <span className="mx-1 w-px bg-border" />
        <Button label="Clear" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
        <span className="mx-1 w-px bg-border" />
        <Button label="Undo" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()} />
        <Button label="Redo" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()} />
      </div>
    );
  }, [editor]);

  // Configure slash menu key handler (unconditional hook; guarded inside)
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        handleKeyDown: (_view, event) => {
          if (event.key === '/' && !event.shiftKey) {
            setOpenQuick(true);
          }
          return false;
        },
      },
    });
  }, [editor]);

  if (!editor) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">{placeholder}</div>
        <div className="rounded-md border p-3 text-sm text-muted-foreground">Loading editor…</div>
      </div>
    );
  }

  const QuickMenu = () => (
    <div className="absolute z-50 mt-2 w-64 rounded-md border bg-popover p-2 shadow" onMouseDown={(e) => e.preventDefault()}>
      <div className="text-xs text-muted-foreground mb-1">Quick insert</div>
      <div className="grid grid-cols-2 gap-1">
        <button className="rounded px-2 py-1 hover:bg-muted" onClick={() => { editor?.chain().focus().toggleHeading({ level: 2 }).run(); setOpenQuick(false); }}>H2</button>
        <button className="rounded px-2 py-1 hover:bg-muted" onClick={() => { editor?.chain().focus().toggleHeading({ level: 3 }).run(); setOpenQuick(false); }}>H3</button>
        <button className="rounded px-2 py-1 hover:bg-muted" onClick={() => { editor?.chain().focus().toggleBulletList().run(); setOpenQuick(false); }}>• List</button>
        <button className="rounded px-2 py-1 hover:bg-muted" onClick={() => { editor?.chain().focus().toggleOrderedList().run(); setOpenQuick(false); }}>1. List</button>
        <button className="rounded px-2 py-1 hover:bg-muted" onClick={() => { editor?.chain().focus().toggleBlockquote().run(); setOpenQuick(false); }}>Quote</button>
        <button className="rounded px-2 py-1 hover:bg-muted" onClick={() => { editor?.chain().focus().setHorizontalRule().run(); setOpenQuick(false); }}>HR</button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-2 rounded-md border bg-background/50 relative">
      <div className="px-2 pt-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>{placeholder}</span>
        <button type="button" className="text-[11px] underline" onClick={() => setShowHelp((s) => !s)}>
          {showHelp ? 'Hide shortcuts' : 'Show shortcuts'}
        </button>
      </div>
      {Toolbar}
      <EditorContent editor={editor} className="tiptap-content" />
      {openQuick && (
        <div className="px-2" onKeyDown={(e) => { if (e.key === 'Escape') setOpenQuick(false); }}>
          <QuickMenu />
        </div>
      )}
      {showHelp && (
        <div className="px-3 pb-2 text-xs text-muted-foreground space-y-1">
          <div>Bold: Cmd/Ctrl+B, Italic: Cmd/Ctrl+I, Underline: Cmd/Ctrl+U</div>
          <div>Bullet list: type &quot;- &quot; or use toolbar; Ordered list: type &quot;1. &quot;</div>
          <div>Quote: type &quot;&gt; &quot;, HR: type &quot;---&quot;</div>
          <div>Slash menu: type &quot;/&quot; to open quick insert</div>
        </div>
      )}
    </div>
  );
}
