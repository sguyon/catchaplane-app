import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoryCard } from "@/components/ui/StoryCard";

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("StoryCard Component", () => {
  it("renders title and content", () => {
    render(
      <StoryCard
        title="Test Title"
        variant="dinner"
        icon={<span>🍕</span>}
      >
        Test content
      </StoryCard>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders with correct variant styles", () => {
    const { container: dinnerContainer } = render(
      <StoryCard
        title="Dinner"
        variant="dinner"
        icon={<span>🍕</span>}
      >
        Pizza menu
      </StoryCard>
    );

    expect(dinnerContainer.querySelector(".bg-emerald-light")).toBeInTheDocument();
    expect(dinnerContainer.querySelector(".border-emerald")).toBeInTheDocument();
  });

  it("renders destination variant with image", () => {
    const imageUrl =
      "https://images.unsplash.com/photo-1494145904049-0dca7dc18a73?w=1024&h=768&fit=crop&q=80";

    render(
      <StoryCard
        title="Flying to New York!"
        variant="destination"
        icon={<span>🌍</span>}
        imageUrl={imageUrl}
      >
        Amazing city fact
      </StoryCard>
    );

    const img = screen.getByAltText("Flying to New York!");
    expect(img).toHaveAttribute("src", imageUrl);
    expect(img).toHaveClass("w-full", "h-32", "object-cover");
  });

  it("does not render image when imageUrl is not provided", () => {
    const { container } = render(
      <StoryCard
        title="No Image Card"
        variant="passenger"
        icon={<span>👦</span>}
      >
        Content without image
      </StoryCard>
    );

    const img = container.querySelector("img");
    expect(img).not.toBeInTheDocument();
  });

  it("renders all variant styles correctly", () => {
    const variants: Array<"dinner" | "destination" | "passenger"> = [
      "dinner",
      "destination",
      "passenger",
    ];

    for (const variant of variants) {
      const { container } = render(
        <StoryCard
          title={`${variant} card`}
          variant={variant}
          icon={<span>✨</span>}
        >
          Content
        </StoryCard>
      );

      const expected = {
        dinner: ["bg-emerald-light", "border-emerald"],
        destination: ["bg-indigo-light", "border-indigo"],
        passenger: ["bg-rose-light", "border-rose"],
      };

      for (const cls of expected[variant]) {
        expect(container.querySelector(`.${cls}`)).toBeInTheDocument();
      }
    }
  });
});
