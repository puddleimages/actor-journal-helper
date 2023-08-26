Hooks.once('setup', () => {
  game.settings.register("actor-journal-helper", "closeCharacterSheetOnJournalEditing", {
    name: "Close Character Sheet on Journal Editing",
    hint: "When enabled, the character sheet will close when opening the journal editor from the button.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });
  
  game.settings.register("actor-journal-helper", "closeJournalPageEditorOnSave", {
    name: "Close Journal Page Editor on Save",
    hint: "When enabled, the ProseMirror journal page editor will close when saving changes.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register("actor-journal-helper", "useSocket", {
    name: "Automatic ownership updates for journal pages (Requires socketlib)",
    hint: "When enabled, ownership update will use socketlib. You must have Library - socketlib module activated.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
});

async function ensureActorJournalExists() {
  const actorJournalEntry = game.journal.getName("Actor Journal");

  if (!actorJournalEntry) {
    await JournalEntry.create({
      name: "Actor Journal",
      ownership: {
        default: 3,
      }
    });
  }
}

Hooks.once('ready', async () => {
  ensureActorJournalExists()
});

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("actor-journal-helper");
  socket.register("updateOwnership", updateOwnership);
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
}

Hooks.on('renderActorSheet', (app, html, data) => {
  const header = html.find('.window-header');

  const buttonElement = $(`
    <a class="header-button control journal">
      <i class="fa fa-book-open"></i>
      ${game.i18n.localize('actor-journal-helper.journal-button')}
    </a>
  `);

  header.children().last().before(buttonElement);

  buttonElement.on('click', async (event) => {
    event.preventDefault();

    const closeOnJournalOpen = game.settings.get("actor-journal-helper", "closeCharacterSheetOnJournalEditing");
    const useSocket = game.settings.get("actor-journal-helper", "useSocket");

    await ensureActorJournalExists()
    const actorJournalEntry = game.journal.getName("Actor Journal");

    const actorJournalPage = actorJournalEntry.pages.filter(page => {
      return page.getFlag('actor-journal-helper', 'actorId') === app.actor.id;
    });

    if (actorJournalPage.length < 1) {
      const newPage = await actorJournalEntry.createEmbeddedDocuments("JournalEntryPage", [
        {
          name: `${app.actor.name}`,
          text: {
            content: `<p>This journal entry is for @UUID[Actor.${app.actor.id}]{${app.actor.name}}.</p><p></p><p></p>`,
          },
          ownership: {
            default: 0,
            [game.userId]: 3,
          }
        },
      ]);
      await newPage[0].setFlag('actor-journal-helper', 'actorId', app.actor.id)
      newPage[0].sheet.render(true);
    } else if (actorJournalPage[0].ownership[game.userId] === 3) {
      actorJournalPage[0].sheet.render(true);
    } else if (useSocket) {
      if (!socket) {
        ui.notifications.error("Install and activate socketlib or disable the Automatic ownership updates option in the Actor Journal Helper settings");
      } else {
        await socket.executeAsGM("updateOwnership", actorJournalEntry._id, actorJournalPage[0]._id, game.userId);
      actorJournalPage[0].sheet.render(true);
      }
    } else {
      ui.notifications.warn(`Ask your GM for ownership of the journal page associated with this actor.`);
    }
    if (closeOnJournalOpen) {
      app.close();
    }
  });
});

let editorInstance;

Hooks.on('renderJournalTextPageSheet', (editor) => {
  editorInstance = editor;
});

Hooks.on('getProseMirrorMenuItems', (menu, config) => {
  const saveMenuItem = config.find(item => item.action === 'save');
  if (saveMenuItem) {
    saveMenuItem.cmd = () => {
      if (editorInstance) {
        editorInstance.close();
      }
    };
  }
});
