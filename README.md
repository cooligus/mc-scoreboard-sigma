# MCJ Wyniki

Minecraft Java Edition Wyniki is a tool for Minecraft Java Edition players and datapack creators who want to generate sequential scripts for datapacks using the mcfunction format. It provides a user-friendly interface to manage dialogue scripts, convert them into mcfunction commands, and handle multiple characters (users) with customizable formats.

## Features

- Import dialogue scripts from plain text or mcfunction files
- Manage users (characters) with custom names, script prefixes, and output formats
- Drag-and-drop command editing and reordering
- Export generated scripts for use in Minecraft datapacks
- Preview generated commands before exporting

## What are Users?

- **Name**: Used for recognition in the UI and script editing
- **Script Prefix**: Required for plain text imports; matches the prefix in your dialogue script (e.g., 'J' for Josh)
- **Format**: The function or command format that will be rendered in the final script (e.g., `function characters:josh {Line: "%s"}`)

## How to Use

### 1. Create Users

Before importing any script, create users for each character in your script. Set their name, script prefix, and format.

### 2. Importing from Plain Text

If you have a plain text dialogue script, ensure your users are set up first. Your script should look like this (for users Josh (J) and John (Jo)):

```
J: what's up?
Jo: Idk
J: kk
```

Paste your script into the **Import dialogues script** input in the Import dialog.

### 3. Importing from mcfunction

If you have a script in mcfunction format, also create users first. The format for each user should match the function call in your mcfunction script, e.g.:

```
function characters:john {Line: "%s"}
```

Example mcfunction script:

```
scoreboard players add @s dialogue 1
execute if score @s dialogue matches 0 run function characters:josh {Line: "what's up?"}
execute if score @s dialogue matches 0 run function characters:john {Line: "Idk"}
execute if score @s dialogue matches 0 run function characters:josh {Line: "kk"}
execute if score @s dialogue matches 0.. run scoreboard players set @s dialogue -1
```

Paste your script into the **Import mcfunction script** input in the Import dialog.

### 4. Edit and Export

- Edit, reorder, or add commands as needed
- Adjust spans (timing) for each command
- Export the generated script for use in your datapack
