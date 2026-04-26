"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";

interface PollData {
  question: string;
  options: { id: string; text: string }[];
  allowMultiple: boolean;
}

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendPoll: (poll: any) => void;
  initialPoll?: PollData;
  isEditing?: boolean;
}

export function CreatePollDialog({ open, onOpenChange, onSendPoll, initialPoll, isEditing }: CreatePollDialogProps) {
  const [question, setQuestion] = useState(initialPoll?.question ?? "");
  const [options, setOptions] = useState(
    initialPoll?.options?.length
      ? initialPoll.options
      : [{ id: "1", text: "" }, { id: "2", text: "" }]
  );
  const [allowMultiple, setAllowMultiple] = useState(initialPoll?.allowMultiple ?? false);

  // Sync state when the dialog opens (e.g. editing a different poll)
  useEffect(() => {
    if (open) {
      setQuestion(initialPoll?.question ?? "");
      setOptions(
        initialPoll?.options?.length
          ? initialPoll.options
          : [{ id: "1", text: "" }, { id: "2", text: "" }]
      );
      setAllowMultiple(initialPoll?.allowMultiple ?? false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleAddOption = () => {
    if (options.length >= 12) return; // limit to 12 options
    setOptions([...options, { id: crypto.randomUUID(), text: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleCreate = () => {
    const validOptions = options.filter(o => o.text.trim());
    if (!question.trim() || validOptions.length < 2) return;

    onSendPoll({
      question: question.trim(),
      options: validOptions.map(o => ({ id: o.id, text: o.text.trim() })),
      allowMultiple
    });

    // Reset
    setQuestion("");
    setOptions([{ id: "1", text: "" }, { id: "2", text: "" }]);
    setAllowMultiple(false);
    onOpenChange(false);
  };

  const isValid = question.trim() && options.filter(o => o.text.trim()).length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Poll" : "Create a Poll"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="Ask a question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 12 && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="multiple-answers"
              checked={allowMultiple}
              onCheckedChange={setAllowMultiple}
            />
            <Label htmlFor="multiple-answers">Allow multiple answers</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!isValid} onClick={handleCreate}>{isEditing ? "Update Poll" : "Create Poll"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
