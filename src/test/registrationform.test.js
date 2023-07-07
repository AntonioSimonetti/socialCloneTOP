import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegistrationForm from "../components/registrationform";

test("renders registration form with all fields", () => {
  render(<RegistrationForm />);

  // Assert that all form fields are present
  expect(screen.getByLabelText("Name:")).toBeInTheDocument();
  expect(screen.getByLabelText("Age:")).toBeInTheDocument();
  expect(screen.getByLabelText("Email:")).toBeInTheDocument();
  expect(screen.getByLabelText("Password:")).toBeInTheDocument();
  expect(screen.getByLabelText("Confirm Password:")).toBeInTheDocument();
  expect(screen.getByLabelText("Position:")).toBeInTheDocument();
});

test("displays error message if fields are not filled", () => {
  render(<RegistrationForm />);

  // Click the register button without filling any fields
  fireEvent.click(screen.getByText("Register"));

  // Assert that the error message is displayed
  expect(
    screen.getByText("Please fill in all the fields.")
  ).toBeInTheDocument();
});

it("test the element that containts the error is in the dom", () => {
  render(<RegistrationForm />);

  // Assert that <p> element used to show error messages is displayed
  expect(
    screen.getByText(/Enter your information to register/i)
  ).toBeInTheDocument();
});

it("show the error message after fill only one input field", () => {
  render(<RegistrationForm />);

  const nameInput = screen.getByLabelText(/Name:/i);
  fireEvent.change(nameInput, { target: { value: "John Doe" } });

  // Click the register button without filling the others fields
  fireEvent.click(screen.getByText("Register"));

  // Assert that the error message is displayed
  expect(
    screen.getByText("Please fill in all the fields.")
  ).toBeInTheDocument();
});

it("select a position from the dropdown", () => {
  render(<RegistrationForm />);

  // Select a position from the dropdown
  fireEvent.change(screen.getByLabelText("Position:"), {
    target: { value: "United States" },
  });

  // Assert that the selected position is displayed in the dropdown
  expect(screen.getByLabelText("Position:")).toHaveValue("United States");
});

it("show the right error message when password is weak", () => {
  render(<RegistrationForm />);

  const nameInput = screen.getByPlaceholderText(/Enter your name/);
  fireEvent.change(nameInput, { target: { value: "John Doe" } });

  const ageInput = screen.getByPlaceholderText(/Enter your age/);
  fireEvent.change(ageInput, { target: { value: "25" } });

  const emailInput = screen.getByPlaceholderText(/Enter your email/);
  fireEvent.change(emailInput, { target: { value: "johndoe@example.com" } });

  const passwordInput = screen.getByPlaceholderText(/Enter your password/);
  fireEvent.change(passwordInput, { target: { value: "3131" } });

  const confirmPasswordInput = screen.getByPlaceholderText(
    /Confirm your password/
  );
  fireEvent.change(confirmPasswordInput, { target: { value: "3131" } });

  const positionInput = screen.getByLabelText("Position:");
  fireEvent.change(positionInput, { target: { value: "United States" } });

  fireEvent.click(screen.getByText("Register"));

  // Assert that the error message is displayed
  expect(
    screen.getByText(
      "Password must contain at least one symbol, one number, and one capital letter."
    )
  ).toBeInTheDocument();
});

it("show the right error message when password and confirm password are different", () => {
  render(<RegistrationForm />);

  const nameInput = screen.getByPlaceholderText(/Enter your name/);
  fireEvent.change(nameInput, { target: { value: "John Doe" } });

  const ageInput = screen.getByPlaceholderText(/Enter your age/);
  fireEvent.change(ageInput, { target: { value: "25" } });

  const emailInput = screen.getByPlaceholderText(/Enter your email/);
  fireEvent.change(emailInput, { target: { value: "johndoe@example.com" } });

  const passwordInput = screen.getByPlaceholderText(/Enter your password/);
  fireEvent.change(passwordInput, { target: { value: "3131" } });

  const confirmPasswordInput = screen.getByPlaceholderText(
    /Confirm your password/
  );
  fireEvent.change(confirmPasswordInput, { target: { value: "31311" } });

  const positionInput = screen.getByLabelText("Position:");
  fireEvent.change(positionInput, { target: { value: "United States" } });

  // Click the register button without filling the others fields
  fireEvent.click(screen.getByText("Register"));

  // Assert that the error message is displayed
  expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
});

it("show the right error message when the email format is invalid", () => {
  render(<RegistrationForm />);

  const nameInput = screen.getByPlaceholderText(/Enter your name/);
  fireEvent.change(nameInput, { target: { value: "John Doe" } });

  const ageInput = screen.getByPlaceholderText(/Enter your age/);
  fireEvent.change(ageInput, { target: { value: "25" } });

  const emailInput = screen.getByPlaceholderText(/Enter your email/);
  fireEvent.change(emailInput, { target: { value: "notvalid.com" } });

  const passwordInput = screen.getByPlaceholderText(/Enter your password/);
  fireEvent.change(passwordInput, { target: { value: "Validpassword1!" } });

  const confirmPasswordInput = screen.getByPlaceholderText(
    /Confirm your password/
  );
  fireEvent.change(confirmPasswordInput, {
    target: { value: "Validpassword1!" },
  });

  const positionInput = screen.getByLabelText("Position:");
  fireEvent.change(positionInput, { target: { value: "United States" } });

  // Click the register button without filling the others fields
  fireEvent.click(screen.getByText("Register"));

  // Assert that the error message is displayed
  expect(screen.getByText("Invalid email.")).toBeInTheDocument();
});

it("No error message is displayed after successful registration", () => {
  render(<RegistrationForm />);

  const nameInput = screen.getByPlaceholderText(/Enter your name/);
  fireEvent.change(nameInput, { target: { value: "John Doe" } });

  const ageInput = screen.getByPlaceholderText(/Enter your age/);
  fireEvent.change(ageInput, { target: { value: "25" } });

  const emailInput = screen.getByPlaceholderText(/Enter your email/);
  fireEvent.change(emailInput, { target: { value: "test@testing.com" } });

  const passwordInput = screen.getByPlaceholderText(/Enter your password/);
  fireEvent.change(passwordInput, { target: { value: "Validpassword1!" } });

  const confirmPasswordInput = screen.getByPlaceholderText(
    /Confirm your password/
  );
  fireEvent.change(confirmPasswordInput, {
    target: { value: "Validpassword1!" },
  });

  const positionInput = screen.getByLabelText("Position:");
  fireEvent.change(positionInput, { target: { value: "United States" } });

  // Click the register button without filling the others fields
  fireEvent.click(screen.getByText("Register"));

  // Verifica no error message exist
  expect(screen.queryByText("Please fill in all the fields.")).toBeNull();
  expect(screen.queryByText("Invalid email.")).toBeNull();
  expect(screen.queryByText("Email already in use.")).toBeNull();
  expect(screen.queryByText("Passwords do not match.")).toBeNull();
  expect(screen.queryByText("Error during registration.")).toBeNull();
  expect(
    screen.queryByText(
      "Password must contain at least one symbol, one number, and one capital letter."
    )
  ).toBeNull();
});

//TO DO: TEST EMAIL DUPLICATION
