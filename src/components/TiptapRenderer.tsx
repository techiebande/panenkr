"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'isomorphic-dompurify';

const TiptapRenderer = ({ content }: { content: string }) => {
  const safe = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  const editor = useEditor({
    editable: false,
    content: safe,
    extensions: [StarterKit],
    // Prevent SSR hydration mismatch in Next.js
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="prose prose-invert max-w-none">
        <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapRenderer;
