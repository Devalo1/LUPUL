import React from "react";
import ProfileImage from "./ProfileImage";

interface ProfilePhotoProps {
  photoURL?: string | null;
  userDisplayName?: string;
  userId?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "medium" | "large" | number;
  className?: string;
  round?: boolean;
}

/**
 * Legacy ProfilePhoto component that now uses the unified ProfileImage component
 * Maintained for backward compatibility
 */
const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  photoURL,
  userDisplayName = "",
  userId = "",
  size = "md",
  className = "",
  round = true
}) => {
  // Map legacy size values to new format
  const normalizedSize = (() => {
    if (size === "medium") return "md";
    if (size === "large") return "lg";
    return size;
  })();

  return (
    <ProfileImage
      src={photoURL}
      name={userDisplayName}
      id={userId}
      alt={userDisplayName || "User Profile"}
      size={normalizedSize}
      className={className}
      round={round}
    />
  );
};

export default ProfilePhoto;