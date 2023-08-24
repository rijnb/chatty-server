import {fireEvent, render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"

import ResponsiveTextArea from "./ResponsiveTextArea"

describe("ResponsiveTextArea", () => {
  const onChangeMock = jest.fn()
  const onSaveMock = jest.fn()

  beforeEach(() => {
    render(<ResponsiveTextArea content="my content" onChange={onChangeMock} onSave={onSaveMock} />)
  })

  it("renders", () => {
    expect(screen.getByRole("textbox")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toHaveValue("my content")
  })

  it("calls onChange when typing", async () => {
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "!")
    expect(onChangeMock).toHaveBeenCalledWith("my content!")
  })

  it("calls onSave when Enter is pressed without Shift", async () => {
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "{Enter}")
    expect(onSaveMock).toHaveBeenCalledWith()
  })

  it("does not call onSave when Enter is pressed with Shift", async () => {
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "{Shift>}{Enter}")

    expect(onSaveMock).not.toHaveBeenCalled()
    expect(onChangeMock).toHaveBeenCalledWith("my content\n")
  })

  it("resizes on multiline content", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {configurable: true, value: 40})

    const textArea = screen.getByRole("textbox")
    fireEvent.change(textArea, {target: {value: "Line 1\nLine 2"}})

    expect(textArea.style.height).toBe("40px")
  })
})
