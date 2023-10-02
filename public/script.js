document.getElementById("currentUrl").innerHTML = window.location.href;

// Get total document in database
async function fetchTotalDocumentCount() {
  try {
    const response = await fetch("/DocumentCount");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const totalDocumentCount = data.totalDocuments;
    const selectElement = document.getElementById("urls");
    // creating select elements containing values from 1 until total of documents
    for (let i = 1; i <= totalDocumentCount; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      selectElement.appendChild(option);
    }
  } catch (err) {
    console.error(err);
  }
}
fetchTotalDocumentCount();

// Getting the value of selected shorturl and pass it to the form submit action
const form = document.getElementById("redirectForm");
form.addEventListener("submit", function (event) {
  // Prevent the default form submission
  event.preventDefault(); 

  // Get the selected option value
  const shorturl = document.getElementById("urls").value;

  // Set the form action to the selected URL
  form.action = `/api/shorturl/${shorturl}`;

  // Submit the form
  form.submit();
});

const urlPreview = document.getElementById("urlPreview");
const selectElement = document.getElementById("urls");

// Showing original url preview when hovering submit button
selectElement.addEventListener("change", async (event) => {
  event.preventDefault();
  const short_url = selectElement.value;
  const response = await fetch(`/api/originalurl/${short_url}`);
  const data = await response.json();
  urlPreview.innerHTML = `Redirecting you to : ${data.original_url}`;
});
