import * as matchers from "./testutils"
import fetchMock from "jest-fetch-mock"

fetchMock.enableMocks()
expect.extend(matchers)
