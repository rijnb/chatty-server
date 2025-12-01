## Quick start guide

### What's new?

For the Release Notes, please scroll down to the bottom of this page.

### Getting started

Whenever you start asking me questions in the input box below, I will try to answer them.
The questions and answers are stored in a "conversation". I use this conversation as a context
to provide you the next answer. It serves as my memory during the conversation.

If you type a '/' as the first character of your input, I will show you a list of
factory prompts you can use. If you want to enter a newline in the input, simply
type Shift-Enter, or Alt-Enter.

### Using conversations (left menu bar)

Conversations are stored in the left menu bar, and you can start a new conversation
by clicking on the "New conversation" button. You can also import and export conversations.

You can also edit the name of conversations or organize them in folders. This is
useful if you want to switch between conversation contexts. For example, suppose you are
debugging code in a conversation, and you have an added code blocks and questions. Now
you want me to quickly summarize an unrelated long email thread. In that case, it's best
to just quickly start a new conversation, a new context, and switch back to the code
conversation later.

You should also note that there is a limit to the amount of context I can handle
in conversations. This limit is "32000" tokens. The number of tokens in a conversation
is shown in the top right corner of the conversation. If you exceed this limit, I will
start to forget the oldest messages. This is not a problem if you are just asking
questions, and I am answering them.

There is also a cost associated with the number of tokens in your current conversation.
The more tokens there are in the current conversation, the more expensive it is to
generate the next answer. This is why it is good practice to regularly start new
conversations.

## Using prompts (right menu bar)

Prompts are an extremely powerful feature. They allow you to quickly tell me to
perform a certain task. For example, you can tell me to summarize a long email
thread efficiently. Or you can tell me to debug a piece of code.

You activate a prompt by typing "/" in the input box. A list of prompts will
appear. You can select using the up and down arrows and pressing Enter.
If the prompt has parameters, you can enter those in a dialog that will appear.

**Powertip**: you can quickly search for prompts by typing the first characters
of words that appear in the name of the prompt. For example, type "/mts" to
quickly find an execute "Mail thread summary".

Most prompts require you to input some text, like copy-pasting a long email
thread, or a piece of code.

You can also select a prompt from the right side bar directly. Or edit it by
clicking on the pencil icon.

### Factory prompts and user prompts

There are `factory prompts` and `user prompts`. Factory prompts are provided by me
every time you start up. They are kept up to date by me, and you cannot edit them.
They are organized in their own (factory) folders, which you cannot use.

You can create and organize your own prompts in the `user prompts` section.
Just click on "New prompt" to create a new prompt. You can also import and export
prompts. Factory prompts are exported as well, but you cannot change and re-import
them. They are automatically fetched from the server.

If you want to change a `factory prompt`, just click on the edit icon and a prompt
edit dialog will be shown. Change anything and press "Save" and the prompt
will be copied to your user prompts. You can now edit it as you like.

### Creating prompts

You can create your own prompts by clicking on "New prompt". A new prompt
will be created. Click on it in the right menu bar to edit it.
A prompt consists of:

- **Name**: this is the name of the prompt, which is shown in the prompt list.
- **Description**: this is a description of the prompt, which is shown in the prompt list.
- **Prompt**: this is the text that is shown in the input box when you select the prompt.

In the `Prompt` box you can use `{{Variable name, or title to show}}` to indicate a variable.
When you select the prompt from the chat input (using `/`), a dialog will appear where you can
enter the values in edit boxes.

You can also add `#DROP` as the last word the prompt. This will allow you to drop
files in the input box when you select the prompt. The files will be uploaded to
the server. This works only for plain text files. (Note that `#DROP` must be the last
word in the prompt.)

Dropped files are added as code blocks, prefixed with their filenames, like:

```
File: SomeCode.java
'''
Contents of the file...
'''

File: NextFile.txt
'''
Contents of the next file...
'''
```

## Using Google search

If you have Google Search API key and a Google search engine ID, you can use the Google
search plugin in Chatty. The Google plugin can be selected by clicking on the plugin
symbol left of the input bar (looks like a lightning bolt).

When Google is selected, the input you type will be sent to Google and the Google
search results will be interpreted and summarized by me, with references to the
original pages Google came up with.

## Branding your deployment with a local message or logo

You can brand your deployment with a local message or logo. Just create a file
called `welcome-message.md` in the `public` folder. This file will be shown as
Markdown when you start Chatty. In the Markdown text you can include images,
like a company logo.

For example, you can create a file `public/welcome-message.md` with the following
content:

```
. . .

![Your Company](./your-icon.png)

**This instance of the ChatGPT is hosted exclusively for Your Company.**

. . .

Your queries are not shared outside Your Company and the conversations and prompts
are stored in your local browser only. You can start chatting in the box below.
Click on `(?)` in the top menu for instructions and release notes.

. . .
```

