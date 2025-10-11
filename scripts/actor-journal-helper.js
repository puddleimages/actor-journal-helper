Hooks.once('setup', () => {
  game.settings.register("actor-journal-helper", "insertActorImageIntoNewJournalPagesUponCreation", {
    name: 'Insert Actor Image into New Journal Pages upon Creation',
    hint: `When enabled, clicking the edit or view journal buttons to create a journal page will also add the actor's image (or token image) to the new associated journal page, while excluding any image with "mystery-man" its the name.`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: value => {
      insertActorImageIntoNewJournalPagesUponCreation = value;
    }
  });
  
  game.settings.register("actor-journal-helper", "closeActorSheetOnJournalButtonClick", {
    name: 'Close Actor Sheet After Clicking the Edit or View Journal Buttons',
    hint: 'When enabled, the actor sheet will close after clicking the edit or view journal buttons.',
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: value => {
      closeActorSheetOnJournalButtonClick = value;
    }
  });
  
  game.settings.register("actor-journal-helper", "closeJournalPageEditorOnSave", {
    name: "Close Journal Page Editor on Save",
    hint: "When enabled, the journal page editor will close automatically after clicking the button to save changes.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: value => {
      closeJournalPageEditorOnSave = value;
    }
  });

  game.settings.register("actor-journal-helper", "defaultJournalOwnership", {
    name: 'Set Default Ownership of "Actor Journal" Pages to "None"',
    hint: 'When enabled, the default ownership for the pages created with the "Journal" button is set to "None". Deactivate this to set it to "Owner". Automatic and manual ownership updates should be unnecessary with this deactivated as all users should be owners.',
    scope: "world",
    config: true,
    default: "none",
    type: Boolean,
    onChange: value => {
      defaultJournalOwnership = value;
    }
  });

  game.settings.register("actor-journal-helper", "sharedJournalPages", {
    name: 'Allow Journal Page Sharing',
    hint: 'When enabled, the "Journal" button creates a single journal page in the "Actor Journal" for each actor. Deactivate this to if you want the "Journal" button to generate unique pages for each user. Some settings may allow other users to still access these unique pages.',
    scope: "world",
    config: true,
    default: "none",
    type: Boolean,
    onChange: value => {
      sharedJournalPages = value;
    }
  });
  
  game.settings.register("actor-journal-helper", "automaticAlphabetization", {
    name: "Allow Automatic Journal Page Alphabetization with Socketlib",
    hint: 'When enabled, this automatically alphabetized journal pages in the "Actor Journal" by page name whenever a new pages is created using the "Journal" button. You may need to have Library - socketlib module activated depending on ownership configurations.',
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: value => {
      automaticAlphabetization = value;
    }
  });
  
  game.settings.register("actor-journal-helper", "automaticJournalOwnership", {
    name: "Allow Automatic Journal Pages Ownership Updates with Socketlib",
    hint: 'When enabled, socketlib will automatically update ownership of journal pages in the "Actor Journal" when required. You must have Library - socketlib module activated for this to work.',
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: value => {
      automaticJournalOwnership = value;
    }
  });
  
  game.settings.register("actor-journal-helper", "automaticActorOwnership", {
    name: "Allow Automatic Actor Ownership Updates with Socketlib",
    hint: "When enabled, socketlib will automatically update a player's ownership of an actor to limited when they double click on an associated token. You must have Library - socketlib module activated for this to work. Actors created via transformations when this module is enabled will have a flag pointing these ownership request to the source actor instead of the transformed or original actors.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: value => {
      automaticActorOwnership = value;
    }
  });

  game.settings.register("actor-journal-helper", "grantOwnershipToAll", {
    name: "Grant Ownership to All Players Upon Double Click",
    hint: "If enabled, all non-GM users will automatically receive limited ownership when interacting with a token, instead of just the user who clicked it. This won't doing anything unless automatic actor ownership updates are allowed.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: value => {
      grantOwnershipToAll = value;
    }
  });
  
  game.settings.register("actor-journal-helper", "actorJournalName", {
    name: "Customize the name of the Actor Journal",
    hint: 'When changed, Actor Journal will use a custom name instead of "Actor Journal". If changed after the original journal has been created, it will contribute to the newly named one instead.',
    scope: "world",
    config: true,
    default: "Actor Journal",
    type: String,
    onChange: value => {
      actorJournalName = value;
    }
  });

  game.settings.register("actor-journal-helper", "journalButtonDisplay", {
    name: "Journal Button Display",
    hint: "Choose which journal buttons to display on the actor sheet.",
    scope: "world",
    config: true,
    default: 1,
    type: Number,
    choices: {
      1: "Button for Edit Actor Journal",
      2: "Button for View Actor Journal",
      3: "Both Buttons"
    },
    onChange: value => {
      journalButtonDisplay = value;
    }
  });
});

