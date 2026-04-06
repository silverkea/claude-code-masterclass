import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getDocs, updateDoc } from "firebase/firestore";
import { useUser } from "@/context/AuthContext";
import { useHeist } from "@/hooks/useHeist";
import HeistDetail from "@/components/HeistDetail";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({ id: "heist-1" })),
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
}));
vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("@/hooks/useHeist", () => ({ useHeist: vi.fn() }));
vi.mock("@/types/firestore", () => ({
  COLLECTIONS: { HEISTS: "heists", USERS: "users" },
}));

// Stub child components to keep HeistDetail tests focused
vi.mock("@/components/HeistCountdown", () => ({
  default: ({ deadline }: { deadline: Date }) => (
    <div data-testid="countdown">{deadline.toISOString()}</div>
  ),
}));
vi.mock("@/components/HeistDetailSkeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}));

const mockUseUser = vi.mocked(useUser);
const mockUseHeist = vi.mocked(useHeist);
const mockGetDocs = vi.mocked(getDocs);
const mockUpdateDoc = vi.mocked(updateDoc);

const mockUser = { uid: "user-123", displayName: "CurrentUser" };

const baseHeist = {
  id: "heist-1",
  title: "The Big Score",
  description: "Rob the vault",
  createdBy: "creator-456",
  createdByCodename: "NightOwl",
  assignedTo: "assignee-789",
  assignedToCodename: "SwiftFox",
  deadline: new Date("2099-01-01"),
  finalStatus: null,
  createdAt: new Date("2025-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUser.mockReturnValue({ user: mockUser as never, loading: false });
});

describe("HeistDetail", () => {
  describe("loading state", () => {
    it("renders the skeleton while loading", () => {
      mockUseHeist.mockReturnValue({
        heist: null,
        loading: true,
        notFound: false,
        error: null,
      });
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("does not render heist content while loading", () => {
      mockUseHeist.mockReturnValue({
        heist: null,
        loading: true,
        notFound: false,
        error: null,
      });
      render(<HeistDetail id="heist-1" />);
      expect(screen.queryByText("The Big Score")).not.toBeInTheDocument();
    });
  });

  describe("not found state", () => {
    it("calls notFound() when useHeist returns notFound: true", async () => {
      const { notFound } = await import("next/navigation");
      mockUseHeist.mockReturnValue({
        heist: null,
        loading: false,
        notFound: true,
        error: null,
      });
      render(<HeistDetail id="nonexistent" />);
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("renders an error message when useHeist returns an error", () => {
      mockUseHeist.mockReturnValue({
        heist: null,
        loading: false,
        notFound: false,
        error: new Error("Firestore error"),
      });
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByText(/could not load/i)).toBeInTheDocument();
    });
  });

  describe("loaded — assigned heist", () => {
    beforeEach(() => {
      mockUseHeist.mockReturnValue({
        heist: baseHeist,
        loading: false,
        notFound: false,
        error: null,
      });
    });

    it("renders the heist title", () => {
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByText("The Big Score")).toBeInTheDocument();
    });

    it("renders the heist description", () => {
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByText("Rob the vault")).toBeInTheDocument();
    });

    it("renders the creator codename", () => {
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByText("NightOwl")).toBeInTheDocument();
    });

    it("renders the assignee codename as static text", () => {
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByText("SwiftFox")).toBeInTheDocument();
    });

    it("does not render the assignment search input when heist has an assignee", () => {
      render(<HeistDetail id="heist-1" />);
      expect(
        screen.queryByPlaceholderText(/search by codename/i),
      ).not.toBeInTheDocument();
    });

    it("renders the countdown component", () => {
      render(<HeistDetail id="heist-1" />);
      expect(screen.getByTestId("countdown")).toBeInTheDocument();
    });
  });

  describe("loaded — unassigned heist", () => {
    const unassignedHeist = {
      ...baseHeist,
      assignedTo: null,
      assignedToCodename: null,
    };

    beforeEach(() => {
      mockUseHeist.mockReturnValue({
        heist: unassignedHeist,
        loading: false,
        notFound: false,
        error: null,
      });
    });

    it("renders the assignment search input when heist has no assignee", () => {
      render(<HeistDetail id="heist-1" />);
      expect(
        screen.getByPlaceholderText(/search by codename/i),
      ).toBeInTheDocument();
    });

    it("does not render the confirm button before a selection is made", () => {
      render(<HeistDetail id="heist-1" />);
      expect(
        screen.queryByRole("button", { name: /confirm assignment/i }),
      ).not.toBeInTheDocument();
    });

    it("does not render assignee static text when unassigned", () => {
      render(<HeistDetail id="heist-1" />);
      expect(screen.queryByText("SwiftFox")).not.toBeInTheDocument();
    });
  });

  describe("assignment search", () => {
    const unassignedHeist = {
      ...baseHeist,
      assignedTo: null,
      assignedToCodename: null,
    };

    beforeEach(() => {
      vi.useFakeTimers();
      mockUseHeist.mockReturnValue({
        heist: unassignedHeist,
        loading: false,
        notFound: false,
        error: null,
      });
    });

    afterEach(() => {
      vi.runAllTimers();
      vi.useRealTimers();
    });

    it("triggers debounced getDocs after typing", async () => {
      mockGetDocs.mockResolvedValue({ docs: [] } as never);
      render(<HeistDetail id="heist-1" />);
      fireEvent.focus(screen.getByPlaceholderText(/search by codename/i));
      fireEvent.change(screen.getByPlaceholderText(/search by codename/i), {
        target: { value: "Swift" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(mockGetDocs).toHaveBeenCalled();
    });

    it("shows matching results in the dropdown", async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ id: "uid-999", codename: "SwiftFox" }) }],
      } as never);
      render(<HeistDetail id="heist-1" />);
      fireEvent.focus(screen.getByPlaceholderText(/search by codename/i));
      fireEvent.change(screen.getByPlaceholderText(/search by codename/i), {
        target: { value: "Swift" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(screen.getByText("SwiftFox")).toBeInTheDocument();
    });

    it("excludes the current user from dropdown results", async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ id: "user-123", codename: "CurrentUser" }) }, // current user
          { data: () => ({ id: "uid-999", codename: "OtherAgent" }) },
        ],
      } as never);
      render(<HeistDetail id="heist-1" />);
      fireEvent.focus(screen.getByPlaceholderText(/search by codename/i));
      fireEvent.change(screen.getByPlaceholderText(/search by codename/i), {
        target: { value: "a" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(screen.queryByText("CurrentUser")).not.toBeInTheDocument();
      expect(screen.getByText("OtherAgent")).toBeInTheDocument();
    });

    it("shows Confirm Assignment button after selecting a user", async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ id: "uid-999", codename: "SwiftFox" }) }],
      } as never);
      render(<HeistDetail id="heist-1" />);
      fireEvent.focus(screen.getByPlaceholderText(/search by codename/i));
      fireEvent.change(screen.getByPlaceholderText(/search by codename/i), {
        target: { value: "Swift" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      fireEvent.click(screen.getByRole("button", { name: "SwiftFox" }));
      expect(
        screen.getByRole("button", { name: /confirm assignment/i }),
      ).toBeInTheDocument();
    });
  });

  describe("confirm assignment", () => {
    const unassignedHeist = {
      ...baseHeist,
      assignedTo: null,
      assignedToCodename: null,
    };

    async function renderWithPendingAssignee() {
      vi.useFakeTimers();
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ id: "uid-999", codename: "SwiftFox" }) }],
      } as never);
      render(<HeistDetail id="heist-1" />);
      fireEvent.focus(screen.getByPlaceholderText(/search by codename/i));
      fireEvent.change(screen.getByPlaceholderText(/search by codename/i), {
        target: { value: "Swift" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      vi.useRealTimers();
      fireEvent.click(screen.getByRole("button", { name: "SwiftFox" }));
    }

    beforeEach(() => {
      mockUseHeist.mockReturnValue({
        heist: unassignedHeist,
        loading: false,
        notFound: false,
        error: null,
      });
    });

    it("calls updateDoc with correct fields on confirm", async () => {
      mockUpdateDoc.mockResolvedValue(undefined as never);
      await renderWithPendingAssignee();
      fireEvent.click(
        screen.getByRole("button", { name: /confirm assignment/i }),
      );
      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            assignedTo: "uid-999",
            assignedToCodename: "SwiftFox",
          }),
        );
      });
    });

    it("disables the confirm button while saving", async () => {
      mockUpdateDoc.mockReturnValue(new Promise(() => {}));
      await renderWithPendingAssignee();
      fireEvent.click(
        screen.getByRole("button", { name: /confirm assignment/i }),
      );
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /assigning/i }),
        ).toBeDisabled();
      });
    });

    it("shows error message and preserves selection on updateDoc failure", async () => {
      mockUpdateDoc.mockRejectedValue(new Error("write failed"));
      await renderWithPendingAssignee();
      fireEvent.click(
        screen.getByRole("button", { name: /confirm assignment/i }),
      );
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
      // pending selection still present
      expect(screen.getByText("SwiftFox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm assignment/i }),
      ).toBeInTheDocument();
    });
  });
});
