chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

let pricePerDay = 0;

const checkAirbnbRoomPage = () => {
  if (
    window.location.hostname.includes("airbnb") &&
    window.location.pathname.includes("/rooms/")
  ) {
    const observer = new MutationObserver((mutations, obs) => {
      const checkInElement = document.querySelector(
        '[data-testid="change-dates-checkIn"]'
      );
      const checkOutElement = document.querySelector(
        '[data-testid="change-dates-checkOut"]'
      );

      const priceString =
        document.querySelector("._1qs94rc ._j1kt73")?.textContent;

      const previousPricePerNightFixedElement = document.getElementById(
        "pricePerNightFixedElement"
      );

      if (checkInElement && checkOutElement && priceString) {
        const priceNumber = parseInt(priceString.replace(/[^0-9]/g, ""));

        const localCheckInDateString = checkInElement.innerHTML || "";
        const localCheckOutDateString = checkOutElement.innerHTML || "";
        const checkInDate = parseUnknownLocaleDate(localCheckInDateString);
        const checkOutDate = parseUnknownLocaleDate(localCheckOutDateString);
        const timeDiff = Math.abs(
          checkOutDate.getTime() - checkInDate.getTime()
        );
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const newPPD = Math.round((priceNumber / diffDays) * 100) / 100;
        if (newPPD === pricePerDay) return;

        pricePerDay = newPPD;

        // remove previous element

        if (previousPricePerNightFixedElement) {
          previousPricePerNightFixedElement.remove();
        }

        // also add it as an fixed element at the bottom right of the screen
        const pricePerNightFixedElement = document.createElement("div");
        pricePerNightFixedElement.style.position = "fixed";
        pricePerNightFixedElement.style.bottom = "10px";
        pricePerNightFixedElement.style.right = "10px";
        pricePerNightFixedElement.style.backgroundColor = "white";
        pricePerNightFixedElement.style.padding = "10px";
        pricePerNightFixedElement.style.border = "1px solid black";
        pricePerNightFixedElement.style.borderRadius = "5px";
        pricePerNightFixedElement.style.zIndex = "1000";
        pricePerNightFixedElement.textContent = `Price per night: $${pricePerDay}`;

        // set attr to be able to remove it later
        pricePerNightFixedElement.setAttribute(
          "id",
          "pricePerNightFixedElement"
        );

        document.body.appendChild(pricePerNightFixedElement);
      } else {
        if (previousPricePerNightFixedElement) {
          previousPricePerNightFixedElement.remove();
        }
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  } else {
    const previousPricePerNightFixedElement = document.getElementById(
      "pricePerNightFixedElement"
    );

    if (previousPricePerNightFixedElement) {
      previousPricePerNightFixedElement.remove();
    }
  }
};

// Run the check when the script is loaded
checkAirbnbRoomPage();

// Run the check when the page changes
window.addEventListener("popstate", checkAirbnbRoomPage);

function isLocaleUsingMMDDFormat() {
  const testDate = new Date("2024-12-31");
  const formattedDateString = testDate.toLocaleDateString();
  return formattedDateString.startsWith("12");
}

const localeUsesMMDD = isLocaleUsingMMDDFormat();

function parseUnknownLocaleDate(dateString: string) {
  let parts;
  let year, month, day;

  if (localeUsesMMDD) {
    parts = dateString.split("/");
    month = parseInt(parts[0], 10) - 1; // Months are 0-based
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (dateString.includes("/")) {
    parts = dateString.split("/");
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1; // Months are 0-based
    year = parseInt(parts[2], 10);
  } else {
    // Fallback to ISO format (yyyy-MM-dd)
    parts = dateString.split("-");
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1; // Months are 0-based
    day = parseInt(parts[2], 10);
  }

  return new Date(year, month, day);
}