let insertActorImageIntoNewJournalPagesUponCreation;
let closeActorSheetOnJournalButtonClick;
let closeJournalPageEditorOnSave;
let automaticAlphabetization;
let defaultOwnershipSetting;
let sharedJournalPages;
let automaticJournalOwnership;
let automaticActorOwnership;
let grantOwnershipToAll;
let actorJournalName;

async function getSettings() {
  insertActorImageIntoNewJournalPagesUponCreation = game.settings.get("actor-journal-helper", "insertActorImageIntoNewJournalPagesUponCreation");
  closeActorSheetOnJournalButtonClick = game.settings.get("actor-journal-helper", "closeActorSheetOnJournalButtonClick");
  closeJournalPageEditorOnSave = game.settings.get("actor-journal-helper", "closeJournalPageEditorOnSave");
  automaticAlphabetization = game.settings.get("actor-journal-helper", "automaticAlphabetization");
  defaultOwnershipSetting = game.settings.get("actor-journal-helper", "defaultJournalOwnership");
  sharedJournalPages = game.settings.get("actor-journal-helper", "sharedJournalPages");
  automaticJournalOwnership = game.settings.get("actor-journal-helper", "automaticJournalOwnership");
  automaticActorOwnership = game.settings.get("actor-journal-helper", "automaticActorOwnership");
  grantOwnershipToAll = game.settings.get("actor-journal-helper", "grantOwnershipToAll");
  actorJournalName = game.settings.get("actor-journal-helper", "actorJournalName");
  journalButtonDisplay = game.settings.get("actor-journal-helper", "journalButtonDisplay");
};

// I need to update this so when it runs it allows a player to make the journal:

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
  socket.register("updateJournalOwnership", updateJournalOwnership);
  socket.register("handlePlayerDoubleClick", handlePlayerDoubleClick);
  socket.register("alphabetizeActorJournalPages", alphabetizeActorJournalPages);
  socket.register("openActorSheet", (actorId) => {
    const actor = game.actors.get(actorId);
    if (actor) actor.sheet.render(true);
  });
});

// testing
Hooks.on("dnd5e.transformActorV2", (host, source, data, settings, options) => {
  data.flags.dnd5e.dataSourceActorId = source.id;
});

Hooks.once("ready", () => {
  game.socket.on("module.actor-journal-helper", data => {
    if (data.action === "openActorSheet" && game.user.id === data.userId) {
      const actor = game.actors.get(data.actorId);
      if (actor) actor.sheet.render(true);
    }
  });
});

Hooks.once("ready", () => {
  const origCallback = foundry.canvas.interaction.MouseInteractionManager.prototype.callback;

  foundry.canvas.interaction.MouseInteractionManager.prototype.callback = function(action, event, ...args) {
    if (action !== "clickLeft2") return origCallback.call(this, action, event, ...args);

    const clickPos = event.data.getLocalPosition(canvas.tokens);

    console.log(`You (user ${game.user.name}), double clicked at scene coordinates: (${clickPos.x.toFixed(0)}, ${clickPos.y.toFixed(0)})`);

    if (!game.user.isGM && typeof socket !== "undefined") {
      socket.executeAsGM("handlePlayerDoubleClick", game.user.id, { x: clickPos.x, y: clickPos.y });
    }

    return origCallback.call(this, action, event, ...args);
  };
});

if (typeof socket !== "undefined") {
  socket.on("module.actor-journal-helper", data => {
    if (data.action === "openActorSheet" && game.user.id === data.userId) {
      const actor = game.actors.get(data.actorId);
      if (actor) actor.sheet.render(true);
    }
  });
}

async function handlePlayerDoubleClick(playerId, clickPos) {
  if (!automaticActorOwnership) return;
  if (!game.user.isGM) return;

  const player = game.users.get(playerId);

  console.log(`Player ${player.name} double-clicked at (${clickPos.x.toFixed(0)}, ${clickPos.y.toFixed(0)})`);

  const tokensClicked = canvas.tokens.placeables.filter(t => t.bounds.contains(clickPos.x, clickPos.y));

  if (tokensClicked.length > 0) {
    const names = tokensClicked.map(t => t.name).join(", ");
    console.log(`Player ${player.name} actually clicked within token(s): ${names}`);

    for (const token of tokensClicked) {
      const transformedActor = token.actor.flags.dnd5e?.dataSourceActorId;
      const linkedActor = token.actor.prototypeToken.actorLink;
      let actorId;
      let isTrans;

      if (transformedActor) {
        actorId = transformedActor;
        isTrans = true;
      } else if (!linkedActor) {
        actorId = token.actor.parent.actorId;
      } else {
        actorId = token.actor.id;
      }

      const actor = game.actors.get(actorId);
      const limitedLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS?.LIMITED ?? 1;

      try {
        const newOwnership = foundry.utils.duplicate(actor.ownership || {});

        if (grantOwnershipToAll) {
          if (newOwnership.default >= limitedLevel) {
            console.log(`Default ownership for "${actor.name}" already sufficient.`);
            if (isTrans) openActorSheetForUser(actor.id, player.id);
            continue;
          }

          newOwnership.default = limitedLevel;
          await actor.update({ ownership: newOwnership });
          console.log(`Set default ownership of "${actor.name}" to LIMITED for all players.`);

        } else {
          if (actor.getUserLevel(player) >= limitedLevel) {
            console.log(`${player.name} already has sufficient ownership of ${actor.name}.`);
            if (isTrans) openActorSheetForUser(actor.id, player.id);
            continue;
          }

          newOwnership[player.id] = limitedLevel;
          await actor.update({ ownership: newOwnership });
          openActorSheetForUser(actor.id, player.id);
          console.log(`Granted LIMITED ownership of "${actor.name}" to ${player.name}.`);
          ui.notifications.info(`${player.name} now has LIMITED ownership of ${actor.name}.`);
        }
      } catch (err) {
        console.error("Failed to update actor ownership for", actor, err);
        ui.notifications.error(`Failed to grant ownership for ${actor.name}: see Console`);
      }
    }
  } else {
    console.log(`No tokens found at that click position.`);
  }
}

