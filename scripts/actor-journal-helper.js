Hooks.once('setup', () => {
  game.settings.register("actor-journal-helper", "closeCharacterSheetOnJournalEditing", {
    name: 'Close Character Sheet After Clicking the "Journal" Button',
    hint: 'When enabled, the character sheet will close when opening the journal editor with the "Journal" button.',
    scope: "world",
    config: true,
    default: true,
    requiresReload: true,
    type: Boolean
  });
  
  game.settings.register("actor-journal-helper", "closeJournalPageEditorOnSave", {
    name: "Close Journal Page Editor on Save",
    hint: "When enabled, the ProseMirror journal page editor will close automatically when saving changes.",
    scope: "world",
    config: true,
    default: true,
    requiresReload: true,
    type: Boolean
  });

  game.settings.register("actor-journal-helper", "sharedJournalPages", {
    name: 'Allow Journal Page Sharing',
    hint: 'When enabled, the "Journal" button creates a single journal page in the "Actor Journal" for each actor. Deactivate this to if you want the "Journal" button to generate a unique page for each user. Other settings may allow other users to access these pages though.',
    scope: "world",
    config: true,
    default: "none",
    requiresReload: true,
    type: Boolean
  });

  game.settings.register("actor-journal-helper", "defaultOwnership", {
    name: 'Set Default Ownership of "Actor Journal" Pages to "None"',
    hint: 'When enabled, the default ownership for the pages created with the "Journal" button is set to "None". Deactivate this to set it to "Owner". Automatic and manual ownership updates should be unnecessary with this deactivated as all users should be owners.',
    scope: "world",
    config: true,
    default: "none",
    type: Boolean
  });
  
  game.settings.register("actor-journal-helper", "automaticAlphabetization", {
    name: "Allow Automatic Journal Page Alphabetization with Socketlib",
    hint: 'When enabled, this automatically alphabetized journal pages in the "Actor Journal" by page name whenever a new pages is created using the "Journal" button. You may need to have Library - socketlib module activated depending on ownership configurations.',
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  
  game.settings.register("actor-journal-helper", "automaticOwnership", {
    name: "Allow Automatic Journal Pages Ownership Updates with Socketlib",
    hint: 'When enabled, socketlib will automatically update ownership of journal pages in the "Actor Journal" when required. You must have Library - socketlib module activated for this to work.',
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  
  game.settings.register("actor-journal-helper", "actorJournalName", {
    name: "Customize the name of the Actor Journal",
    hint: 'When changed, Actor Journal will use a custom name instead of "Actor Journal". If changed after the original journal has been created, it will contribute to the newly named one instead.',
    scope: "world",
    config: true,
    default: "Actor Journal",
    requiresReload: true,
    type: String
  });

  game.settings.register("actor-journal-helper", "journalButtonDisplay", {
    name: "Journal Button Display",
    hint: "Choose which journal buttons to display on the actor sheet.",
    scope: "world",
    config: true,
    default: 1,
    requiresReload: true,
    type: Number,
    choices: {
      1: "Button for Edit Actor Journal",
      2: "Button for View Actor Journal",
      3: "Both Buttons"
    }
  });
});

let closeCharacterSheetOnJournalEditing;
let closeJournalPageEditorOnSave;
let automaticAlphabetization;
let defaultOwnershipSetting;
let sharedJournalPages;
let automaticOwnership;
let actorJournalName;

async function getSettings() {
  closeCharacterSheetOnJournalEditing = game.settings.get("actor-journal-helper", "closeCharacterSheetOnJournalEditing");
  closeJournalPageEditorOnSave = game.settings.get("actor-journal-helper", "closeJournalPageEditorOnSave");
  automaticAlphabetization = game.settings.get("actor-journal-helper", "automaticAlphabetization");
  defaultOwnershipSetting = game.settings.get("actor-journal-helper", "defaultOwnership");
  sharedJournalPages = game.settings.get("actor-journal-helper", "sharedJournalPages");
  automaticOwnership = game.settings.get("actor-journal-helper", "automaticOwnership");
  actorJournalName = game.settings.get("actor-journal-helper", "actorJournalName");
  journalButtonDisplay = game.settings.get("actor-journal-helper", "journalButtonDisplay");
};

async function ensureActorJournalExists() {
  const actorJournalEntry = game.journal.getName(actorJournalName);
  
  if (!actorJournalEntry) {
    await JournalEntry.create({
      name: actorJournalName,
      ownership: {
        default: 3,
      }
    });
  }
};

async function alphabetizeActorJournalPages() {
  try {
    const actorJournalEntry = game.journal.getName(actorJournalName);
    const sortedPages = actorJournalEntry.pages
      .map(page => ({ _id: page.id, name: page.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((page, index) => ({ _id: page._id, sort: index }));

    await actorJournalEntry.updateEmbeddedDocuments('JournalEntryPage', sortedPages);
  } catch (error) {
    ui.notifications.warn(`Ask your GM alphabetize the "Actor Journal" pages or activate socketlib.`);  }
};

Hooks.once('ready', async () => {
  getSettings()
  ensureActorJournalExists()
});

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("actor-journal-helper");
  socket.register("updateOwnership", updateOwnership);
  socket.register("alphabetizeActorJournalPages", alphabetizeActorJournalPages);
});

async function updateOwnership(journalEntryId, journalPageId, requesterUserId) {
  try {
    const journal = game.journal.get(journalEntryId);
    const journalPage = journal.getEmbeddedDocument("JournalEntryPage", journalPageId);

    if (journalPage) {
      const updateData = {
        "ownership": {
          ...journalPage.getFlag("core", "ownership"),
          [requesterUserId]: 3
        }
      };

      await journalPage.update(updateData);
    } else {
      ui.notifications.error("Journal page not found.");
    }
  } catch (error) {
    ui.notifications.error(`Error updating ownership: ${error}`);
  }
};

Hooks.on('renderActorSheet', (app, html, data) => {
  const header = html.find('.window-header');
  const journalEditorButtonTooltipText = game.i18n.localize('actor-journal-helper.journal-editor-tooltip');
  const journalViewerButtonTooltipText = game.i18n.localize('actor-journal-helper.journal-viewer-tooltip');

  const journalEditorButton = $(`
    <a class="header-button control journal" data-tooltip="${journalEditorButtonTooltipText}">
      <i class="fa fa-pencil-alt"></i>
    </a>
  `);

  const journalViewerButton = $(`
    <a class="header-button control journal" data-tooltip="${journalViewerButtonTooltipText}">
      <i class="fa fa-book-open"></i>
    </a>
  `);

  if (journalButtonDisplay === 1 || journalButtonDisplay === 3) {
    header.children().last().before(journalEditorButton);
  }
  if (journalButtonDisplay === 2 || journalButtonDisplay === 3) {
    header.children().last().before(journalViewerButton);
  }

  journalEditorButton.on('click', async (e) => {
    e.preventDefault();
    await openJournalPage(app, true);
  });

  journalViewerButton.on('click', async (e) => {
    e.preventDefault();
    await openJournalPage(app, false);
  });
});

async function openJournalPage(app, editMode) {
    let defaultOwnership;
    if (defaultOwnershipSetting === true) {
      defaultOwnership = {
        default: 0,
        [game.userId]: 3,
      };
    } else {
      defaultOwnership = {
        default: 3,
      };
    };

    await ensureActorJournalExists()
    const actorJournalEntry = await game.journal.getName(actorJournalName);

    const actorJournalPageArray = await actorJournalEntry.pages.filter(page => {
      return page.getFlag('actor-journal-helper', 'actorId') === app.actor.id
    });
    
    let pageArray;

    if (actorJournalPageArray.length > 0) {
      pageArray = await actorJournalPageArray.filter(page => {
        return page.getFlag('actor-journal-helper', 'userId') === game.userId
      })
      if (pageArray.length < 1) {
        pageArray = await actorJournalPageArray.filter(page => {
          return page.getFlag('actor-journal-helper', 'userId') === undefined
        })
      }
    }

    if (actorJournalPageArray.length < 1 || (Array.isArray(pageArray) && pageArray.length < 1)) {
      const newPage = await actorJournalEntry.createEmbeddedDocuments("JournalEntryPage", [
        {
          name: `${app.actor.name}`,
          text: {
            content: `<p>This journal entry is for @UUID[Actor.${app.actor.id}]{${app.actor.name}}.</p><p></p><p></p>`,
          },
          ownership: defaultOwnership
        },
      ]);
      if (sharedJournalPages) {
        newPage[0].setFlag('actor-journal-helper', 'actorId', app.actor.id)
      } else {
        newPage[0].setFlag('actor-journal-helper', 'actorId', app.actor.id)
        newPage[0].setFlag('actor-journal-helper', 'userId', game.userId)
      };
      if (automaticAlphabetization) {
        await socket.executeAsGM("alphabetizeActorJournalPages");
      }
      
      if (editMode) {
        newPage[0].sheet.render(true);
      } else {
        newPage[0].parent.sheet.render(true, {pageId: newPage[0].id});
      }
    } else if (actorJournalPageArray[0].ownership[game.userId] === 3 || actorJournalPageArray[0].ownership.default === 3) {
      if (pageArray) {
        if (editMode) {
          pageArray[0].sheet.render(true);
        } else {
          pageArray[0].parent.sheet.render(true, {pageId: pageArray[0].id});
        }
      } else {
        if (editMode) {
          actorJournalPageArray[0].sheet.render(true);
        } else {
          actorJournalPageArray[0].parent.sheet.render(true, {pageId: actorJournalPageArray[0].id});
        }
      }
    } else if (automaticOwnership) {
      if (!socket) {
        ui.notifications.error("Install and activate socketlib or disable the Automatic ownership updates option in the Actor Journal Helper settings");
      } else {
        if (pageArray) {
          await socket.executeAsGM("updateOwnership", actorJournalEntry._id, pageArray[0]._id, game.userId);
          if (editMode) {
            pageArray[0].sheet.render(true);
          } else {
            pageArray[0].parent.sheet.render(true, {pageId: pageArray[0].id});
          }
        } else {
          await socket.executeAsGM("updateOwnership", actorJournalEntry._id, actorJournalPageArray[0]._id, game.userId);
          if (editMode) {
            actorJournalPageArray[0].sheet.render(true);
          } else {
            actorJournalPageArray[0].parent.sheet.render(true, {pageId: actorJournalPageArray[0].id});
          }
        }
      }
    } else {
      ui.notifications.warn(`Ask your GM for ownership of the journal page associated with this actor.`);
    }
    if (closeCharacterSheetOnJournalEditing) {
      app.close();
    }
  };

let editorInstance;

Hooks.on('renderJournalTextPageSheet', (editor) => {
  editor.getData().then((data) => {
    if (data.editable) {
      editorInstance = editor;
    }
  });
});

Hooks.on('getProseMirrorMenuItems', (menu, config) => {
  const saveMenuItem = config.find(item => item.action === 'save');
  if (menu.view.dom.className === "editor-content journal-page-content ProseMirror") {
    saveMenuItem.cmd = () => {
      if (closeJournalPageEditorOnSave) {
        editorInstance.close();
      }
    };
  }
});
