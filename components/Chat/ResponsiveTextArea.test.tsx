/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
