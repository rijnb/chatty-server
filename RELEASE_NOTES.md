# Chatty (Conversational Host At TomTom... Yes!)

ChattyUI is a Mac client for the TomTom Azure OpenAI GPT-4 model.
It is simply a much better client interface than the standard GPT-4 interface.

It allows you to use GPT-4 for many tasks. For that, it allows you to store
"prompts" (in folders), that allows you to quickly have GPT-4 analyze your text
in a certain way and respond to you.

I've created a whole bunch of prompts to start with. To use them, import the file
`example-prompts.json` in ChattyUI with `Import config`. Then, on the prompt line,
type `/` and search for a prompt and press enter.

For example, to summarize a mail thread efficiently, select the entire mail text
in Outlook, then go to ChattyUI, press `/`, type `mail` and select `Summarize mail`.
Paste the text in the dialog and press Enter. This produces the full prompt you for
GPT-4. Just press Enter again to execute it.

ChattyUI is work in progress.

If you like it, or if you have comments, reach out to me.

Happy chatting!

Rijn Buve

## Installation and first-time use

No special installation is needed for the app. You can drop it anywhere and
run it from there.

The Mac app is not fully signed yet, so the first time you start it, your Mac may
tell you it cannot open the app, because it cannot check it for malicious software.

In that case, go to your `System Settings/Privacy & Security` and scroll down to
Security. There should be an `Open Anyway` button. You can click that and click
`Open` when your Mac asks you to open the app anyway.

**Important:** You will need a secret `Unlock code` to issues any prompts. 
Contact me directly to get that code.


## If you installed the previous version, TomTom ChatBot UI...

This new version of "chatbot-ui" uses a server and a thin client to use Azure OpenAI.
You need to provide the Azure OpenAI (and your Google API key and CSE ID) in the application.

None of the environment variables that the old TomTom ChatBot UI used are relevant to end 
users anymore.

The server is pre-configured for the TomTom Azure end-point, but it does not contain the
API key to use that end point.

Before you can use the UI, you need to unlock it once, using an unlock code.
Ping me for that code on Slack.

## What about sensitive info?

For now, the server is currently a private app server server, running on the Digital 
Ocean platform.

The server does NOT store or log any of the prompts, conversations, API keys or other secrets.
These are all kept client side and stored in browser 'local storage'. 
They are sent (through SSL) to the server, of course, but not logged or persisted server-side.
(Exception: The server logs may contain at most the first 8 characters of your prompts 
for debugging purposes, but no more).

## How was this built?

The server system is built with React/Next.js in TypeScript and the thin client is a
native Swift application built in Xcode.

(And, yes, I relied heavily on ChatGPT-4 to help me use these technologies.)

## Can I contrbute?

By all means. Contact me.

