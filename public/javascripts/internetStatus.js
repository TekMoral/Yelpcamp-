function checkInternetStatus() {
    fetch("/ping", { method: "GET", cache: "no-store" })
        .then(() => {
            console.log("Connected to the internet");
            hideOfflineMessage();
        })
        .catch(() => {
            showOfflineMessage();
        });
}

function showOfflineMessage() {
    let message = document.getElementById("offline-message");
    if (!message) {
        message = document.createElement("div");
        message.id = "offline-message";
        message.textContent = "You are offline! Please check your internet connection.";
        message.style.position = "fixed";
        message.style.top = "10px";
        message.style.left = "50%";
        message.style.transform = "translateX(-50%)";
        message.style.backgroundColor = "red";
        message.style.color = "white";
        message.style.padding = "10px";
        message.style.borderRadius = "5px";
        document.body.appendChild(message);
    }
}

function hideOfflineMessage() {
    const message = document.getElementById("offline-message");
    if (message) {
        message.remove();
    }
}

// Check internet status every 5 seconds
setInterval(checkInternetStatus, 5000);
