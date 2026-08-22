// Optional demo enhancement: simulate a transaction once "Complete Purchase"
// is clicked, so judges see the full loop end-to-end. Not required by the
// extension itself — the extension's job stops at filling the field.

document.getElementById("complete-purchase").addEventListener("click", () => {
  const cardInput = document.getElementById("card-number");
  const cardValue = cardInput.value.trim();
  const resultEl = document.getElementById("transaction-result");

  if (!cardValue) {
    resultEl.hidden = false;
    resultEl.textContent = "Enter a payment token before completing purchase.";
    return;
  }

  // A token is either a mock perim_ value or a real token the extension
  // filled (which stamps the field with data-perimeter-filled).
  const filledByPerimeter = cardInput.dataset.perimeterFilled === "1";
  const looksLikeToken = cardValue.startsWith("perim_") || filledByPerimeter;
  const tokenTail = cardValue.slice(-6);

  resultEl.hidden = false;
  resultEl.textContent = [
    "Transaction simulated.",
    looksLikeToken ? `Token: ...${tokenTail}` : "Warning: raw value used, not a Perimeter token.",
    "Merchant: Perimeter Demo Store",
    "Amount: $49.99",
    "Status: APPROVED"
  ].join("\n");
});
