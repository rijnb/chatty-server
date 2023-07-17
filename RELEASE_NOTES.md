# TomTom ChatBot UI (release notes)

The TomTom ChatBot UI is a fork of the much appreciated ChatBot UI repository.
The text of the original `README.md` can be found below.

Important: Normally, you should use the app WITHOUT the console. Only start the app with
the console if it fails to load. The very first load time may be very long (minutes).
Hang in there.

## Before you begin

You need to have `node` and `npm` installed on your system with `brew`.  
Install `brew` from a Terminal window like this:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install `node` and `npm` from a Terminal window like this:

```
brew install node
brew install npm
```

## Troubleshooting

If the app does not start for some reason, here are some things you can try.
Obviously, the app should 'just work', but while in development, these steps
may help you...

* Make sure no 'old processes' are running. They may be blocking the port. You can kill them with:
    * `killall node`
    * `killall next`
    * `killall ChatbotUI`
* Restart the app.

If that doesn't work, log out and log in again. If that doesn't work, reboot your computer.

## Using environment variables or `.env.local`

You can specify your OpenAI key as an environment variable in `.zshenv`.
Supported environment variables:

```
# ChatBot UI/OpenAI Azure:
export OPENAI_API_KEY=YOUR_AZURE_OPENAI_KEY
export OPENAI_DEFAULT_TEMPERATURE=0.8
export OPENAI_GUEST_CODE=1234
export OPENAI_API_HOST=YOUR_AZURE_OPENAI_HOST
export OPENAI_API_TYPE=azure
export OPENAI_API_VERSION=2023-05-15
export OPENAI_AZURE_DEPLOYMENT_ID=YOUR
export OPENAI_DEFAULT_MODEL=gpt-4-32k

# If you have Google keys for search/CSE, you can add them here:
# export GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
# export GOOGLE_CSE_ID=YOUR_GOOGLE_CSE_ID
```

## Release notes (newest on top)

### 1.3.0

* Added features
    * Prepared to work on shared Node.js server, instead of just stand-alone.
    * Added guest code to protect site.

* Fixed bugs
    * Fixed reading Google API key second time (would crash client).

### 1.2.3

* Added features
    * Added syntax checking for JSON import.
    * Renamed "Export conversations" to "Export Markdown".
    * Renamed "New chat" to "New conversation".

* Fixed bugs
    * Fixed bug where setting temperature to 0.0 would not work.
    * Fixed bug where the app would not start on X86 systems. This was caused by including an ARM64 version of
      Electron. The app now only includes the multi-platform version of Electron.

### 1.2.2

* Fixed bugs
    * Started Next.js from Electron Electron application instead of from Node.js. This should fix the problem of
      the app not starting on some systems. It also checks if `npm` is installed.
    * Installing `node` and `npm` is now required. The app will probably not start without it.

### 1.2.1

Important: if this version does not work for you (it does not start), let me know and revert to 1.2.0.
The Node.js installation was removed from the package as Electron should be able to provide this.

* Added features
    * Removed Node.js from cpu directory in package, making the package smaller. The server is started from Electron
      instead.

* Fixed bugs
    * Window width extended.

### 1.2.0

* Added features
    * Added "Export conversations" to allow exporting conversations in Markdown format. The conversations are zipped
      up (in their folders) and exported to Downloads.
    * Added screenshot feature (top bar, most-right icon) to export current conversation as PNG. Easy for sharing.
    * Added time stamps to conversations in left bar.
    * Added smart token handling and token counting in right bottom corner. This shows you how many tokens are sent to
      the server for a prompt.
      The GPT4-32K model has a limit of 32K tokens per prompt. The application automatically truncates messages from the
      top, to make sure the latest answers will fit the conversation.
    * Environment variables names change: Renamed environment variables to ALWAYS start with "OPENAI". Changed names
      are:

```
    NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT is now: OPENAI_DEFAULT_SYSTEM_PROMPT
    NEXT_PUBLIC_DEFAULT_TEMPERATURE   is now: OPENAI_DEFAULT_TEMPERATURE
    DEFAULT_MODEL                     is now: OPENAI_DEFAULT_MODEL
    AZURE_DEPLOYMENT_ID               is now: OPENAI_AZURE_DEPLOYMENT_ID
 ```

* Fixed bugs
    * Hanging processes after quite/battery drain: Fixed hanging 'node' processes after quit (which could drain your
      battery).
    * Disappearing main window: Electron icon in task bar shown to be able to regain focus of main window.
    * Changed versioning scheme to x.y.z. Previous version was 1.10. This version is 1.2.0. The next version will be
      1.2.1 if it's a minor update (bug fix) or 1.3.0 if it's a major update (new feature).
    * Renamed export files to make more sense.
    * Deduplicated GPT models in dropdown.
    * Allow text to stretch to full width of window.

### 1.1.0 (originaly named "1.10")

* First kind of stable version.
* Suffers from hanging processes after quitting (drains battery).

---

July 2023,
*Rijn Buve*

---

## Acknowledgements

The repo is a fork of https://github.com/mckaywrigley/chatbot-ui.
Many thanks to McKay Wrigley for his work on this.
