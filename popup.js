document.addEventListener("DOMContentLoaded", function () {
  loadDomains();
  document.getElementById("submit").addEventListener("click", addDomain);
});
function loadDomains() {
  chrome.storage.sync.get(["groupedDomains"], function (result) {
    const domainsList = document.getElementById("domainsList");
    domainsList.innerHTML = ""; // Clear existing list

    const groupedDomains = result.groupedDomains || [];

    if (groupedDomains.length > 0) {
      groupedDomains.forEach((d) => {
        const li = document.createElement("div");
        li.style.padding = "6px 12px";
        li.style.display = "flex";
        li.style.fontSize = "14px";
        li.style.justifyContent = "space-between";
        li.style.borderRadius = "6px";
        li.style.border = "1.5px solid #222";
        li.style.color = "white";
        li.style.marginBottom = "6px";
        li.classList.add("hover-white-background");

        const domainTextContainer = document.createElement("div");
        domainTextContainer.style.display = "flex";
        domainTextContainer.style.alignItems = "center";

        const domainText = document.createElement("p");
        domainText.style.margin = "0";
        domainText.textContent = `${d.domain} (${d.title || "No title"})`;
        domainTextContainer.appendChild(domainText);

        const iconContainer = document.createElement("div");
        iconContainer.style.display = "flex";
        iconContainer.style.width = "50px";

        const editBtn = document.createElement("div");
        editBtn.className = "icon-img";
        editBtn.style.marginRight = "4px";
        editBtn.title = "Edit";
        const editIcon = document.createElement("img");
        editIcon.src = "./assets/edit-btn.png";
        editIcon.alt = "";
        editBtn.appendChild(editIcon);

        const deleteBtn = document.createElement("div");
        deleteBtn.className = "icon-img";
        deleteBtn.style.marginRight = "4px";
        const deleteIcon = document.createElement("img");
        deleteBtn.title = "Delete";
        deleteIcon.src = "./assets/delete-btn.png";
        deleteIcon.alt = "";
        deleteBtn.appendChild(deleteIcon);

        editBtn.onclick = function () {
          editDomain(d.domain);
        };

        deleteBtn.onclick = function () {
          removeDomain(d.domain);
        };

        iconContainer.appendChild(editBtn);
        iconContainer.appendChild(deleteBtn);

        li.appendChild(domainTextContainer);
        li.appendChild(iconContainer);

        domainsList.appendChild(li);
      });
    }
  });
}
function isValidDomain(str) {
  let regex = new RegExp(
    /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/
  );
  if (str == null) {
    return "false";
  }
  if (regex.test(str) == true) {
    return "true";
  } else {
    return "false";
  }
}
async function addDomain() {
  const domainInput = document.getElementById("domain");
  const titleInput = document.getElementById("groupTitle");
  const domain = domainInput.value.toLowerCase();
  const title = titleInput.value;
  if (isValidDomain(domainInput.value) == "false") {
    let errorContainer = document.getElementById("error-message-container");
    if (errorContainer) {
      errorContainer.style.opacity = 1;
    }
    return;
  }
  let errorContainer = document.getElementById("error-message-container");
  if (errorContainer) {
    errorContainer.style.opacity = 0;
  }
  if (domain) {
    chrome.storage.sync.get(["groupedDomains"], function (result) {
      const groupedDomains = result.groupedDomains || [];

      if (groupedDomains.length > 0) {
        let index = groupedDomains.findIndex((d) => {
          return d.domain === domain;
        });
        if (index !== -1) {
          groupedDomains[index] = { domain, title };
        } else {
          groupedDomains.push({ domain, title });
        }
      } else {
        groupedDomains.push({ domain, title });
      }
      chrome.storage.sync.set({ groupedDomains: groupedDomains }, function () {
        console.log("Domain added/updated to groupedDomains");
        loadDomains();
        domainInput.value = "";
        titleInput.value = "";
      });
    });
  }
}

function removeDomain(domain) {
  console.log(domain);
  chrome.storage.sync.get(["groupedDomains"], function (result) {
    console.log(result);
    const groupedDomains = result.groupedDomains || [];
    console.log(groupedDomains);
    groupedDomains.splice(
      groupedDomains.findIndex((d) => {
        return d.domain === domain;
      }),
      1
    );
    console.log(groupedDomains);

    chrome.storage.sync.set({ groupedDomains: groupedDomains }, function () {
      console.log("Domain removed from groupedDomains");
      loadDomains();
    });
  });
}

function editDomain(domain) {
  const newDomain = prompt("Enter new domain", domain);
  const newTitle = prompt("Enter group title", "");

  if (newDomain) {
    chrome.storage.sync.get(["groupedDomains"], function (result) {
      const groupedDomains = result.groupedDomains || [];
      let index = groupedDomains.findIndex((d) => {
        return d.domain === domain;
      });
      if (index !== -1) {
        groupedDomains[index] = { domain: newDomain, title: newTitle };
      }
      chrome.storage.sync.set({ groupedDomains: groupedDomains }, function () {
        console.log("Domain updated in groupedDomains");
        loadDomains();
      });
    });
  }
}
