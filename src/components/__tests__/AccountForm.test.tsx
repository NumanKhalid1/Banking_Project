import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AccountForm } from "../AccountForm";
import { ChakraProvider } from "@chakra-ui/react";

describe("AccountForm", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(
      <ChakraProvider>
        <AccountForm onSuccess={mockOnSuccess} />
      </ChakraProvider>
    );

    expect(screen.getByLabelText(/iban/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("validates IBAN format", async () => {
    render(
      <ChakraProvider>
        <AccountForm onSuccess={mockOnSuccess} />
      </ChakraProvider>
    );

    const ibanInput = screen.getByLabelText(/iban/i);
    fireEvent.change(ibanInput, { target: { value: "invalid-iban" } });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid iban format/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "1", iban: "GB29NWBK60161331926819" }),
    });
    global.fetch = mockFetch;

    render(
      <ChakraProvider>
        <AccountForm onSuccess={mockOnSuccess} />
      </ChakraProvider>
    );

    const ibanInput = screen.getByLabelText(/iban/i);
    fireEvent.change(ibanInput, {
      target: { value: "GB29NWBK60161331926819" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ iban: "GB29NWBK60161331926819" }),
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
