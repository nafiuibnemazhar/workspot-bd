"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style"; // FIXED: Added { }
import { Color } from "@tiptap/extension-color";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Palette,
  Unlink,
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichEditor({
  value,
  onChange,
  placeholder,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-accent underline cursor-pointer",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-brand-primary placeholder:text-gray-400",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  // Function to add/edit links
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt(
      "Enter URL (e.g. https://google.com)",
      previousUrl
    );

    // cancelled
    if (url === null) return;

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-accent transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-2 bg-gray-50/50">
        {/* Headings */}
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 size={18} />}
          title="Heading 2"
        />
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon={<Heading3 size={18} />}
          title="Heading 3"
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text Style */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={<Bold size={16} />}
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={<Italic size={16} />}
        />

        {/* Color Picker (Hidden Input Trick) */}
        <label
          className={`p-2 rounded-lg cursor-pointer transition-colors ${
            editor.isActive("textStyle") ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
        >
          <Palette
            size={16}
            className={
              editor.isActive("textStyle")
                ? "text-brand-accent"
                : "text-gray-500"
            }
          />
          <input
            type="color"
            className="hidden"
            onInput={(event: any) =>
              editor.chain().focus().setColor(event.target.value).run()
            }
            value={editor.getAttributes("textStyle").color || "#000000"}
          />
        </label>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={<List size={16} />}
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={<ListOrdered size={16} />}
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <ToolbarBtn
          onClick={setLink}
          isActive={editor.isActive("link")}
          icon={<LinkIcon size={16} />}
        />
        {editor.isActive("link") && (
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            title="Remove Link"
          >
            <Unlink size={16} />
          </button>
        )}
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  onClick,
  isActive,
  icon,
  title,
}: {
  onClick: () => void;
  isActive: boolean;
  icon: any;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-brand-primary text-white shadow-sm"
          : "text-gray-500 hover:bg-gray-200 hover:text-brand-primary"
      }`}
    >
      {icon}
    </button>
  );
}
