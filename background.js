function getDomain(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  const parts = hostname.split(".").reverse();

  if (parts.length >= 2) {
    const domainParts = parts.slice(0, 2).reverse();
    return domainParts.join(".");
  }

  return hostname;
}

function updateGroupTitle(groupId, title) {
  if (chrome.tabGroups) {
    chrome.tabGroups.update(groupId, { title: title }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error setting title for group ${groupId}: ${chrome.runtime.lastError.message}`
        );
      } else {
        console.log(`Set title for group ${groupId} to ${title}`);
      }
    });
  }
}

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.status === "complete" && tab.url) {
//     const domain = getDomain(tab.url).toLowerCase();

//     chrome.storage.sync.get(["groupedDomains"], function (result) {
//       const groupedDomains = result.groupedDomains || {};
//       const index = groupedDomains.findIndex((d) => d.domain === domain);

//       if (index !== -1) {
//         const domainObj = groupedDomains[index];
//         chrome.tabs.query({ currentWindow: true }, function (tabs) {
//           const existingGroup = tabs.find(
//             (t) =>
//               getDomain(t.url).toLowerCase() === domain &&
//               t.groupId > 0 &&
//               tabId !== t.id &&
//               groupedDomains.some((d) => d.domain === getDomain(t.url).toLowerCase())
//           );

//           if (existingGroup) {
//             chrome.tabs.group(
//               { groupId: existingGroup.groupId, tabIds: tabId },
//               () => {
//                 if (chrome.runtime.lastError) {
//                   console.error(
//                     `Error adding tab to existing group: ${chrome.runtime.lastError.message}`
//                   );
//                 } else {
//                   console.log(
//                     `Added tab ${tabId} to existing group ${existingGroup.groupId}`
//                   );

//                   chrome.tabGroups.update(
//                     existingGroup.groupId,
//                     { title: domainObj.title || "Default Title" },
//                     () => {
//                       if (chrome.runtime.lastError) {
//                         console.error(
//                           `Error setting group title: ${chrome.runtime.lastError.message}`
//                         );
//                       } else {
//                         console.log(
//                           `Title set for group ${existingGroup.groupId}`
//                         );
//                       }
//                     }
//                   );
//                 }
//               }
//             );
//           } else {
//             const tabIds = [tabId];
//             chrome.tabs.group({ tabIds: tabIds }, (groupId) => {
//               if (chrome.runtime.lastError) {
//                 console.error(
//                   `Error creating new group: ${chrome.runtime.lastError.message}`
//                 );
//               } else {
//                 console.log(`Grouped tabs in new group ${groupId}`);
//                 chrome.tabGroups.update(
//                   groupId,
//                   { title: domainObj.title || "" },
//                   () => {
//                     if (chrome.runtime.lastError) {
//                       console.error(
//                         `Error setting group title: ${chrome.runtime.lastError.message}`
//                       );
//                     } else {
//                       console.log(`Title set for group ${groupId}`);
//                     }
//                   }
//                 );
//               }
//             });
//           }
//         });
//       }
//     });
//   }
// });
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    const domain = getDomain(tab.url).toLowerCase();

    chrome.storage.sync.get(["groupedDomains"], function (result) {
      const groupedDomains = result.groupedDomains || {};
      const index = groupedDomains.findIndex((d) => d.domain === domain);

      if (index !== -1) {
        const domainObj = groupedDomains[index];
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
          const existingGroup = tabs.find(
            (t) =>
              getDomain(t.url).toLowerCase() === domain &&
              t.groupId > 0 &&
              tabId !== t.id &&
              groupedDomains.some(
                (d) => d.domain === getDomain(t.url).toLowerCase()
              )
          );

          if (existingGroup) {
            chrome.tabs.group(
              { groupId: existingGroup.groupId, tabIds: tabId },
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error adding tab to existing group: ${chrome.runtime.lastError.message}`
                  );
                } else {
                  console.log(
                    `Added tab ${tabId} to existing group ${existingGroup.groupId}`
                  );

                  chrome.tabGroups.update(
                    existingGroup.groupId,
                    { title: domainObj.title || "Default Title" },
                    () => {
                      if (chrome.runtime.lastError) {
                        console.error(
                          `Error setting group title: ${chrome.runtime.lastError.message}`
                        );
                      } else {
                        console.log(
                          `Title set for group ${existingGroup.groupId}`
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            const tabIds = [tabId];
            chrome.tabs.group({ tabIds: tabIds }, (groupId) => {
              if (chrome.runtime.lastError) {
                console.error(
                  `Error creating new group: ${chrome.runtime.lastError.message}`
                );
              } else {
                // console.log(`Grouped tabs in new group ${groupId}`);
                chrome.tabGroups.update(
                  groupId,
                  { title: domainObj.title || "" },
                  () => {
                    if (chrome.runtime.lastError) {
                      console.error(
                        `Error setting group title: ${chrome.runtime.lastError.message}`
                      );
                    } else {
                      console.log(`Title set for group ${groupId}`);
                    }
                  }
                );
              }
            });
          }
        });
      } else {
        // If domain is not in groupedDomains, ungroup the tab
        chrome.tabs.ungroup(tabId, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error ungrouping tab ${tabId}: ${chrome.runtime.lastError.message}`
            );
          } else {
            console.log(`Ungrouped tab ${tabId}`);
            
          }
        });
      }
    });
  }
});
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.url) {
//     const newDomain = getDomain(changeInfo.url).toLowerCase();
//     chrome.storage.sync.get(["groupedDomains"], function (result) {
//       const groupedDomains = result.groupedDomains || [];
//       const domainInList = groupedDomains
//         .map((d) => d.domain.toLowerCase())
//         .includes(newDomain);

//       if (!domainInList) {
//         chrome.tabs.ungroup(tabId, () => {
//           if (chrome.runtime.lastError) {
//             console.error(
//               `Error ungrouping tab ${tabId}: ${chrome.runtime.lastError.message}`
//             );
//           } else {
//             console.log(`Ungrouped tab ${tabId}`);
//           }
//         });
//       }
//     });
//   }
// });