## Adding "local" prompts to your deployment

You can add "local" prompts to your deployment, next to the default factory ones.
These are prompts that are specific to your deployment, e.g. for your company.

You should store those prompts in the `public/factory-prompts-local.json` file.
It will be picked up when the service is restarted. (You can even overwrite
factory prompts in this file, if you use the same prompt ID.)

_Happy chatting!_

_Rijn Buve & Oleksii Kulyk_

---

## Release notes

### 2025-12-01

#### Bug fixes

* Fixed control characters in input to avoid crashes with Markdown plugin.

### 2025-09-02

#### Features

- Allow backup host to use a different API key.

### 2025-08-18

#### Features

- Added new models. 
- Changed default model to `gpt-5-nano`.

### 2025-05-15

#### Features

- Fixed bug in import/export functions.

### 2025-04-10

#### Features

- Add support for openAI reasoning models like `o3-mini`, `o1`. (Thanks, Dishant Pawar!)

### 2025-03-26

#### Features

- Added support for pasting images from the clipboard.

### 2024-09-09

#### Features

- Minor change. Renamed "Writing assistant" to "Assistant".

### 2024-08-06

#### Features

- Support `gpt-4o-mini`.

### 2024-07-20

#### Features

- Chatty starts a new conversation earlier than before (after 500 tokens, instead of 4000), when
  you start the application.
- A button to cleanup old conversations is added. Only the last 10 conversations that are not
  stored in folders are kept.

### 2024-07-06

#### Features

- Added image recognition support. You can now drop images into your
  conversation, or select them from disk with image icon in the prompt bar (note that only
  the text entry box accepts the images).

### 2024-06-14

#### Bug fixes

- Changed the way how input and output token limits are handled. They used to be the same number
  but can now differ.

### 2024-06-07

#### Features

- Added GPT-4o as an option (no visuals yet).

### 2024-05-06

#### Features

- Added Linux command prompt helper to print a Linux command and its output in a code block.

### 2024-04-07

#### Bug fixes

- Replaced the temporary fix with a slightly more sophisticated one. Now, only non-ASCII characters
  are replaced withing math-string `$...$`, to avoid not being able to render other alphabets for
  regular text.

### 2024-04-04

#### Bug fixes

- Added a temporary fix to solve a crash when rendering weird characters in `$`'s. This leads to a crash
  math rendering plugin and leaves Chatty unusable. Currently, the fix is to remove weird characters
  from the output and worst-case the conversations themselves.

### 2024-03-20

#### Bug fixes

- Fixed and simplified the system prompt to render formulas correctly in `gpt-35-turbo`.

### 2024-03-06

#### Features

