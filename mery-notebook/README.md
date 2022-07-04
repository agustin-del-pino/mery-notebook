# mery-notebook

This extension stands for create and visualize notebooks that explain a certain topic.

The main propose is do the same thing as a lot of web page with interactive crash courses.

Using vscode as base code editor, the Mery Notebook appends a panel beside for read the concepts, do the practice and submit it.

## Features

- Create a new mery notebook project.
- Build a mery notebook.
- Visualize the notebook.

All of this using the vscode.

## Quick start

### New project

Press `F1` to open the command palette.
Type 'Mery: Create Project', then press enter.

This action requires enter the title of the notebook and the author. After that, will ask for the directory to create the source project folder. This directory is created by using the kebak case of the title: `directory/title-of-the-notebook`.

Will open a new vscode window with the directory of the project loaded. You must see the 'meryproject.json' file.

The 'meryproject.json' file servers is the 'source code' of the notebook.


### Adding a chapter

The `chapter` property of the 'meryprojec.json' refers to the chapters that will contain the notebook. Those chapters can be described right there in the json file, but a much prefer way to do is using the `import` property that allows to impor a file that contains the content of the chapter. For now, the only acceptable file extension is Markdown, so the `isMarkdown: true` field must be set as true.

The final result should be this:

```json
{
    ...
    "chapters":[
        {
            "isMarkdown": true,
            "import":"./chapters/introduction.md"
        }
    ]
}
```

`./chapters/introduction.md`
```
# The title of the chapter
Describing the concepts...

## Practice
Do some magic stuff and submit.

## Got stuck?
Use this hint for help.

console.log("hello");
```
_The markdown will be render as html._

A few considerations are:
1. Use relative path with period and slash. Otherwise at building time will not take effect and will treat as absolute path.

2. Follow the markdown structure, firts the title of the chapter, follow by the concepts of the topic, then an optional practice and also an optional hint.

## Building the notebook

Once you has finish all your chapters and notebook configuration, use the command 'Mery: Build notebook'. In case everything is in place, this command creates a new '*.mery' file, using the project name as filename.

## Visualize the notebook

Open the command palette, type 'Mery: Load and Open a Notebook'. Then select the notebook (*.mery) file.

Should open a new panel beside that shows the notebook.