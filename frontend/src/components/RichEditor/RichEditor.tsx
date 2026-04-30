import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import styles from "./RichEditor.module.scss";

interface Props {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean };

function Btn({ active, children, title, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      className={`${styles.btn} ${active ? styles.btnActive : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className={styles.sep} />;
}

export default function RichEditor({ label, value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder || "Rédigez votre contenu…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL du lien", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de l'image");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const is = (name: string, attrs?: object) => editor.isActive(name, attrs);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>

      <div className={styles.toolbar}>
        {/* Undo / Redo */}
        <Btn title="Annuler (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</Btn>
        <Btn title="Rétablir (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</Btn>
        <Sep />

        {/* Inline formatting */}
        <Btn title="Gras (Ctrl+B)" active={is("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
        <Btn title="Italique (Ctrl+I)" active={is("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
        <Btn title="Souligné (Ctrl+U)" active={is("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></Btn>
        <Btn title="Barré" active={is("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
        <Btn title="Surligner" active={is("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>✦</Btn>
        <Btn title="Code inline" active={is("code")} onClick={() => editor.chain().focus().toggleCode().run()}>`·`</Btn>
        <Sep />

        {/* Headings */}
        <Btn title="Titre 1" active={is("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Btn>
        <Btn title="Titre 2" active={is("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn title="Titre 3" active={is("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Sep />

        {/* Alignment */}
        <Btn title="Aligner à gauche" active={is("paragraph", { textAlign: "left" }) || is("heading", { textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>⬤←</Btn>
        <Btn title="Centrer" active={is("paragraph", { textAlign: "center" }) || is("heading", { textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>⬤⬤</Btn>
        <Btn title="Aligner à droite" active={is("paragraph", { textAlign: "right" }) || is("heading", { textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>→⬤</Btn>
        <Sep />

        {/* Lists & blocks */}
        <Btn title="Liste à puces" active={is("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• ≡</Btn>
        <Btn title="Liste numérotée" active={is("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. ≡</Btn>
        <Btn title="Citation" active={is("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</Btn>
        <Btn title="Bloc de code" active={is("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</Btn>
        <Btn title="Ligne horizontale" onClick={() => editor.chain().focus().setHorizontalRule().run()}>─</Btn>
        <Sep />

        {/* Links & media */}
        <Btn title="Lien" active={is("link")} onClick={addLink}>🔗</Btn>
        <Btn title="Image" onClick={addImage}>🖼</Btn>
        <Sep />

        {/* Clear */}
        <Btn title="Effacer la mise en forme" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>✕ fmt</Btn>
      </div>

      <EditorContent editor={editor} className={styles.editorArea} />
    </div>
  );
}
