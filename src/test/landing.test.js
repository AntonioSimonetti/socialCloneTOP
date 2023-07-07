import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import LandingPage from "../components/landing";

test("render the login menu after pushing the log in button", () => {
  render(<LandingPage />);

  // Verify login menu component is not rendered yet assuring the presence of an unique element linked to the login menu component
  expect(() => screen.getByText("Forgot Password?")).toThrow();
  fireEvent.click(screen.getByText("Log in"));

  // Verify login menu component is rendered assuring the presence of an unique element linked to the login menu component
  expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
});

test("render RegistrationForm after pushing the create account button", () => {
  render(<LandingPage />);

  // Verify RegistrationForm component is not rendered initially
  expect(screen.queryByText("Enter your information to register")).toBeNull();

  fireEvent.click(screen.getByText("Create an Account"));

  // Verify RegistrationForm component is rendered after clicking "create account"
  expect(
    screen.getByText("Enter your information to register")
  ).toBeInTheDocument();
});

test("render all the elements inside LandingPage", () => {
  render(<LandingPage />);

  expect(screen.getByText("Join us!")).toBeInTheDocument();
  expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  expect(screen.getByText("Sign in with Apple")).toBeInTheDocument();
  expect(screen.getByText("Create an Account")).toBeInTheDocument();
  expect(screen.getByText("Log in")).toBeInTheDocument();
});
