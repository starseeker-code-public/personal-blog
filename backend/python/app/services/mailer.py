"""Outbound email — currently one template: the Bridgerton love-letter
invitation fired when a post tagged `love` is published with the opt-in
check ticked. It's written in English and Spanish; the caller picks one.

SMTP config is optional. When `SMTP_HOST` is empty the email is logged to
stdout instead of dispatched, so the feature works end-to-end in local
development without credentials.
"""

import html
import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid

from app.config import settings

logger = logging.getLogger(__name__)


# Everything the letter says, per language. The post's title and excerpt are
# filled in after `entreaty`; `no_excerpt` stands in when there's no excerpt.
# Coffee, not tea: it's what we drink together.
_COPY: dict[str, dict[str, str]] = {
    "en": {
        "subject": "My Dearest \u2014 A New Letter Awaits",
        "heading": "An Invitation",
        "salutation": "My Dearest,",
        "opening": (
            "It is with a quickened pulse and a heart too full for my chest that I take up my pen this evening. "
            "A new page has been committed to my private chronicle — a reflection I could not bear to see read "
            "by any eyes before yours, for it owes every line to you."
        ),
        "entreaty": "I humbly entreat you to grace the pages of",
        "open_quote": "\u201c",
        "close_quote": "\u201d",
        "after_title": " —",
        "no_excerpt": "a small composition written, as ever, with you half a thought away.",
        "devotion": (
            "I confess that, as I wrote, every word went searching for the shape of your name, and every pause "
            "filled with the echo of your laughter. Should a single line draw a smile from you, know that it was "
            "written for nothing else."
        ),
        "closing": (
            "The garden gate is unlatched, the candles are lit, and two cups of coffee — freshly brewed, "
            "just as you like it — wait steaming upon the table. All that is missing is you."
        ),
        "read": "Read the letter",
        "visit_chronicle": "or visit the full chronicle",
        "visit_blog": "Visit the blog",
        "sign_off": "Yours, eternally,",
        "footer": "Sent from a small corner of the internet, where I am always thinking of you.",
        "text_closing": "Two cups of coffee wait upon the table. All that is missing is you.",
        "text_opening": (
            "A new page has been committed to my chronicle — and I could not bear\n"
            "for it to be read by any eyes before yours."
        ),
    },
    "es": {
        "subject": "Amor mío, te espera una nueva carta",
        "heading": "Una invitación",
        "salutation": "Amor mío,",
        "opening": (
            "Con el pulso acelerado y el corazón tan lleno que apenas me cabe en el pecho, tomo la pluma "
            "esta noche. Una nueva página ha quedado escrita en mi crónica privada: una reflexión que no "
            "soportaría ver leída por otros ojos antes que por los tuyos, pues es a ti a quien debe cada "
            "una de sus líneas."
        ),
        "entreaty": "Te ruego humildemente que honres con tu lectura las páginas de",
        "open_quote": "\u00ab",
        "close_quote": "\u00bb",
        "after_title": ":",
        "no_excerpt": "una pequeña composición escrita, como siempre, sin apartarte de mis pensamientos.",
        "devotion": (
            "Confieso que, mientras la escribía, cada palabra buscaba la forma de tu nombre, y cada pausa "
            "se llenaba con el eco de tu risa. Si alguna línea logra arrancarte una sonrisa, sabrás que "
            "fue escrita solo para eso."
        ),
        "closing": (
            "La verja del jardín está abierta, las velas encendidas, y dos tazas de café —recién hecho, "
            "como a ti te gusta— esperan humeantes sobre la mesa. Solo faltas tú."
        ),
        "read": "Leer la carta",
        "visit_chronicle": "o visita la crónica completa",
        "visit_blog": "Visitar el blog",
        "sign_off": "Eternamente, con todo mi amor,",
        "footer": "Desde un pequeño rincón de internet, donde siempre pienso en ti.",
        "text_closing": "Dos tazas de café esperan sobre la mesa. Solo faltas tú.",
        "text_opening": (
            "Una nueva página ha quedado escrita en mi crónica, y no soportaría\n"
            "que otros ojos la leyeran antes que los tuyos."
        ),
    },
}


# The site's two themes, as the post page wears them: light is the warm
# browns index.css swaps in for the stone colours, dark the `dark:` classes.
# The letter is light, and turns dark when the reader's mail app is dark.
_LIGHT = {
    "card": "#efead8", "rule": "#aa8b56",
    "accent": "#dd0000", "heading": "#395144", "text": "#5a3820", "strong": "#395144",
    "button": "#798777", "button_text": "#ffffff", "link": "#798777",
    "signoff": "#7a5030", "signature": "#395144", "muted": "#7a4828",
}
_DARK = {
    "card": "#0f0d24", "rule": "#322d5a",
    "accent": "#fbbf24", "heading": "#fbbf24", "text": "#f0ecfd", "strong": "#fbbf24",
    "button": "#f59e0b", "button_text": "#1c1917", "link": "#fbbf24",
    "signoff": "#f0ecfd", "signature": "#fbbf24", "muted": "#8b7db8",
}

