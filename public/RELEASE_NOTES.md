## Quick start guide

### Getting started

Whenever you start asking me questions in the input box below, I will try to answer them. 
The questions and answers are stored in a "conversation". I use this conversation as a context
to provide you the next answer. It serves as my memory during the conversation.

### Using conversations (left menu bar)

Conversations are stored in the left menu bar, and you can start a new conversation
by clicking on the "New conversation" button. You can also import and export conversations.

You can also edit the name of conversations or organize them in folders. This is
useful if you want to switch between conversation contexts. For example, suppose you are
debugging code in a conversation and you have a added code blocks and questions. Now
you want me to quickly summarize an unrelated long email thread. In that case, it's best
to just quickly start a new conversation, a new context, and switch back to the code
conversation later.

You should also note that there is a limit to the amount of context I can handle
in conversations. This limit is "32000" tokens. The number of tokens in a conversation
is shown in the top right corner of the conversation. If you exceed this limit, I will
start to forget the oldest messages. This is not a problem if you are just asking
questions and I am answering them.

There is also a cost associated with the number of tokens in your current conversation. 
The more tokens there are in the current conversation, the more expensive it is to
generate the next answer. This is why  it is good practice to regularly start new 
conversations. 

## Using prompts (right menu bar)

Prompts are an extremely powerful feature. They allow you to quickly tell me to
perform a certain task. For example, you can tell me to summarize a long email
thread efficiently. Or you can tell me to debug a piece of code. 

You activate a prompt by typing "/" in the input box. A list of prompts will
appear. You can select a prompt by clicking on it, or using the up and
down arrows and pressing Enter. If the prompt has parameters, you can
enter those in a dialog that will appear.

Most prompts require you to input some text, like copy-pasting a long email
thread, or a piece of code.

### Factory prompts and user prompts

There are `factory prompts` and `user prompts`. Factory prompts are provided by me
every time you start up. They are kept up to date by me and you cannot edit them.
They are organized in their own (factory) folders, which you cannot use.

You can create and organize your own prompts in the `user prompts` section. 
Just click on "New prompt" to create a new prompt. You can also import and export
prompts. Factory prompts are exported as well, but you cannot change and re-import
them. They are automatically fetched from the server.

If you want to change a `factory prompt`, just click on it and a prompt
edit dialog will be shown. Change anything and press "Save" and the prompt
will be copied to your user prompts. You can now edit it as you like.

## Using Google search

If you have Google API key and a Google search engine ID, you can use the Google 
search plugin in Chatty. The Google plugin can be selected by clicking on the plugin 
symbol left of the input bar (looks like a lightning bolt).

When Google is selected, the input you type will be sent to Google and the Google
search results will be interpreted and summarized by me, with references to the
original pages Google came up with.


_Happy chatting!_

_Rijn Buve & Oleksii Kulyk_

---

## Release notes

### 2023-08-10

#### Features

* Improved handling of window resizes and width of conversation column.

#### Bug fixes

* Fixed incorrect visual artifacts for code blocks.
* Release notes readable in dark theme.
* Improved log messages.
* Fixed unlock code handling.
* Fixed startup issue and r

### 2023-08-06

#### Features

* Improved handling of factory folder; shows dividers for factory/user folders.
* Escape clears input buffer.

### 2023-08-03

#### Features

* Factory folders have a different icon now.
* Handle content management policy violations by Azure OpenAI in a more user friendly way.
* Great new factory prompts to play with!

#### Bug fixes

* Factory Prompts are cloned even if no changes are made (#32).
* Improved handling of editing factory prompts.
* Fixed pop-up prompts list selection error.

### 2023-07-29

#### Features

* Added factory prompts. Everyone receives the factory prompts. They are automatically updated when you start. If you
  edit them, they become 'user prompts'. If you wish tp get the factory one back, just delete it and reload the page.
* Removed settings menu (with only a theme selection) and created icon to slip between dark/light theme instead.
* Sorted prompt list.

#### Bug fixes

* Source code cleanup.
* Fixed bug when importing would trigger wrong `onChange` handler and the handler would not always be called.
* Removed delete button for factory prompts.

### 2023-07-26

#### Features

* Improved welcome screen and handling of API key, unlock code and loading models.
* Top status now always visible, to choose model and show release notes.
* Improved message input box to only show "/" if applicable.

#### Bug fixes

* Fixed prompt selector. Only works on start of line and cannot scroll below list.
* Fixed cancelling prompt. Now empties input bar.
* Fixed message delete, which sometimes failed.

### 2023-07-24

#### Features

* Added token usage counter that turns red when older messages are being automatically discarded.
* Separated importing/exporting conversations and prompts. Both use the same file format and are compatible with the
  existing V4 format.
* Added menu on right side to deal with prompts.
* Added Markdown export of current conversation.
* Added screenshot export of current conversation.
* Added release notes button.
* Imported prompts update existing prompts and adds new prompts.
* Added multi-file selector for importing prompts.

#### Bug fixes

* Fixed time stamp bug when creating a new conversation.
* Improved server error handling and exception handling.
* Improved server timeout handling.
* Introduced 2 minute timout for really long responses.
* Fixed token count.
* Fixed screen width issues.
* Fixed icon of settings on top.
* Improved layout of top bar.
* Full cleanup of source code and directory structure, removal of old files.

### Found an issue?

Please report issues and features requests on the
[GitHub issue tracker](https://github.com/rijnb/chatty-server/issues).
