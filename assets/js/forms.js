/**
 * =============================================================
 *  forms.js — request forms / newsletter engine
 * =============================================================
 *  • Client-side validation (required, e-mail, phone, number,
 *    select, file size) with per-language messages
 *  • Input sanitisation (strips markup before submission)
 *  • Spam protection: honeypot field (botcheck) — a bot that
 *    fills it receives a fake success and nothing is sent
 *  • Secure delivery through the configured provider:
 *      – Web3Forms  (public access key, destination e-mail set
 *        in their dashboard → ramingol1@gmail.com)
 *      – Formspree   (form endpoint URL)
 *    NO secrets are stored here — only public keys from config.js
 *  • On success: localized confirmation + full-field e-mail
 *    notification to the destination address
 *  • If the provider is not configured yet, the visitor gets a
 *    clear message and a pre-filled mailto: fallback
 * =============================================================
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var F = CFG.forms || {};
  var DEST = F.destinationEmail || 'ramingol1@gmail.com';
  var MIN_FILL_MS = 1200;   // submissions faster than this look robotic

  var MESSAGES = {
    fa: {
      required: 'این فیلد الزامی است.',
      email: 'لطفاً یک ایمیل معتبر وارد کنید.',
      phone: 'شماره تماس معتبر وارد کنید (حداقل ۸ رقم).',
      number: 'لطفاً یک عدد معتبر وارد کنید.',
      select: 'لطفاً یک گزینه را انتخاب کنید.',
      file: 'حجم مجموع فایل‌ها نباید بیش از ۵ مگابایت باشد.',
      sending: 'در حال ارسال…',
      success: 'درخواست شما با موفقیت ثبت شد. کارشناس ما حداکثر ظرف ۲۴ ساعت کاری با شما تماس می‌گیرد.',
      error: 'ارسال ناموفق بود؛ لطفاً دوباره تلاش کنید یا از ایمیل استفاده کنید.',
      network: 'خطای شبکه؛ لطفاً اتصال اینترنت خود را بررسی کنید.',
      notConfigured: 'سیستم ارسال فرم در حال راه‌اندازی است. لطفاً درخواست خود را از طریق ایمیل ارسال کنید:',
      sendByEmail: 'ارسال درخواست با ایمیل',
      honeypot: 'ثبت شد.'
    },
    en: {
      required: 'This field is required.',
      email: 'Please enter a valid e-mail address.',
      phone: 'Please enter a valid phone number (at least 8 digits).',
      number: 'Please enter a valid number.',
      select: 'Please choose an option.',
      file: 'Total attachment size must not exceed 5 MB.',
      sending: 'Sending…',
      success: 'Your request has been submitted successfully. Our specialist will contact you within 24 working hours.',
      error: 'Submission failed. Please try again or use e-mail.',
      network: 'Network error — please check your connection.',
      notConfigured: 'The form service is being set up. Please send your request by e-mail:',
      sendByEmail: 'Send request by e-mail',
      honeypot: 'Submitted.'
    }
  };

  function msg(key) {
    var lang = (window.I18N && window.I18N.getLang && window.I18N.getLang()) ||
      (CFG.defaultLang || 'fa');
    return (MESSAGES[lang] || MESSAGES.fa)[key];
  }

  /* ---------- validation helpers ---------------------------------- */

  var RE = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    phone: /^[+\d][\d\s\-().]{6,}$/,
    number: /^-?\d+(\.\d+)?$/
  };

  /** Strip HTML tags / angle brackets so nothing can inject markup
   *  into the notification e-mail. */
  function sanitize(value) {
    return String(value)
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .trim();
  }

  function digitsOf(value) { return String(value).replace(/\D/g, ''); }

  function showError(field, message) {
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    var wrap = field.closest('.field') || field.parentElement;
    var box = wrap && wrap.querySelector('.field-error');
    if (box) {
      box.textContent = message;
      box.hidden = false;
    }
  }

  function clearError(field) {
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    var wrap = field.closest('.field') || field.parentElement;
    var box = wrap && wrap.querySelector('.field-error');
    if (box) { box.textContent = ''; box.hidden = true; }
  }

  function validateField(field) {
    clearError(field);
    var value = (field.value || '').trim();
    var type = field.getAttribute('data-validate') || field.type || 'text';

    if (field.hasAttribute('required') && field.type !== 'checkbox' && !value) {
      showError(field, msg('required'));
      return false;
    }
    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      showError(field, msg('required'));
      return false;
    }
    if (value) {
      if (type === 'email' && !RE.email.test(value)) {
        showError(field, msg('email'));
        return false;
      }
      if (type === 'phone' && (digitsOf(value).length < 8 || !RE.phone.test(value))) {
        showError(field, msg('phone'));
        return false;
      }
      if (type === 'number' && !RE.number.test(value)) {
        showError(field, msg('number'));
        return false;
      }
      if (type === 'select' && field.tagName === 'SELECT' && !value) {
        showError(field, msg('select'));
        return false;
      }
    }
    return true;
  }

  function validateForm(form) {
    var fields = form.querySelectorAll('input, select, textarea');
    var ok = true;
    var firstBad = null;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.name === 'botcheck' || f.type === 'hidden' || f.type === 'file') continue;
      if (!validateField(f)) {
        ok = false;
        if (!firstBad) firstBad = f;
      }
    }
    // File size check (5 MB total)
    var files = form.querySelectorAll('input[type="file"]');
    for (var j = 0; j < files.length; j++) {
      if (files[j].files && files[j].files.length) {
        var total = 0;
        for (var k = 0; k < files[j].files.length; k++) total += files[j].files[k].size;
        if (total > 5 * 1024 * 1024) {
          showError(files[j], msg('file'));
          ok = false;
          if (!firstBad) firstBad = files[j];
        }
      }
    }
    if (firstBad) firstBad.focus();
    return ok;
  }

  /* ---------- payload --------------------------------------------- */

  function collect(form) {
    var data = {};
    var els = form.querySelectorAll('input[name], select[name], textarea[name]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'file' || el.name === 'botcheck') continue;
      if (el.type === 'checkbox') {
        if (el.checked) {
          data[el.name] = (data[el.name] ? data[el.name] + ', ' : '') + (el.value || 'yes');
        }
        continue;
      }
      var v = sanitize(el.value);
      if (v) data[el.name] = v;
    }
    data._page = window.location.pathname;
    data._lang = (window.I18N && window.I18N.getLang && window.I18N.getLang()) || 'fa';
    data._submitted = new Date().toISOString();
    return data;
  }

  function mailtoHref(form, data) {
    var subject = form.getAttribute('data-subject') || 'Website request';
    var lines = [];
    Object.keys(data).forEach(function (k) { lines.push(k + ': ' + data[k]); });
    return 'mailto:' + DEST +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  /* ---------- submission ------------------------------------------ */

  function isConfigured() {
    if (F.provider === 'formspree') return !!F.formspreeEndpoint;
    return !!F.web3formsAccessKey;   // default: web3forms
  }

  function submit(form, data) {
    var hasFiles = false;
    var fileInputs = form.querySelectorAll('input[type="file"]');
    var fd = new FormData();

    if (F.provider === 'formspree' && F.formspreeEndpoint) {
      Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
      for (var i = 0; i < fileInputs.length; i++) {
        for (var j = 0; j < fileInputs[i].files.length; j++) {
          fd.append(fileInputs[i].name, fileInputs[i].files[j]);
          hasFiles = true;
        }
      }
      return fetch(F.formspreeEndpoint, {
        method: 'POST',
        body: hasFiles ? fd : JSON.stringify(data),
        headers: hasFiles ? { 'Accept': 'application/json' } :
          { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      }).then(handleResponse);
    }

    // Web3Forms (default) — JSON, or multipart when files are attached
    var payload = Object.assign({ access_key: F.web3formsAccessKey }, data);
    payload.subject = form.getAttribute('data-subject') || 'Website request';
    payload.from_name = data.contact_person || data.name || data.company || 'Website';
    if (data.email) payload.email = data.email;   // reply-to

    var hasAttachment = false;
    for (var f = 0; f < fileInputs.length; f++) {
      for (var g = 0; g < fileInputs[f].files.length; g++) {
        fd.append(fileInputs[f].name, fileInputs[f].files[g]);
        hasAttachment = true;
      }
    }
    if (hasAttachment) {
      Object.keys(payload).forEach(function (k) { fd.append(k, payload[k]); });
      return fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      }).then(handleResponse);
    }
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handleResponse);
  }

  function handleResponse(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json().catch(function () { return {}; });
  }

  /* ---------- status UI ------------------------------------------- */

  function setStatus(form, text, kind) {
    var box = form.querySelector('.form-status');
    if (!box) return;
    box.textContent = text || '';
    box.className = 'form-status' + (kind ? ' is-' + kind : '');
    if (text) box.focus && box.focus();
  }

  function setBusy(form, busy) {
    var btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    btn.disabled = busy;
    form.classList.toggle('is-busy', busy);
    if (busy) {
      btn.dataset.label = btn.textContent;
      btn.textContent = msg('sending');
    } else if (btn.dataset.label) {
      btn.textContent = btn.dataset.label;
    }
  }

  /* ---------- delegated submit handler ----------------------------- */

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('[data-form]')) return;
    e.preventDefault();

    var now = Date.now();
    if (!form._mountedAt) form._mountedAt = now;

    // Honeypot: pretend success, send nothing
    var trap = form.querySelector('[name="botcheck"]');
    if (trap && trap.value) {
      setStatus(form, msg('honeypot'), 'success');
      form.reset();
      return;
    }

    if (!validateForm(form)) return;

    if (!isConfigured()) {
      var data = collect(form);
      var href = mailtoHref(form, data);
      setStatus(form, '', '');
      var box = form.querySelector('.form-status');
      if (box) {
        box.className = 'form-status is-info';
        box.innerHTML = '<span>' + msg('notConfigured') + '</span> ' +
          '<a class="btn btn-outline btn-sm" href="' + href.replace(/"/g, '&quot;') + '">' +
          msg('sendByEmail') + '</a>';
      }
      return;
    }

    var payload = collect(form);
    var successKey = form.getAttribute('data-success-key');
    setBusy(form, true);
    setStatus(form, msg('sending'), 'info');

    submit(form, payload)
      .then(function () {
        setBusy(form, false);
        setStatus(form, successKey ? window.I18N.t(successKey, msg('success')) : msg('success'), 'success');
        form.reset();
        form.classList.add('is-sent');
      })
      .catch(function (err) {
        console.error('[forms] submission failed:', err);
        setBusy(form, false);
        if (!navigator.onLine) {
          setStatus(form, msg('network'), 'error');
        } else {
          setStatus(form, msg('error'), 'error');
        }
      });
  });

  // Live re-validation once a field has errored
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.classList && el.classList.contains('is-invalid')) validateField(el);
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.matches && el.matches('[data-form] select')) validateField(el);
  });
})();
