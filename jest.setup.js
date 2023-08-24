import "@testing-library/jest-dom/extend-expect"
import fetchMock from "jest-fetch-mock"
import {TextDecoder, TextEncoder} from "util"

import "./styles/globals.css"
import * as matchers from "./testutils/matchers"

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

fetchMock.enableMocks()
expect.extend(matchers)
jest.mock("next/router", () => require("next-router-mock"))
