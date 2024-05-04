import React, { forwardRef, useImperativeHandle } from 'react';
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

const TiptapEditor = forwardRef((props, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false, // Disable the default Paragraph if customizing
      }),
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

  useImperativeHandle(ref, () => ({
    getJSON: () => editor ? editor.getJSON() : {},
    getHTML: () => editor ? editor.getHTML() : ''
  }));

  if (!editor) {
    return null;
  }

  return (
    <div className="mt-0 border-dark">
      <div
        className="editor-header border border-dark bg-light border-bottom rounded p-2"
      >
        <ButtonGroup className="button-group-big">
          <Button
            className="big-button"
            variant={
              editor.isActive("bold") ? "secondary" : "outline-secondary"
            }
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            <TypeBold size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("italic") ? "secondary" : "outline-secondary"
            }
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            <TypeItalic size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("heading", { level: 1 })
                ? "secondary"
                : "outline-secondary"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <TypeH1 size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("heading", { level: 2 })
                ? "secondary"
                : "outline-secondary"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <TypeH2 size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("heading", { level: 3 })
                ? "secondary"
                : "outline-secondary"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <TypeH3 size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("heading", { level: 4 })
                ? "secondary"
                : "outline-secondary"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
          >
            <TypeH4 size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("bulletList") ? "secondary" : "outline-secondary"
            }
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListUl size={20} />
          </Button>
          <Button
            className="big-button"
            variant={
              editor.isActive("orderedList") ? "secondary" : "outline-secondary"
            }
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOl size={20} />
          </Button>
        </ButtonGroup>
        <div
          className="editor-content border border-1 rounded p-2 mt-1"
          style={{ height: "auto", padding: "5px" }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default TiptapEditor;
