// a = currentPpl; b = totalPpl; c = currentValue; d = initialValue; e = currentReturnRate

const joinManipulator = (a, b, c, d, e) => {
  const multiplier = 1 + a / b;
  let newReturnRate = Math.round(e * multiplier);
  let newValue = Math.round(c * multiplier);

  if (newReturnRate > 15) {
    newReturnRate = 15;
  }

  if (newValue > 1.5 * d) {
    newValue = 1.5 * d;
  }

  return { newReturnRate, newValue };
};

const leaveManipulator = (a, b, c, d, e) => {
  if (a === 1) {
    return { newReturnRate: e, newValue: c };
  } else {
    const multiplier = 1 - 1 / a;
    let newReturnRate = Math.round(e * multiplier);
    let newValue = Math.round(c * multiplier);

    if (newReturnRate < 7.5) {
      newReturnRate = 7.5;
    }

    if (newValue < 0.75 * d) {
      newValue = 0.75 * d;
    }

    return { newReturnRate, newValue };
  }
};

module.exports = { joinManipulator, leaveManipulator };
