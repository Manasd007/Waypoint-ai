"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditTextProps {
  text: string;
  onSave: (text: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  type?: "input" | "textarea";
  placeholder?: string;
  label?: string;
}

const EditText = ({
  text,
  onSave,
  isEditing,
  onToggleEdit,
  type = "input",
  placeholder,
  label,
}: EditTextProps) => {
  const [textContent] = useState(text);

  const handleSave = () => {
    onSave(textContent);
    onToggleEdit();
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        {type === "textarea" ? (
          <Textarea
            value={textContent}
            placeholder={placeholder}
            className="min-h-[100px]"
          />
        ) : (
          <Input value={textContent} placeholder={placeholder} />
        )}
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
          <Button onClick={onToggleEdit} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{text}</p>
        <Button onClick={onToggleEdit} variant="ghost" size="sm">
          Edit
        </Button>
      </div>
    </div>
  );
};

export default EditText;
