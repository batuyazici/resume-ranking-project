import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, ButtonGroup } from "react-bootstrap";

import {
  ListUl,
  ListOl,
  TypeBold,
  TypeItalic,
  TypeH1,
  TypeH2,
  TypeH3,
  TypeH4,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { Paragraph } from "@tiptap/extension-paragraph";
import { mergeAttributes } from "@tiptap/core";

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Paragraph.extend({
        parseHTML() {
          return [{ tag: "div" }];
        },
        renderHTML({ HTMLAttributes }) {
          return [
            "div",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0,
          ];
        },
      }),
    ],
    content: "",
  });

  if (!editor) {
    return null;
  }
  return (
    <div>
      <ButtonGroup className="mb-2">
        <Button
          variant={editor.isActive("bold") ? "primary" : "secondary"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <TypeBold />
        </Button>
        <Button
          variant={editor.isActive("italic") ? "primary" : "secondary"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <TypeItalic />
        </Button>
        <Button
          variant={
            editor.isActive("heading", { level: 1 }) ? "primary" : "secondary"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <TypeH1 />
        </Button>
        <Button
          variant={
            editor.isActive("heading", { level: 2 }) ? "primary" : "secondary"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <TypeH2 />
        </Button>
        <Button
          variant={
            editor.isActive("heading", { level: 3 }) ? "primary" : "secondary"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <TypeH3 />
        </Button>
        <Button
          variant={
            editor.isActive("heading", { level: 4 }) ? "primary" : "secondary"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
        >
          <TypeH4 />
        </Button>
        <Button
          variant={editor.isActive("bulletList") ? "primary" : "secondary"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListUl />
        </Button>
        <Button
          variant={editor.isActive("orderedList") ? "primary" : "secondary"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOl />
        </Button>
      </ButtonGroup>
      <div
        className="border border-1 border-grey rounded p-0 mb-1"
        style={{ fontSize: "15px"}}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