# The dark-theme colours the `theme-*` classes paint: CSS property -> colour.
# Text isn't here: it's written twice instead (see _both).
# Only the letter itself is coloured; around it the mail app's background shows.
_THEMED = {
    "card": {"border-color": "rule"},
    "sheet": {"background-color": "card"},
    "divider": {"background-color": "rule"},
    "button": {"background-color": "button"},
    "label": {"color": "button_text"},
}


def _dark_theme_css() -> str:
    """The dark theme, for Outlook (web and apps) in dark mode.

    In dark mode Outlook recolours every inline background and every text
    whose colour is dark, pins its pick with an inline !important that no
    rule can beat, and marks what it changed with data-ogsc (text) or
    data-ogsb (background). Light text and borders it leaves alone. So the
    dark backgrounds go on boxes with none of their own, painted by the
    rules behind the markers, and each text is written twice (see _both),
    the markers swapping the light copy for the dark one. In light mode
    nothing is marked, so none of this applies. No prefers-color-scheme:
    webmail answers it with the system's theme, so a dark Windows turned
    the letter dark in a light Outlook.
    """
    rules = [
        (f".theme-{name}", "; ".join(f"{prop}: {_DARK[role]} !important" for prop, role in props.items()))
        for name, props in _THEMED.items()
    ]
    rules += [(".theme-light", "display: none !important"), (".theme-dark", "display: inline !important")]
    return "\n".join(f"    [data-ogsc] {sel}, [data-ogsb] {sel} {{ {decls}; }}" for sel, decls in rules)


def _both(light: str, dark: str, colour: str) -> str:
    """Text in both themes. The light copy takes its colour from the element
    around it. The dark copy carries its dark-theme colour, which is light,
    so Outlook leaves it alone; it stays hidden until Outlook's dark mode
    swaps it in."""
    return (
        f'<span class="theme-light">{light}</span>'
        f'<span class="theme-dark" style="display:none;mso-hide:all;color:{colour};">{dark}</span>'
    )


def _urls(lang: str, slug: str) -> tuple[str, str]:
    """The post and the blog home, on the site in the letter's language."""
    blog_url = f"{settings.site_url.rstrip('/')}/{lang}"
    return f"{blog_url}/posts/{slug}", blog_url


