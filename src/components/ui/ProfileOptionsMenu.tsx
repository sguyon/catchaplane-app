"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { KidProfile } from "@/lib/types";

interface ProfileOptionsMenuProps {
  profile: KidProfile;
  isOpen: boolean;
  onClose: () => void;
  onRename: (profile: KidProfile) => void;
  onChangeAvatar: (profile: KidProfile) => void;
  onDelete: (profile: KidProfile) => void;
}

export function ProfileOptionsMenu({
  profile,
  isOpen,
  onClose,
  onRename,
  onChangeAvatar,
  onDelete,
}: ProfileOptionsMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-lg z-50 max-w-md mx-auto"
          >
            {/* Header */}
            <div className="border-b border-sky/20 px-6 py-4">
              <h3 className="text-xl font-bold text-navy text-center">
                {profile.name}
              </h3>
            </div>

            {/* Options */}
            <div className="px-4 py-4 space-y-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onRename(profile);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-[16px] bg-sky/10 hover:bg-sky/20 text-navy font-bold text-lg transition-colors flex items-center gap-3"
              >
                <span className="text-xl">✏️</span>
                Rename Pilot
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onChangeAvatar(profile);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-[16px] bg-amber/10 hover:bg-amber/20 text-navy font-bold text-lg transition-colors flex items-center gap-3"
              >
                <span className="text-xl">🎨</span>
                Change Avatar
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onDelete(profile);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-[16px] bg-rose/10 hover:bg-rose/20 text-rose font-bold text-lg transition-colors flex items-center gap-3"
              >
                <span className="text-xl">🗑️</span>
                Delete Profile
              </motion.button>
            </div>

            {/* Cancel button */}
            <div className="border-t border-sky/20 px-4 py-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-3 text-sky font-bold text-lg rounded-[16px] hover:bg-sky/5 transition-colors"
              >
                Cancel
              </motion.button>
            </div>

            {/* Safe area bottom */}
            <div className="h-6" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
