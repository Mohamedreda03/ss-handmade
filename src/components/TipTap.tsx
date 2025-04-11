import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { Dispatch, SetStateAction } from "react";
import Toolbar from "./Toolbar";
import Underline from "@tiptap/extension-underline";

export default function TipTap({
  onChange,
  content,
}: {
  onChange: Dispatch<SetStateAction<string>>;
  content: string;
}) {
  const handleOnChange = (newContent: string) => {
    onChange(newContent);
  };
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: {
        class:
          "border dark:border-primary/30 border-secondary/50 w-full p-3 min-h-[400px] outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      handleOnChange(editor.getHTML());
    },
    content: content,
  });
  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
