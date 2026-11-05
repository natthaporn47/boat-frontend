import React, { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { importLibrary } from "@googlemaps/js-api-loader";

jest.mock("@googlemaps/js-api-loader", () => ({
  setOptions: jest.fn(),
  importLibrary: jest.fn(),
}));

process.env.REACT_APP_GOOGLE_MAPS_API_KEY = "test-google-maps-key";
const MapView = require("./MapView").default;
const createMap = jest.fn();
const unbindAll = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  createMap.mockImplementation(function (container) {
    container.textContent = "Google Maps";
    return { unbindAll };
  });
  importLibrary.mockResolvedValue({ Map: createMap });
});

test("loads one map in StrictMode and supports navigating back", async () => {
  const { unmount } = render(
    <StrictMode>
      <MapView />
    </StrictMode>
  );

  expect(screen.getByRole("status")).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  expect(createMap).toHaveBeenCalledTimes(1);
  unmount();
  expect(unbindAll).toHaveBeenCalledTimes(1);
  render(<MapView />);
  await waitFor(() => expect(createMap).toHaveBeenCalledTimes(2));
});

test("shows a useful error when the map service cannot load", async () => {
  importLibrary.mockRejectedValueOnce(new Error("Network unavailable"));
  render(<MapView />);
  expect(await screen.findByRole("alert")).toHaveTextContent("ไม่สามารถโหลดแผนที่ได้");
  expect(screen.getByLabelText("แผนที่การทำงาน")).toHaveAttribute("aria-busy", "false");
});

test("does not create a map after navigating away while it is loading", async () => {
  let resolveLibrary;
  importLibrary.mockReturnValueOnce(new Promise(resolve => { resolveLibrary = resolve; }));
  const { unmount } = render(<MapView />);
  unmount();
  await act(async () => {
    resolveLibrary({ Map: createMap });
  });
  expect(createMap).not.toHaveBeenCalled();
});
