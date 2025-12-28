"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import ImageExtension from "@tiptap/extension-image"; // NEW
import { supabase } from "@/lib/supabase"; // Needed for upload
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
  ImageIcon,
} from "lucide-react";
import { useCallback } from "react";

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
      ImageExtension, // Enable Images
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
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 text-brand-primary placeholder:text-gray-400 [&_img]:rounded-xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:max-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // NEW: Handle Image Upload inside Editor
  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const fileName = `content-${Date.now()}-${file.name}`;

        // 1. Upload
        const { error } = await supabase.storage
          .from("blog-images")
          .upload(fileName, file);

        if (error) {
          alert("Upload failed");
          return;
        }

        // 2. Get URL
        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        // 3. Ask for Alt Text (SEO)
        const altText = window.prompt(
          "Describe this image for SEO (Alt Text):",
          ""
        );

        // 4. Insert into Editor
        if (editor) {
          editor
            .chain()
            .focus()
            .setImage({ src: data.publicUrl, alt: altText || "" })
            .run();
        }
      }
    };

    input.click();
  }, [editor]);

  if (!editor) return null;

  // Function to add/edit links
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-accent transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-2 bg-gray-50/50 sticky top-0 z-10">
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 size={18} />}
          title="H2 Heading"
        />
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon={<Heading3 size={18} />}
          title="H3 Heading"
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

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

        {/* Color Picker */}
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

        <ToolbarBtn
          onClick={setLink}
          isActive={editor.isActive("link")}
          icon={<LinkIcon size={16} />}
        />

        {/* NEW: Image Button */}
        <ToolbarBtn
          onClick={addImage}
          isActive={false}
          icon={<ImageIcon size={16} />}
          title="Insert Image"
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
