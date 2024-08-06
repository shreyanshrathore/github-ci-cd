import { sayHello } from "../src/index"; // Adjust the import path

describe("sayHello", () => {
  it("should return a greeting message with the given name", () => {
    const name = "John";
    const expected = `Hello, ${name}`;

    expect(sayHello(name)).toBe(expected);
  });
});
