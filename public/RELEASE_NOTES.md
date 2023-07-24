## Release notes

### 2023-07-24

#### Features
* Added token usage counter that turns red when older messages are being automatically discarded.
* Separated importing/exporting conversations and prompts. Both use the same file format and are compatible with the
  existing V4 format.
* Added menu on right side to deal with prompts.
* Added Markdown export of current conversation.
* Added screenshot export of current conversation.
* Added release notes button.

#### Bug fixes

* Full clean up of source code and directory structure.
* Fixed time stamp bug when creating a new conversation.
* Improved server error handling.
* Introduced 2 minute timout for really long responses.
* Fixed token count.
* Fixed screen width issues.

### Found an issue?

Please report issues and features requests on the
[Github issue tracker](https://github.com/rijnb/chatty-server/issues).