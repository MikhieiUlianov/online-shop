const deleteProduct = (btn: HTMLButtonElement) => {
  if (!btn) return;

  const parent = btn.parentNode as HTMLElement | null;
  if (!parent) return;

  const prodInput = parent.querySelector<HTMLInputElement>("[name=productId]");
  const csrfInput = parent.querySelector<HTMLInputElement>("[name=_csrf]");
  const productElement = btn.closest("article");

  if (!prodInput || !csrfInput || !productElement) return;

  const prodId = prodInput.value;
  const csrf = csrfInput.value;

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((res) => {
      console.log(res);
      productElement.parentNode?.removeChild(productElement);
    })
    .catch((err) => console.log(err));
};
