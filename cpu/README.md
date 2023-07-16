# Package ChatBot UI as a Mac app

You can package it as a Mac app using Platypus, which can execute the `start.zsh` script
in a windowless mode. To do so, first build the app using `npm run build`, then include all regular files
and directories, as well as the `.env.local` file and `.next/` directory in the Platypus app.
The directory `cpu` contains the `node` and `libuv` directories for different CPU architectures.

