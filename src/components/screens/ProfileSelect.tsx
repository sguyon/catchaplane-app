"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ATCAvatar } from "@/components/characters/ATCAvatar";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { BigButton } from "@/components/ui/BigButton";
import { TextInput } from "@/components/ui/TextInput";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { ProfileOptionsMenu } from "@/components/ui/ProfileOptionsMenu";
import { useApp } from "@/contexts/AppContext";
import { useAvatarGenerator } from "@/hooks/useAvatarGenerator";
import type { KidProfile } from "@/lib/types";

type CreateState = "idle" | "name-entry" | "gender-selection" | "generating" | "rename-entry" | "avatar-generation";
type MenuState = { profile: KidProfile } | null;

export function ProfileSelect() {
  const {
    savedProfiles,
    currentProfile,
    goToScreen,
    setCurrentProfile,
    addProfile,
    updateProfile,
  } = useApp();

  const { generateAvatar, loading: avatarLoading } = useAvatarGenerator();
  const [createState, setCreateState] = useState<CreateState>("idle");
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [menuState, setMenuState] = useState<MenuState>(null);
  const [renameValue, setRenameValue] = useState("");
  const [selectedGenderForAvatar, setSelectedGenderForAvatar] = useState<"boy" | "girl" | "neutral" | null>(null);
  const [profileToUpdate, setProfileToUpdate] = useState<KidProfile | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleSelectProfile = (profile: KidProfile) => {
    setCurrentProfile(profile);
    // Update lastUsed timestamp
    const updatedProfile = { ...profile, lastUsed: Date.now() };
    setCurrentProfile(updatedProfile);
    goToScreen("control-tower");
  };

  const handleStartNewProfile = () => {
    setCreateState("name-entry");
    setNewName("");
    setNameError("");
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const validateName = (name: string): boolean => {
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    if (name.trim().length > 20) {
      setNameError("Name must be 20 characters or less");
      return false;
    }
    if (savedProfiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setNameError("That name already exists!");
      return false;
    }
    return true;
  };

  const handleNameConfirm = () => {
    if (!validateName(newName)) {
      return;
    }
    setNameError("");
    setCreateState("gender-selection");
  };

  const handleGenderSelect = async (gender: "boy" | "girl" | "neutral") => {
    setCreateState("generating");

    // Generate avatar
    const avatarUrl = await generateAvatar(newName.trim(), gender);

    // Create profile
    const profile: KidProfile = {
      name: newName.trim(),
      gender,
      avatarUrl: avatarUrl || null,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };

    addProfile(profile);
    setCurrentProfile(profile);
    setCreateState("idle");
    goToScreen("control-tower");
  };

  const handleStartRename = (profile: KidProfile) => {
    setProfileToUpdate(profile);
    setRenameValue(profile.name);
    setCreateState("rename-entry");
    setTimeout(() => renameInputRef.current?.focus(), 100);
  };

  const handleConfirmRename = () => {
    if (!profileToUpdate) return;

    const trimmed = renameValue.trim();
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 20) {
      setNameError("Name must be 20 characters or less");
      return;
    }
    if (
      savedProfiles.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.name !== profileToUpdate.name
      )
    ) {
      setNameError("That name already exists!");
      return;
    }

    updateProfile(profileToUpdate.name, { name: trimmed });
    setCreateState("idle");
    setProfileToUpdate(null);
    setNameError("");
  };

  const handleStartAvatarGeneration = (profile: KidProfile) => {
    setProfileToUpdate(profile);
    setCreateState("avatar-generation");
  };

  const handleAvatarGender = async (gender: "boy" | "girl" | "neutral") => {
    if (!profileToUpdate) return;

    setCreateState("generating");

    // Generate new avatar
    const avatarUrl = await generateAvatar(profileToUpdate.name, gender);

    // Update profile with new avatar
    updateProfile(profileToUpdate.name, {
      avatarUrl: avatarUrl || null,
      gender,
    });

    setCreateState("idle");
    setProfileToUpdate(null);
  };

  const handleDeleteProfile = (profile: KidProfile) => {
    // Remove from saved profiles
    const updated = savedProfiles.filter((p) => p.name !== profile.name);

    // If this was the current profile, clear current and show profile select
    if (currentProfile?.name === profile.name) {
      setCurrentProfile(null);
    }

    // Update storage via context
    setCurrentProfile(null);
    // Trigger a re-render by adding and removing all profiles
    // This is a bit hacky but ensures storage updates
    window.location.reload();
  };

  const showProfiles = savedProfiles.length > 0 && createState === "idle";
  const showNameEntry = createState === "name-entry";
  const showGenderSelection = createState === "gender-selection";
  const showRenameEntry = createState === "rename-entry";
  const showAvatarGenderSelection = createState === "avatar-generation";
  const showGenerating = createState === "generating" || createState === "avatar-generation";

  return (
    <div className="relative h-full flex flex-col items-center overflow-hidden bg-gradient-to-b from-sky via-sky-light to-white">
      {/* ATC Avatar and greeting */}
      <div className="pt-6 px-4 flex flex-col items-center gap-3">
        <ATCAvatar size="md" />
        <SpeechBubble variant="atc">
          Who's flying today? 👋
        </SpeechBubble>
      </div>

      {/* Main content area */}
      <div className="flex-1 w-full px-4 py-6 overflow-y-auto flex flex-col pt-safe pb-28">
        <AnimatePresence mode="wait">
          {/* Existing profiles grid */}
          {showProfiles && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-3 gap-4 mb-6"
            >
              {savedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.name}
                  profile={profile}
                  isSelected={currentProfile?.name === profile.name}
                  onSelect={handleSelectProfile}
                  onLongPress={() => setMenuState({ profile })}
                />
              ))}
            </motion.div>
          )}

          {/* Name entry */}
          {showNameEntry && (
            <motion.div
              key="name-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-4 mb-6"
            >
              <h2 className="text-2xl font-bold text-navy text-center">
                What's your name, pilot?
              </h2>
              <TextInput
                ref={nameInputRef}
                type="text"
                placeholder="Enter name..."
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (nameError) setNameError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleNameConfirm();
                  }
                }}
                error={nameError}
                autoCapitalize="words"
                maxLength={20}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNameConfirm}
                className="h-12 bg-sky hover:bg-sky/90 text-white font-bold rounded-[28px] text-lg transition-colors"
              >
                Next →
              </motion.button>
              <button
                onClick={() => {
                  setCreateState("idle");
                  setNameError("");
                }}
                className="text-sm text-sky underline font-bold"
              >
                Back
              </button>
            </motion.div>
          )}

          {/* Gender selection */}
          {showGenderSelection && (
            <motion.div
              key="gender-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-4 mb-6"
            >
              <h2 className="text-2xl font-bold text-navy text-center">
                Are you a...
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenderSelect("boy")}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-sky/10 hover:bg-sky/20 border-2 border-sky rounded-[20px] transition-colors"
                >
                  <span className="text-4xl">👦</span>
                  <span className="text-sm font-bold text-navy">Boy</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenderSelect("girl")}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-rose/10 hover:bg-rose/20 border-2 border-rose rounded-[20px] transition-colors"
                >
                  <span className="text-4xl">👧</span>
                  <span className="text-sm font-bold text-navy">Girl</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenderSelect("neutral")}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-indigo/10 hover:bg-indigo/20 border-2 border-indigo rounded-[20px] transition-colors"
                >
                  <span className="text-4xl">🧒</span>
                  <span className="text-xs font-bold text-navy">Surprise</span>
                </motion.button>
              </div>
              <button
                onClick={() => setCreateState("name-entry")}
                className="text-sm text-sky underline font-bold"
              >
                Back
              </button>
            </motion.div>
          )}

          {/* Rename entry */}
          {showRenameEntry && (
            <motion.div
              key="rename-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-4 mb-6"
            >
              <h2 className="text-2xl font-bold text-navy text-center">
                New name for {profileToUpdate?.name}?
              </h2>
              <TextInput
                ref={renameInputRef}
                type="text"
                placeholder="Enter new name..."
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value);
                  if (nameError) setNameError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmRename();
                  }
                }}
                error={nameError}
                autoCapitalize="words"
                maxLength={20}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmRename}
                className="h-12 bg-sky hover:bg-sky/90 text-white font-bold rounded-[28px] text-lg transition-colors"
              >
                Save →
              </motion.button>
              <button
                onClick={() => {
                  setCreateState("idle");
                  setProfileToUpdate(null);
                  setNameError("");
                }}
                className="text-sm text-sky underline font-bold"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Avatar gender selection for regeneration */}
          {showAvatarGenderSelection && (
            <motion.div
              key="avatar-gender"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-4 mb-6"
            >
              <h2 className="text-2xl font-bold text-navy text-center">
                Pick a new look for {profileToUpdate?.name}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAvatarGender("boy")}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-sky/10 hover:bg-sky/20 border-2 border-sky rounded-[20px] transition-colors"
                >
                  <span className="text-4xl">👦</span>
                  <span className="text-sm font-bold text-navy">Boy</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAvatarGender("girl")}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-rose/10 hover:bg-rose/20 border-2 border-rose rounded-[20px] transition-colors"
                >
                  <span className="text-4xl">👧</span>
                  <span className="text-sm font-bold text-navy">Girl</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAvatarGender("neutral")}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-indigo/10 hover:bg-indigo/20 border-2 border-indigo rounded-[20px] transition-colors"
                >
                  <span className="text-4xl">🧒</span>
                  <span className="text-xs font-bold text-navy">Surprise</span>
                </motion.button>
              </div>
              <button
                onClick={() => {
                  setCreateState("idle");
                  setProfileToUpdate(null);
                }}
                className="text-sm text-sky underline font-bold"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Generating state */}
          {showGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-sky/30 border-t-sky rounded-full"
              />
              <p className="text-lg font-bold text-navy text-center">
                Creating your avatar...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add new pilot button */}
      {(showProfiles || createState === "idle") && (
        <motion.div
          key="add-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full px-4 pb-6"
        >
          <BigButton
            onClick={handleStartNewProfile}
            disabled={avatarLoading}
          >
            ➕ Add New Pilot
          </BigButton>
        </motion.div>
      )}

      {/* Profile options menu */}
      {menuState && (
        <ProfileOptionsMenu
          profile={menuState.profile}
          isOpen={true}
          onClose={() => setMenuState(null)}
          onRename={handleStartRename}
          onChangeAvatar={handleStartAvatarGeneration}
          onDelete={handleDeleteProfile}
        />
      )}
    </div>
  );
}
