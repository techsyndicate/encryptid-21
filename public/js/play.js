const notyf = new Notyf({
  duration: 1500,
  position: { x: "left", y: "bottom" },
});

document.getElementById("main").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("answer").disabled = true;
  document.getElementById("submit-button").disabled = true;
  const answer = document.getElementById("answer").value;
  if (answer.trim().length === 0) {
    notyf.error("Enter an answer");
    document.getElementById("answer").disabled = false;
    document.getElementById("submit-button").disabled = false;
  } else {
    fetch("/play/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (data.success === "banned") {
          window.location.reload();
        } else if (data.success) {
          if (data.success === "lol") {
            notyf.error("Please log in to submit the answer.");
          } else {
            notyf.success("Correct answer, good work there!");
          }
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          notyf.error("That's not quite it. Please try again.");
          document.getElementById("answer").disabled = false;
          document.getElementById("submit-button").disabled = false;
          document.getElementById("answer").value = "";
        }
      })
      .catch((err) => {
        console.log(err);
        notyf.error(err);
      });
  }
});

const fetchAndUpdate = () => {
  fetch("/play/info").then(async (resp) => {
    const response = await resp.json();
    document.getElementById("roi-value").innerText =
      " " + "$" + response.roiValue;
    document.getElementById("roi-rate").innerText =
      " " + response.roiRate + "%";
    document.getElementById("curr-players").innerText =
      " " + response.currPlayers;
    document.getElementById("curr-value").innerText =
      " " + "$" + response.currValue;
    return "done";
  });
};

window.addEventListener("load", async () => {
  await fetchAndUpdate();
  const loader = document.getElementById("loader");
  loader.style.opacity = "0";
  loader.style.visibility = "hidden";
  const footer = document.getElementById("footer");
  footer.style.position = "fixed";
});

window.addEventListener("click", async (e) => {
  if (e.target.id === "refresh") {
    await fetchAndUpdate();
    notyf.success("Stats updated.");
  }
});
