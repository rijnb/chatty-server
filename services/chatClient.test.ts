import {LineDecoder} from "@/services/chatClient"

describe("LineDecoder", () => {
  const encoder = new TextEncoder()

  it("consumes unfinished message", async function () {
    const decoder = new LineDecoder()

    expect(decoder.decodeLine(encoder.encode("line1"))).toEqual([])
    expect(decoder.flush()).toEqual(["line1"])
  })

  it("consumes single message", async function () {
    const decoder = new LineDecoder()

    expect(decoder.decodeLine(encoder.encode("line1\n"))).toEqual(["line1"])
    expect(decoder.flush()).toEqual([])
  })

  it("splits single chunk", async function () {
    const decoder = new LineDecoder()

    expect(decoder.decodeLine(encoder.encode("line1\nline2\nline3"))).toEqual(["line1", "line2"])
    expect(decoder.flush()).toEqual(["line3"])
  })

  it("aggregates data", async function () {
    const decoder = new LineDecoder()

    expect(decoder.decodeLine(encoder.encode("part1"))).toEqual([])
    expect(decoder.decodeLine(encoder.encode("part2"))).toEqual([])
    expect(decoder.decodeLine(encoder.encode("part3\n"))).toEqual(["part1part2part3"])

    expect(decoder.flush()).toEqual([])
  })
})