def _build_love_email_html(*, lang: str, title: str, slug: str, excerpt: str) -> str:
    """Render the Bridgerton invitation as inline-styled HTML, in the site's
    light theme, or its dark theme when Outlook is in dark mode."""
    c = {key: html.escape(text) for key, text in _COPY[lang].items()}
    post_url, blog_url = (html.escape(url) for url in _urls(lang, slug))
    title = html.escape(title)
    excerpt = html.escape(excerpt) if excerpt else c["no_excerpt"]
    t = _LIGHT

    def both(role: str, text: str) -> str:
        return _both(text, text, _DARK[role])

    def entreaty(theme: dict[str, str]) -> str:
        quoted = f'{c["open_quote"]}{title}{c["close_quote"]}'
        return (
            f'{c["entreaty"]} <span style="font-style:normal;color:{theme["strong"]};font-weight:600;">'
            f'{quoted}</span>{c["after_title"]} {excerpt}'
        )

    preview_filler = "&#847;&zwnj;&nbsp;" * 90

    return f"""<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>{c["heading"]}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Marck+Script&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Caveat:wght@500;700&family=Capriola&display=swap" rel="stylesheet">
  <style>
    :root {{ color-scheme: light dark; supported-color-schemes: light dark; }}
{_dark_theme_css()}
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Source Serif 4',Georgia,serif;">
  <!-- Inbox preview. The hidden dark copies of the text would show up in it,
       so the filler keeps the rest of the letter out. -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{c["opening"]}{preview_filler}</div>
  <!-- The light colours sit inline; the dark theme comes from the rules
       behind Outlook's markers (see _dark_theme_css). This wrapper's text
       colour gets it marked, so those rules reach the card. No background
       around the letter. -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;color:{t["text"]};">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="theme-card" style="max-width:560px;background-color:{t["card"]};border:1px solid {t["rule"]};border-radius:12px;overflow:hidden;">
          <tr>
            <td class="theme-sheet" style="padding:0;border-radius:11px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- Flourish header -->
                <tr>
                  <td style="padding:32px 40px 8px 40px;text-align:center;">
                    <p style="margin:0;font-family:'Caveat',cursive;color:{t["accent"]};font-size:16px;letter-spacing:4px;text-transform:uppercase;">
                      {both("accent", f'· {c["heading"]} ·')}
                    </p>
                  </td>
                </tr>
                <tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:{t["rule"]};"><div class="theme-divider" style="height:1px;line-height:1px;font-size:0;">&nbsp;</div></td></tr>

                <!-- Salutation -->
                <tr>
                  <td style="padding:32px 40px 8px 40px;text-align:center;">
                    <p style="margin:0;font-family:'Marck Script','Caveat',cursive;color:{t["heading"]};font-size:44px;line-height:1;">
                      {both("heading", c["salutation"])}
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:24px 40px 16px 40px;font-family:'Source Serif 4',Georgia,serif;color:{t["text"]};font-size:16px;line-height:1.75;font-style:italic;text-align:justify;">
                    <p style="margin:0 0 18px 0;">{both("text", c["opening"])}</p>
                    <p style="margin:0 0 18px 0;">{_both(entreaty(_LIGHT), entreaty(_DARK), _DARK["text"])}</p>
                    <p style="margin:0 0 18px 0;">{both("text", c["devotion"])}</p>
                    <p style="margin:0;">{both("text", c["closing"])}</p>
                  </td>
                </tr>

                <!-- Primary CTA -->
                <tr>
                  <td style="padding:28px 40px 8px 40px;text-align:center;">
                    <a href="{post_url}"
                       style="display:inline-block;border-radius:8px;
                              background-color:{t["button"]};color:{t["button_text"]};text-decoration:none;font-family:'Capriola',sans-serif;
                              font-weight:500;letter-spacing:0.025em;font-size:14px;"><span class="theme-button" style="display:block;padding:10px 24px;border-radius:8px;"><span class="theme-label">{c["read"]}</span></span></a>
                  </td>
                </tr>

                <!-- Secondary link -->
                <tr>
                  <td style="padding:8px 40px 28px 40px;text-align:center;">
                    <a href="{blog_url}"
                       style="color:{t["link"]};text-decoration:none;font-family:'Source Serif 4',Georgia,serif;font-size:13px;font-style:italic;">{both("link", f'{c["visit_chronicle"]} &rarr;')}</a>
                  </td>
                </tr>

                <!-- Signature -->
                <tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:{t["rule"]};"><div class="theme-divider" style="height:1px;line-height:1px;font-size:0;">&nbsp;</div></td></tr>
                <tr>
                  <td style="padding:24px 40px 36px 40px;text-align:right;">
                    <p style="margin:0;font-family:'Source Serif 4',Georgia,serif;color:{t["signoff"]};font-style:italic;font-size:16px;line-height:1.6;">
                      {both("signoff", c["sign_off"])}
                    </p>
                    <p style="margin:12px 0 0 0;font-family:'Marck Script','Caveat',cursive;color:{t["signature"]};font-size:30px;line-height:1;">
                      {both("signature", "— Starseeker")}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <p style="margin:20px 0 0 0;font-family:'Source Serif 4',Georgia,serif;color:{t["muted"]};font-size:11px;">
          {both("muted", c["footer"])}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _build_text_fallback(*, lang: str, title: str, slug: str, excerpt: str) -> str:
    c = _COPY[lang]
    post_url, blog_url = _urls(lang, slug)
    excerpt_line = f"\n  {excerpt}\n" if excerpt else ""
    read, visit = f"{c['read']}:", f"{c['visit_blog']}:"
    width = max(len(read), len(visit))
    return (
        f"{c['salutation']}\n\n"
        f"{c['text_opening']}\n\n"
        f"  {c['open_quote']}{title}{c['close_quote']}{excerpt_line}\n"
        f"{c['text_closing']}\n\n"
        f"{read.ljust(width)} {post_url}\n"
        f"{visit.ljust(width)} {blog_url}\n\n"
        f"{c['sign_off']}\nStarseeker\n"
    )


def send_love_letter(*, lang: str, title: str, slug: str, excerpt: str) -> bool:
    """Dispatch the love-letter invitation in `lang` ("en" or "es"), or log it
    when SMTP is unconfigured. Returns False only when the dispatch failed."""
    recipient = settings.loved_one_email
    sender = settings.smtp_from or settings.smtp_username or f"blog@{settings.site_url.split('//')[-1].split('/')[0]}"

    msg = EmailMessage()
    msg["Subject"] = _COPY[lang]["subject"]
    msg["From"] = formataddr(("Starseeker", sender))
    msg["To"] = recipient
    msg["Message-ID"] = make_msgid(domain="blog.local")
    msg.set_content(_build_text_fallback(lang=lang, title=title, slug=slug, excerpt=excerpt))
    msg.add_alternative(_build_love_email_html(lang=lang, title=title, slug=slug, excerpt=excerpt), subtype="html")

    if not settings.smtp_host:
        # Log-only mode — no SMTP configured. Still useful for local dev.
        logger.info(
            "[love-letter] SMTP not configured; would have sent to %s:\n%s",
            recipient, msg.as_string(),
        )
        return True

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            smtp.starttls()
            if settings.smtp_username and settings.smtp_password:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(msg)
        logger.info("[love-letter] Sent to %s for slug=%s (%s)", recipient, slug, lang)
        return True
    except Exception:
        # Never let a mail failure break the publish request.
        logger.exception("[love-letter] SMTP dispatch failed for slug=%s", slug)
        return False
