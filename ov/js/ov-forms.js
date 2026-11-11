/* Open Vendetta: the checks shared by the forms of index.html (proposer un match) and ajouter.html.
   A field to check carries data-check; its message for an empty field is data-err, for a wrong value data-err-format.
   Number fields carry data-min and data-max. A group of radios is a fieldset[data-check]. Errors show under their
   field (.field__error), the field gets aria-invalid, and the first one takes the focus. Nothing is ever sent. */
(function () {
  const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;
  const PHONE = /^[0-9 .\-]{6,15}$/;

  function errorEl(el) {
    const box = el.closest('.field, fieldset');
    return box ? box.querySelector('.field__error') : null;
  }
  function inputsOf(el) {
    return el.matches('fieldset') ? [...el.querySelectorAll('input')] : [el];
  }
  function setError(el, msg) {
    const e = errorEl(el);
    inputsOf(el).forEach((i) => { if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
    if (e) { e.textContent = msg || ''; e.hidden = !msg; }
  }
  function check(el) {
    if (el.closest('[hidden]')) { setError(el, ''); return true; }
    const required = el.hasAttribute('required') || el.dataset.required === 'true';
    let msg = '';
    if (el.matches('fieldset')) {
      if (required && !el.querySelector('input:checked')) msg = el.dataset.err;
    } else if (el.type === 'checkbox') {
      if (required && !el.checked) msg = el.dataset.err;
    } else if (el.type === 'file') {
      if (required && !(el.files && el.files.length)) msg = el.dataset.err;
    } else {
      const v = el.value.trim();
      if (!v) { if (required) msg = el.dataset.err; }
      else if (el.type === 'email' && !EMAIL.test(v)) msg = el.dataset.errFormat;
      else if (el.dataset.kind === 'handle' && !HANDLE.test(v)) msg = el.dataset.errFormat;
      else if (el.type === 'tel' && !PHONE.test(v)) msg = el.dataset.errFormat;
      else if (el.dataset.min || el.dataset.max) {
        const n = Number(v.replace(',', '.'));
        if (!Number.isFinite(n) || (el.dataset.min && n < Number(el.dataset.min)) || (el.dataset.max && n > Number(el.dataset.max))) msg = el.dataset.errFormat;
      }
    }
    setError(el, msg);
    return !msg;
  }
  // checks every field in scope; returns the fields that failed, the first one focused
  function validate(scope) {
    const bad = [...scope.querySelectorAll('[data-check]')].filter((el) => !check(el));
    if (bad.length) {
      const first = inputsOf(bad[0])[0];
      if (first) first.focus();
    }
    return bad;
  }
  // a field fixed after a failed send loses its message as soon as it is right (never while the first try is typed).
  // It is re-checked as it is typed, not when it loses the focus: a message removed on blur moves the page under a
  // pointer that is already on its way to the next control, and the click lands beside it.
  function watch(scope) {
    const recheck = (ev) => {
      const el = ev.target.closest('[data-check]') || ev.target.closest('fieldset[data-check]');
      if (el && (el.getAttribute('aria-invalid') === 'true' || el.querySelector?.('[aria-invalid="true"]'))) check(el);
    };
    scope.addEventListener('input', recheck);
    scope.addEventListener('change', (ev) => { if (ev.target.matches('input[type="radio"], input[type="checkbox"], input[type="file"], select')) recheck(ev); });
  }
  window.OVForms = { validate, check, setError, watch };
})();
