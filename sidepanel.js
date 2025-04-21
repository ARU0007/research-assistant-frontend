document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["researchNotes"], function (result) {
    if (result.researchNotes) {
      document.getElementById("notes").value = result.researchNotes;
    }
  });

  document
    .getElementById("summarizeBtn")
    .addEventListener("click", summarizeText);
  document.getElementById("saveNotesBtn").addEventListener("click", saveNotes);
});

async function summarizeText() {
  //  alert("Summarizing text...");
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString(),
    });

    if (!result) {
      showResult("No text selected. Please select some text to summarize.");
      return;
    }
    const response = await fetch("http://localhost:8080/api/research/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: result,
        operation: "summarize",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const text = await response.text();
    showResult(text.replace(/\n/g, "<br>"));
  } catch (error) {
    showResult(`Error` + error.message);
  }
}
async function saveNotes() {
  const notes = document.getElementById("notes").value;
  chrome.storage.local.set({ researchNotes: notes }, function () {
    alert("Notes saved successfully!");
  });
}

function showResult(constant) {
  document.getElementById(
    "result"
  ).innerHTML = `<div class="result-item"><div class="result-text">${constant}</div></div>;`;
}
