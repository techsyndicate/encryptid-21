const formatLevels = (levels, levelsCompleted, currentLevel, coins) => {
  levels.forEach((level) => {
    const currROI = Math.round(
      (level.returnRate / 100 + 1) * level.currentValue
    );
    let net = Math.round(currROI - level.currentValue);
    if (net > 0) {
      net = "+" + String(net);
    }
    const roiString = `${currROI} (${net})`;
    level.currROI = roiString;
    const valueChange = Math.round(
      ((level.currentValue - level.initialValue) * 100) / level.initialValue
    );
    level.valueChange = valueChange;
    level.graph =
      "https://quickchart.io/chart?bkg=transparent&c={type:'sparkline',data:{datasets:[{backgroundColor:'rgb(14, 30, 18)',borderColor:'rgb(22,225,110)',data:[100, 100]}]}}";
    if (levelsCompleted.includes(level.position)) {
      level.status = "Completed";
      level.ability = "bought";
      level.disabled = true;
      level.buttonText = "Buy";
    } else if (level.position == currentLevel) {
      level.status = "Current Level";
      level.ability = "bought";
      level.disabled = false;
      level.buttonText = "Play";
    } else {
      level.status = "Available";
      if (coins < level.currentValue) {
        level.ability = "cannot buy [less funds available]";
        level.status = "Cannot Buy";
        level.disabled = true;
        level.buttonText = "Buy";
      } else {
        level.ability = "can buy";
        level.disabled = false;
        level.buttonText = "Buy";
      }
    }
  });
  let allowNegativeBalance = true;
  levels.forEach((level) => {
    if (level.ability === "can buy") {
      allowNegativeBalance = false;
    }
  });
  if (allowNegativeBalance) {
    levels.forEach((level) => {
      if (level.ability === "cannot buy [less funds available]") {
        level.ability = "can buy [will result in negative balance]";
        level.status = "Available (loan)";
        level.disabled = false;
        level.buttonText = "Buy";
      }
    });
  }
  const sortedLevels = [];
  levels.forEach((level) => {
    if (level.status === "Current Level") {
      sortedLevels.push(level);
    }
  });
  levels.forEach((level) => {
    if (level.status === "Available") {
      sortedLevels.push(level);
    }
  });
  levels.forEach((level) => {
    if (level.status === "Cannot Buy" || level.status === "Available (loan)") {
      sortedLevels.push(level);
    }
  });
  levels.forEach((level) => {
    if (level.status === "Completed") {
      sortedLevels.push(level);
    }
  });
  return sortedLevels;
};

const redirects = {
  nikobellic: {
    link: true,
    content:
      "https://drive.google.com/folderview?id=165kcQoHyrhENG5cLjVyC2J5R4wZNRU1t",
  },
  845145127: { link: false, content: "4eSyy2Ky" },
  coordinates: {
    link: false,
    content: "-28.477652765717 98.53185720069",
    source:
      "oops, gave the opposite coordinates by mistake, sorry, correct them pls.",
  },
  ronethsroom: {
    link: true,
    content: "https://serene-newton-26aaca.netlify.app/",
  },
};

module.exports = { formatLevels, redirects };
