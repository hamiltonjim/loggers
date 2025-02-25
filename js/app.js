const INHERITED = "~inherited~";
let LOGGERS_URL;
let urlField = null;
let displayUrl = null;

document.addEventListener("keydown", function filterKey(event) {
  if (event.key === "Enter") {
    const element = event.target;
    if (element.id === "loggers-url") {
      loadLoggers();
    }
  }
});

function loadLoggers() {
  if (urlField === null) {
    urlField = document.getElementById("loggers-url");
  }
  if (displayUrl === null) {
    displayUrl = document.getElementById("display-url");
  }
  const url = urlField.value;
  LOGGERS_URL = url;
  displayUrl.innerText = url;
  fetch(url)
    .then(result => result.text())
    .then(data => {
      try {
        const jsonData = JSON.parse(data);
        fillTable(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.log('Raw data:', data); // Log the raw data for inspection
      }
    });
}

function buildSelect(levels) {
  const sel = document.createElement("select");
  sel.setAttribute("onchange", "updateLogLevel(this)");
  const inheritedOption = document.createElement("option");
  inheritedOption.value = INHERITED;
  inheritedOption.innerText = INHERITED;
  sel.appendChild(inheritedOption);
  for (let ix = 0; ix < levels.length; ++ix) {
    const lev = levels[ix];
    const levOpt = document.createElement("option");
    levOpt.innerText = lev;
    levOpt.value = lev;
    sel.appendChild(levOpt);
  }
  return sel;
}

function buildRootSelect(anySelect) {
  const rootSelect = anySelect.cloneNode(true);

  // find "inherited" node
  for (let ix = 0; ix < rootSelect.children.length; ++ix) {
    const child = rootSelect.children[ix];
    if (child.value === INHERITED) {
      child.setAttribute("disabled", "true");
      break;
    }
  }
  return rootSelect;
}

function clearTable(table) {
  while (table.rows.length > 0) {
    const row = table.rows[0];
    row.remove();
  }
}

function createLoggersHeader(table) {
  let row = document.createElement("tr");
  let hCell = document.createElement("th");
  hCell.setAttribute("colspan", "3");
  hCell.setAttribute("class", "center");
  hCell.innerText = "Individual Loggers";
  row.appendChild(hCell);
  table.appendChild(row);

  row = document.createElement("tr");
  hCell = document.createElement("th");
  hCell.innerText = "Level";
  row.appendChild(hCell);

  hCell = document.createElement("th")
  hCell.setAttribute("colspan", "2");
  hCell.innerText = "Class";
  row.appendChild(hCell);

  table.appendChild(row);
}

function createGroupsHeader(table) {
  let row = document.createElement("tr");
  let hCell = document.createElement("th");
  hCell.setAttribute("colspan", "3");
  hCell.setAttribute("class", "center");
  hCell.innerText = "Logging Groups";
  row.appendChild(hCell);
  table.appendChild(row);

  row = document.createElement("tr");
  hCell = document.createElement("th");
  hCell.innerText = "Level";
  row.appendChild(hCell);

  hCell = document.createElement("th")
  hCell.innerText = "Group";
  row.appendChild(hCell);

  hCell = document.createElement("th");
  hCell.innerText = "Members";
  row.appendChild(hCell);

  table.appendChild(row);
}

function getLogLevel(json) {
  let level = json.effectiveLevel;
  if (level === null || level === undefined) {
    level = json.configuredLevel;
  }

  // still bad?
  if (level === undefined) {
    level = null;
  }

  return level;
}

function getConfiguredLevel(json) {
  return json.configuredLevel;
}

function fillLoggers(loggers, loggerNames, table, anySelect, rootSelect) {
  createLoggersHeader(table);
  for (let index = 0; index < loggerNames.length; ++index) {
    const aKey = loggerNames[index];
    const level = getLogLevel(loggers[aKey]);
    const row = document.createElement("tr");
    row.setAttribute("class", "striped");
    const selCell = document.createElement("td");
    let sel;
    if (aKey === "ROOT") {
      sel = rootSelect;
    } else {
      sel = anySelect.cloneNode(true);
    }
    if (level === null) {
      sel.selectedIndex = -1;
    } else {
      sel.value = level;
    }
    selCell.appendChild(sel);
    row.appendChild(selCell);

    const classCell = document.createElement("td");
    classCell.setAttribute("colspan", "2");
    classCell.innerText = aKey;
    row.appendChild(classCell);
    table.appendChild(row);
  }
}

function fillGroups(groups, groupNames, table, anySelect) {
  createGroupsHeader(table);

  for (let index = 0; index < groupNames.length; ++index) {
    const aGroup = groupNames[index];
    const group = groups[aGroup];
    const row = document.createElement("tr");
    row.setAttribute("class", "striped");

    const selCell = document.createElement("td");
    const sel = anySelect.cloneNode(true);
    const level = getLogLevel(group);
    if (level === null) {
      sel.selectedIndex = -1;
    } else {
      sel.value = level;
    }
    selCell.appendChild(sel);

    row.appendChild(selCell);
    const groupCell = document.createElement("td");
    groupCell.innerText = aGroup;

    row.appendChild(groupCell);
    const memberCell = document.createElement("td");
    memberCell.innerHTML = group.members.join("<br/>");
    row.appendChild(memberCell);

    table.appendChild(row);
  }
}

function fillTable(data) {
  const table = document.getElementById("loggerTable");
  const levels = data.levels;
  const anySelect = buildSelect(levels)
  const rootSelect = buildRootSelect(anySelect);
  clearTable(table);

  // groups
  const groups = data.groups;
  const groupNames = Object.getOwnPropertyNames(groups);
  if (groupNames.length > 0) {
    fillGroups(groups, groupNames, table, anySelect);
  }

  // individual loggers
  const loggers = data.loggers;
  const keys = Object.getOwnPropertyNames(loggers);
  if (keys.length > 0) {
    fillLoggers(loggers, keys, table, anySelect, rootSelect);
  }
}

function updateLogLevel(selector) {
  const newLevel = selector.value;
  let newJson;
  if (newLevel === INHERITED) {
    newJson = "{}";
  } else {
    newJson = '{"configuredLevel":"' + newLevel.toLowerCase() + '"}';
  }

  const row = selector.parentNode.parentNode;
  const loggerClass = row.cells[1].innerText;
  const setUrl = LOGGERS_URL + '/' + loggerClass;
  fetch(setUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: newJson
  })
    .then(result => result.text())
    .then(() => {
      urlField.innerText = LOGGERS_URL;
      loadLoggers();
    });
}
