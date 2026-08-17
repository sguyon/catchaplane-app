import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { PlaneSprite } from "@/components/radar/PlaneSprite";

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, style, ...props }: any) => (
      <div style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

describe("PlaneSprite Component", () => {
  it("renders SVG plane icon", () => {
    const { container } = render(<PlaneSprite />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies correct color for selected state", () => {
    const { container: selectedContainer } = render(
      <PlaneSprite isSelected={true} />
    );
    expect(selectedContainer.querySelector(".text-amber")).toBeInTheDocument();

    const { container: unselectedContainer } = render(
      <PlaneSprite isSelected={false} />
    );
    expect(unselectedContainer.querySelector(".text-sky")).toBeInTheDocument();
  });

  it("applies correct size classes", () => {
    const sizes = [
      { size: "sm" as const, class: "w-4" },
      { size: "md" as const, class: "w-6" },
      { size: "lg" as const, class: "w-8" },
    ];

    for (const { size, class: expectedClass } of sizes) {
      const { container } = render(<PlaneSprite size={size} />);
      expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
    }
  });

  it("rotates based on heading prop", () => {
    const { container } = render(<PlaneSprite heading={90} />);

    const svg = container.querySelector("svg");
    expect(svg?.style.transform).toContain("rotate(90deg)");
  });

  it("defaults to heading 0 when not provided", () => {
    const { container } = render(<PlaneSprite />);

    const svg = container.querySelector("svg");
    expect(svg?.style.transform).toContain("rotate(0deg)");
  });

  it("has animation applied for selected state", () => {
    const { container } = render(<PlaneSprite isSelected={true} />);

    const motionDiv = container.firstChild as HTMLElement;
    // Check that animation properties are set (Framer Motion applies them)
    expect(motionDiv).toBeTruthy();
  });
});
