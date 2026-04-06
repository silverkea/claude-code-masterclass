import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addDoc, getDocs } from "firebase/firestore";
import { useUser } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CreateHeistForm from "@/components/CreateHeistForm";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  Timestamp: { fromDate: vi.fn((d: Date) => d) },
}));
vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const mockUseUser = vi.mocked(useUser);
const mockUseRouter = vi.mocked(useRouter);
const mockAddDoc = vi.mocked(addDoc);
const mockGetDocs = vi.mocked(getDocs);

const mockUser = { uid: "user-123", displayName: "SwiftFoxVault" };
let mockPush: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockPush = vi.fn();
  mockUseUser.mockReturnValue({ user: mockUser as never, loading: false });
  mockUseRouter.mockReturnValue({ push: mockPush } as never);
});

function renderAndFill(title = "The Big Score", description = "Rob the vault") {
  render(<CreateHeistForm />);
  if (title)
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: title },
    });
  if (description)
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: description },
    });
}

function submitForm() {
  fireEvent.submit(
    screen.getByRole("button", { name: /create heist/i }).closest("form")!,
  );
}

describe("CreateHeistForm", () => {
  it("renders title, description, assignee fields and submit button", () => {
    render(<CreateHeistForm />);
    expect(screen.getByLabelText(/title/i)).toBeDefined();
    expect(screen.getByLabelText(/description/i)).toBeDefined();
    expect(screen.getByLabelText(/assignee/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /create heist/i })).toBeDefined();
  });

  it("shows a validation error and does not call addDoc when title is empty", async () => {
    renderAndFill("", "Rob the vault");
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeDefined();
    });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it("shows a validation error and does not call addDoc when description is empty", async () => {
    renderAndFill("The Big Score", "");
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeDefined();
    });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('shows "Submitting…" and disables the button while saving', async () => {
    mockAddDoc.mockReturnValue(new Promise(() => {}));
    renderAndFill();
    submitForm();
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /submitting/i });
      expect(btn).toBeDefined();
      expect(btn).toHaveProperty("disabled", true);
    });
  });

  it("redirects to /heists on successful save", async () => {
    mockAddDoc.mockResolvedValue({} as never);
    renderAndFill();
    submitForm();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("shows an error message and preserves form values on save failure", async () => {
    mockAddDoc.mockRejectedValue(new Error("Firestore error"));
    renderAndFill();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeDefined();
    });
    expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe(
      "The Big Score",
    );
    expect(
      (screen.getByLabelText(/description/i) as HTMLInputElement).value,
    ).toBe("Rob the vault");
  });

  it("fetches all users immediately when the assignee field is focused", async () => {
    mockGetDocs.mockResolvedValue({ docs: [] } as never);
    render(<CreateHeistForm />);
    fireEvent.focus(screen.getByLabelText(/assignee/i));
    await waitFor(() => {
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });

  it("calls addDoc with null assignee fields when no assignee is selected", async () => {
    mockAddDoc.mockResolvedValue({} as never);
    renderAndFill();
    submitForm();
    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
    });
    const callData = mockAddDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(callData.assignedTo).toBeNull();
    expect(callData.assignedToCodename).toBeNull();
  });

  describe("assignee search", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runAllTimers();
      vi.useRealTimers();
    });

    it("queries Firestore after the debounce delay when typing in the assignee field", async () => {
      mockGetDocs.mockResolvedValue({ docs: [] } as never);
      render(<CreateHeistForm />);
      fireEvent.focus(screen.getByLabelText(/assignee/i));
      fireEvent.change(screen.getByLabelText(/assignee/i), {
        target: { value: "Bold" },
      });
      await vi.runAllTimersAsync();
      expect(mockGetDocs).toHaveBeenCalled();
    });

    it("shows matching results in the dropdown", async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ id: "uid-456", codename: "BoldRavenGhost" }) }],
      } as never);
      render(<CreateHeistForm />);
      fireEvent.focus(screen.getByLabelText(/assignee/i));
      fireEvent.change(screen.getByLabelText(/assignee/i), {
        target: { value: "Bold" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(screen.getByText("BoldRavenGhost")).toBeDefined();
    });

    it("selecting a result clears the search input and shows the selected codename", async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ id: "uid-456", codename: "BoldRavenGhost" }) }],
      } as never);
      render(<CreateHeistForm />);
      fireEvent.focus(screen.getByLabelText(/assignee/i));
      fireEvent.change(screen.getByLabelText(/assignee/i), {
        target: { value: "Bold" },
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(screen.getByText("BoldRavenGhost")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: "BoldRavenGhost" }));
      expect(screen.getByText("BoldRavenGhost")).toBeDefined();
      expect(screen.queryByPlaceholderText(/search by codename/i)).toBeNull();
    });
  });
});
