## Release notes

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