- Added environment variable "OPENAI_REUSE_MODEL" to reuse the model when starting a new conversation, or fall back to
  the default model. Values: true (reuse model for new conversation, or false (fall back to default model).
- Added environment variable "OPENAI_ALLOW_MODEL_SELECTION" to allow model selection in the conversation. Values: true
  (allow model selection), or false (do not allow model selection).
- Changed semantics of `OPENAI_AZURE_DEPLOYMENT_ID`: it can now be a list of IDs, separated by ";".
  The first item specifies a prefix to be used for all models, except for the exceptions in the list
  which are listed after that.
  For example if `OPENAI_AZURE_DEPLOYMENT_ID` is set to `dep-;PTU-gpt-35-turbo`, then the `dep-` prefix is used for all
  models, except `gpt-35-turbo`, because for that the ID would be used `PTU-gpt-35-turbo` instead.

#### Bug fixes

- When switching between OpenAI and Azure, the `modelId` in the select conversation could be
  non-existent, leading the web page to fail at load time.
- Starting a new conversation or clearing an existing one now adhere to the `OPENAI_REUSE_MODEL` setting.
- Fixed 16K limit for `gpt-35-turbo` model.

### 2023-12-05

#### Bug fixes

- Show error when local storage is full.

### 2023-12-22

#### Features

- Fixed model names and max token counts.
- Earlier additions:
  - Added support for WebVTT files, so you can summarize the transcripts of Teams sessions.
    we've also implemented a standard prompt for this (in folder Productivity). Just drop the
    downloaded transcript file into the prompt dialog.
    -Added support for locally deployed factory prompts, if you want you deployment to have
    prompts specific to your (e.g. company) deployment, next to the standard ones.
    -Added support for LaTeX rendering of formulas.
    -Added ability to modify the system prompt (stored in model selection per conversation).
    The system prompt precedes all items in a conversation and allows you to change the
    behavior of the model during a conversation.

### 2023-11-23

#### Features

- Improved names and folders of factory prompts.

### 2023-11-20

#### Bug fix

- Remove old factory prompts and folders before importing new ones.

### 2023-11-10

- #### Features

- Added ability to show a specific message for your deployment.
- Changed default path to `/`.

### 2023-10-31

#### Features

-

- Updated dependencies to latest.
- Changed default path to `/chatty`.

### 2023-10-25

#### Features

- Added support for LaTeX formulas.
- Added ability to modify system prompt in model settings.

### 2023-09-22

#### Features

- Added improved side bar handling.

### 2023-09-17

#### Features

- Added model selection support. You can now select the model you want to use for a conversation.

#### Bug fixes

- Fixed several regenerate, edit and delete messages bugs.

### 2023-09-03

#### Features

- Clicking on a prompt executes it, rather than edit. Separate edit button.
- Token counting provides cleanup button and color coding.
- Improved handling of prompt search a la IntelliJ.
- Added Alt-Enter as key.
- Improved handling of newlines in input.

#### Bug fixes

- UI bug fixes for prompt list handling.

### 2023-08-29

#### Features

- Added better main menu.
- Added support for "IntelliJ"-like search for prompts (just type characters to match prompt name).
- Improved handling of large conversations with code. Large files are not syntax highlighted anymore.

#### Bug fixes

- Refactored code to be better componentized.

### 2023-08-23

#### Features

- Erasing conversation history button moved to bottom.
- Added support for selecting markdown and C# files in the file selector.

#### Bug fixes

- Fixed bug that would show the wrong title of a prompt in the dialog.
- Fixed bug that prevent pressing Enter on the prompt dialog when there's a file drop zone.
- Fixed bug that caused selecting files not to work.
- Greatly improved handling of token counting.
- Greatly improved server error handling.

### 2023-08-11

#### Features

- Added support for dropping files using `#DROP` in a prompt.

#### Bug fixes

- Cleanup of `FC` objects.

### 2023-08-11

#### Features

- Improved handling of window resizes and width of conversation column.
- The previous conversation is now automatically selected when you start Chatty unless it's larger than a threshold (to
  avoid consuming too many tokens by accident).

#### Bug fixes

- Fixed incorrect visual artifacts for code blocks.
- Release notes readable in dark theme.
- Improved log messages.
- Fixed unlock code handling.
- Fixed startup issue and r

### 2023-08-06

#### Features

- Improved handling of factory folder; shows dividers for factory/user folders.
- Escape clears input buffer.

### 2023-08-03

#### Features

- Factory folders have a different icon now.
- Handle content management policy violations by Azure OpenAI in a more user-friendly way.
- Great new factory prompts to play with!

#### Bug fixes

- Factory Prompts are cloned even if no changes are made (#32).
- Improved handling of editing factory prompts.
- Fixed pop-up prompts list selection error.

### 2023-07-29

#### Features

- Added factory prompts. Everyone receives the factory prompts. They are automatically updated when you start. If you
  edit them, they become 'user prompts'. If you wish tp get the factory one back, just delete it and reload the page.
- Removed settings menu (with only a theme selection) and created icon to slip between dark/light theme instead.
- Sorted prompt list.

#### Bug fixes

- Source code cleanup.
- Fixed bug when importing would trigger wrong `onChange` handler and the handler would not always be called.
- Removed delete button for factory prompts.

### 2023-07-26

#### Features

- Improved welcome screen and handling of API key, unlock code and loading models.
- Top status now always visible, to choose model and show release notes.
- Improved message input box to only show "/" if applicable.

#### Bug fixes

- Fixed prompt selector. Only works on start of line and cannot scroll below list.
- Fixed cancelling prompt. Now empties input bar.
- Fixed message delete, which sometimes failed.

### 2023-07-24

#### Features

- Added token usage counter that turns red when older messages are being automatically discarded.
- Separated importing/exporting conversations and prompts. Both use the same file format and are compatible with the
  existing V4 format.
- Added menu on right side to deal with prompts.
- Added Markdown export of current conversation.
- Added screenshot export of current conversation.
- Added release notes button.
- Imported prompts update existing prompts and adds new prompts.
- Added multi-file selector for importing prompts.

#### Bug fixes

- Fixed time stamp bug when creating a new conversation.
- Improved server error handling and exception handling.
- Improved server timeout handling.
- Introduced 2 minute timout for really long responses.
- Fixed token count.
- Fixed screen width issues.
- Fixed icon of settings on top.
- Improved layout of top bar.
- Full cleanup of source code and directory structure, removal of old files.

### Found an issue?

Please report issues and features requests on the
[GitHub issue tracker](https://github.com/rijnb/chatty-server/issues).
