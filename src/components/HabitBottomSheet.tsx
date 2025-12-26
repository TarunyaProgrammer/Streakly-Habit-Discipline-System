import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { cn } from "../utils/cn";

interface HabitBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: {
    id?: string;
    title: string;
    type: "mandatory" | "optional";
    weekendOff: boolean;
  }) => void;
  onDelete?: (id: string) => void;
  initialData?: {
    id: string;
    title: string;
    type: "mandatory" | "optional";
    weekendOff: boolean;
  } | null;
}

export const HabitBottomSheet = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}: HabitBottomSheetProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"mandatory" | "optional">("mandatory");
  const [weekendOff, setWeekendOff] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setType(initialData.type);
        setWeekendOff(initialData.weekendOff);
      } else {
        setTitle("");
        setType("mandatory");
        setWeekendOff(false);
      }
    }
  }, [isOpen, initialData]);

  // Sync state with initialData when it changes or sheet opens
  /* 
     We need an effect to reset form when initialData changes.
     Or use a key on the component instance in parent.
     Let's use effect.
  */
  // Actually, better to just use a useEffect here.

  // Note: react-hooks/exhaustive-deps might complain if we don't import useEffect.
  // It is imported in the original file? check...
  // Original file: import { useState } from "react"; -> No useEffect.
  // I need to add useEffect to imports.

  /* Retaining original imports... wait, I need to add useEffect to imports first/simultaneously.
     I'm replacing the whole component body basically.
  */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData?.id,
      title,
      type,
      weekendOff,
    });

    // Reset handled by parent closing or effect
    onClose();
  };

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      if (confirm("Abandon this discipline? History will be lost.")) {
        onDelete(initialData.id);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border rounded-t-xl z-[60] p-6 shadow-2xl safe-area-bottom w-full md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:rounded-xl md:bottom-6 md:border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">
                {initialData ? "Edit Protocol" : "New Discipline"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">
                  Habit Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read Physics"
                  className="w-full bg-elevated border border-border rounded-lg p-3 text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-today"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-muted">Type</label>
                  <div className="flex bg-elevated rounded-lg p-1 border border-border">
                    <button
                      type="button"
                      onClick={() => setType("mandatory")}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                        type === "mandatory"
                          ? "bg-today text-white"
                          : "text-muted hover:text-text"
                      )}
                    >
                      Mandatory
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("optional")}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                        type === "optional"
                          ? "bg-today text-white"
                          : "text-muted hover:text-text"
                      )}
                    >
                      Optional
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted">
                  Weekend Off
                </label>
                <button
                  type="button"
                  onClick={() => setWeekendOff(!weekendOff)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    weekendOff ? "bg-today" : "bg-elevated border border-border"
                  )}
                >
                  <motion.div
                    className="absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{
                      left: weekendOff ? "calc(100% - 1.25rem)" : "0.25rem",
                    }}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                {initialData && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-4 bg-missed/10 text-missed font-bold rounded-lg hover:bg-missed/20 transition-colors"
                  >
                    Abandon
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {initialData ? "Update Protocol" : "Initiate Protocol"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
