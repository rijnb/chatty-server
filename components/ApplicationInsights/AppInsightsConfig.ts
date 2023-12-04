import {ReactPlugin} from "@microsoft/applicationinsights-react-js"
import {ApplicationInsights} from "@microsoft/applicationinsights-web"

const disableTelemetry = !process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING

var reactPlugin = new ReactPlugin()
var appInsights = new ApplicationInsights({
  config: {
    disableTelemetry,
    connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    extensions: [reactPlugin]
  }
})

if (!disableTelemetry) {
  appInsights.loadAppInsights()
}

export {reactPlugin, appInsights}