function openActorSheetForUser(actorId, userId) {
  game.socket.emit("module.actor-journal-helper", {
    action: "openActorSheet",
    actorId,
    userId
  });
}
// testing

async function updateJournalOwnership(journalEntryId, journalPageId, requesterUserId) {
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

// Application
Hooks.on('renderActorSheet', (app, html) => {
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

// ApplicationV2
Hooks.on("renderActorSheetV2", (app, html) => {
  const header = html.querySelector(".window-header");
  if (!header) return;
  if (header.querySelector(".jeb") || header.querySelector(".jvb")) return;
  const jebTooltipText = game.i18n.localize('actor-journal-helper.journal-editor-tooltip');
  const jvbTooltipText = game.i18n.localize('actor-journal-helper.journal-viewer-tooltip');

  const jeb = document.createElement("button");
  jeb.classList.add("jeb");
  jeb.innerHTML = `<i class="fa fa-pencil-alt"></i>`;
  jeb.title = jebTooltipText;
  jeb.addEventListener("click", async (e) => {
    e.preventDefault();
    await openJournalPage(app, true);
  });

  const jvb = document.createElement("button");
  jvb.classList.add("jvb");
  jvb.innerHTML = `<i class="fa fa-book-open"></i>`;
  jvb.title = jvbTooltipText;
  jvb.addEventListener("click", async (e) => {
    e.preventDefault();
    await openJournalPage(app, false);
  });

  const controls = header.querySelectorAll(".header-control");
  const controlsArray = Array.from(controls);
  const targetIndex = controlsArray.length - 2;
  const targetButton = controlsArray[targetIndex];

  if (journalButtonDisplay === 1 || journalButtonDisplay === 3) {
    if (targetButton) {
      header.insertBefore(jeb, targetButton);
    } else {
      header.appendChild(jeb);
    }
  }

  if (journalButtonDisplay === 2 || journalButtonDisplay === 3) {
    if (targetButton) {
      header.insertBefore(jvb, targetButton);
    } else {
      header.appendChild(jvb);
    }
  }
});

async function openJournalPage(app, editMode) {
  let defaultJournalOwnership;
  if (defaultOwnershipSetting === true) {
    defaultJournalOwnership = {
      default: 0,
      [game.userId]: 3,
    };
  } else {
    defaultJournalOwnership = {
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
    let actorImage;
    if (app.actor.img && !app.actor.img.includes("mystery-man.svg") ) {
      actorImage = app.actor.img
    } else if (app.actor.prototypeToken?.texture.src && !app.actor.prototypeToken?.texture.src.includes("mystery-man") ) {
      actorImage = app.actor.prototypeToken?.texture.src
    } else {
      actorImage = ""
    }

    const insertImage = insertActorImageIntoNewJournalPagesUponCreation && actorImage;

    const newPage = await actorJournalEntry.createEmbeddedDocuments("JournalEntryPage", [
      {
        name: `${app.actor.name}`,
        text: {
          content: `<p>This journal entry is for @UUID[Actor.${app.actor.id}]{${app.actor.name}}.</p>
          <p></p>
          ${insertImage ? `<p><img src="${actorImage}" style="max-width:100%; height:auto;" /></p>` : `<p></p>`}`,
        },
        ownership: defaultJournalOwnership
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
  } else if (automaticJournalOwnership) {
    if (!socket) {
      ui.notifications.error("Install and activate socketlib or disable the Automatic ownership updates option in the Actor Journal Helper settings");
    } else {
      if (pageArray) {
        await socket.executeAsGM("updateJournalOwnership", actorJournalEntry._id, pageArray[0]._id, game.userId);
        if (editMode) {
          pageArray[0].sheet.render(true);
        } else {
          pageArray[0].parent.sheet.render(true, {pageId: pageArray[0].id});
        }
      } else {
        await socket.executeAsGM("updateJournalOwnership", actorJournalEntry._id, actorJournalPageArray[0]._id, game.userId);
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
  if (closeActorSheetOnJournalButtonClick) {
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
