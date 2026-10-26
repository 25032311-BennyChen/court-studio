// The contact page uses direct profile and email links, with no message server.
// A copy button is activated only when an actual mailto link is present.
const emailLink = document.querySelector('[data-contact-email]');
const copyEmailButton = document.querySelector('[data-copy-email]');
const copyEmailStatus = document.querySelector('[data-copy-status]');

if (emailLink && copyEmailButton && copyEmailStatus) {
  const address = emailLink.textContent.trim();
  let resetCopyLabel;
  copyEmailButton.hidden = false;
  copyEmailButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address);
      copyEmailStatus.textContent = 'Email address copied.';
      copyEmailButton.textContent = 'Copied ✓';
      clearTimeout(resetCopyLabel);
      resetCopyLabel = setTimeout(() => { copyEmailButton.textContent = 'Copy email'; }, 2500);
    } catch {
      copyEmailStatus.textContent = 'Select and copy the email address above, or click it to open your email app.';
    }
  });
}
