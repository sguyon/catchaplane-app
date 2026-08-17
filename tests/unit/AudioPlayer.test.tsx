import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

// Mock Framer Motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("AudioPlayer Component", () => {
  it("renders captain name and status", () => {
    render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={true}
      />
    );

    expect(screen.getByText("Captain Jake")).toBeInTheDocument();
  });

  it("shows 'Tap to play' when not playing", () => {
    render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={true}
      />
    );

    expect(screen.getByText("Tap to play")).toBeInTheDocument();
  });

  it("shows speaking status when playing", () => {
    render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={true}
        hasAudio={true}
      />
    );

    expect(screen.getByText("Captain Jake is speaking...")).toBeInTheDocument();
  });

  it("shows loading state when audio is loading", () => {
    render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={true}
        loading={true}
      />
    );

    expect(screen.getByText("Preparing voice...")).toBeInTheDocument();
  });

  it("disables button when loading or no audio", () => {
    const { rerender } = render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={true}
        loading={true}
      />
    );

    const button = screen.getByRole("button", { name: /loading audio/i });
    expect(button).toBeDisabled();

    rerender(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={false}
        loading={false}
      />
    );

    const disabledButton = screen.getByRole("button", { name: /play/i });
    expect(disabledButton).toBeDisabled();
  });

  it("calls onToggle when button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={true}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole("button", { name: /play/i });
    await user.click(button);

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("has correct button size (64px - w-16 h-16)", () => {
    render(
      <AudioPlayer
        captainName="Captain Jake"
        isPlaying={false}
        hasAudio={true}
      />
    );

    const button = screen.getByRole("button", { name: /play/i });
    expect(button).toHaveClass("w-16", "h-16");
  });
});
