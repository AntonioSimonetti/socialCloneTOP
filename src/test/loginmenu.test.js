import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import LoginMenu from "../components/loginmenu";

test("render all the elements inside loginMenu component", () => {
  render(<LoginMenu />);

  expect(screen.getByText("Login")).toBeInTheDocument();
  expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
  expect(screen.getByText("Back")).toBeInTheDocument();
  expect(
    screen.getByText("Insert your email and password to login.")
  ).toBeInTheDocument();
});

test("render the forgot password inputs", () => {
  render(<LoginMenu />);

  fireEvent.click(screen.getByText("Forgot Password?"));
  expect(screen.getByText("Send Reset Email")).toBeInTheDocument();
});

test("displays updated error message if fields are not filled", async () => {
  render(<LoginMenu />);

  expect(
    screen.getByText("Insert your email and password to login.")
  ).toBeInTheDocument();

  fireEvent.click(screen.getByText("Login"));

  await waitFor(() => {
    expect(screen.getByText("Error during login.")).toBeInTheDocument();
  });
});

//TODO: test with the complete db fetching data and mocking it to check email not found error etc.
