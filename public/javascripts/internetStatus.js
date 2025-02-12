
// Function to check and update the internet status
function updateInternetStatus() {
    const statusElement = document.getElementById("internet-status");
    const body = document.body;
    
    if (navigator.onLine) {
      // When online, hide the offline message
      statusElement.style.display = "none";
      body.style.overflow = "auto"; // Allow scrolling when online
    } else {
      // When offline, show the message and prevent further actions
      statusElement.style.display = "block";
      body.style.overflow = "hidden"; // Disable scrolling when offline
      statusElement.innerHTML = `
        <div style="color: red; font-weight: bold; text-align: center;">
          <h2>No internet</h2>
          <p>Try:</p>
          <ul>
            <li>Checking the network cables, modem, and router</li>
            <li>Reconnecting to Wi-Fi</li>
            <li>Running Windows Network Diagnostics</li>
          </ul>
          <p><strong>ERR_INTERNET_DISCONNECTED</strong></p>
        </div>
      `;
  
      // Optionally, crash the page by blocking further interactions (e.g., clicks, form submissions)
      window.location.href = "#"; // This prevents any further navigation until reconnected
    }
  }
  
  // Check if the user is online and update status
  updateInternetStatus();
  
  // Listen for online and offline events to update status dynamically
  window.addEventListener("online", updateInternetStatus);  // When user comes online
  window.addEventListener("offline", updateInternetStatus); // When user goes offline
  