"""Outbound email — currently one template: the Bridgerton love-letter
invitation fired when a post tagged `love` is published with the opt-in
check ticked.

SMTP config is optional. When `SMTP_HOST` is empty the email is logged to
stdout instead of dispatched, so the feature works end-to-end in local
development without credentials.
"""

import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid

from app.config import settings

logger = logging.getLogger(__name__)


def _build_love_email_html(*, title: str, slug: str, excerpt: str) -> str:
    """Render the dark-mode Bridgerton invitation as inline-styled HTML."""
    post_url = f"{settings.site_url.rstrip('/')}/posts/{slug}"
    blog_url = settings.site_url.rstrip("/")

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>An Invitation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Marck+Script&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Caveat:wght@500;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0f0d24;font-family:'Source Serif 4',Georgia,serif;color:#c9beed;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0d24;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1735;border:1px solid #322d5a;border-radius:16px;overflow:hidden;">

          <!-- Flourish header -->
          <tr>
            <td style="padding:32px 40px 8px 40px;text-align:center;border-bottom:1px solid #322d5a;">
              <p style="margin:0;font-family:'Caveat',cursive;color:#fbbf24;font-size:16px;letter-spacing:4px;text-transform:uppercase;">
                · An Invitation ·
              </p>
            </td>
          </tr>

          <!-- Salutation -->
          <tr>
            <td style="padding:32px 40px 8px 40px;text-align:center;">
              <p style="margin:0;font-family:'Marck Script','Caveat',cursive;color:#f0ecfd;font-size:44px;line-height:1;">
                My Dearest,
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 16px 40px;font-family:'Source Serif 4',Georgia,serif;color:#c9beed;font-size:16px;line-height:1.75;font-style:italic;text-align:justify;">
              <p style="margin:0 0 18px 0;">
                It is with a quickened pulse and no small measure of feeling that I take up my pen this evening.
                A new page has been committed to my private chronicle — a reflection I could not bear to see read
                by any eyes before yours.
              </p>
              <p style="margin:0 0 18px 0;">
                I humbly entreat you to grace the pages of
                <span style="font-style:normal;color:#f0ecfd;font-weight:600;">&ldquo;{title}&rdquo;</span> —
                {excerpt or "a small composition written, as ever, with you half a thought away."}
              </p>
              <p style="margin:0;">
                The garden gate is unlatched, the candles are lit, and the tea — should you desire it —
                waits warm upon the table.
              </p>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td style="padding:28px 40px 8px 40px;text-align:center;">
              <a href="{post_url}"
                 style="display:inline-block;padding:12px 28px;border-radius:999px;
                        background:#fbbf24;color:#1a1735;text-decoration:none;font-family:'Source Serif 4',Georgia,serif;
                        font-weight:600;letter-spacing:1px;font-size:14px;">
                Read the letter
              </a>
            </td>
          </tr>

          <!-- Secondary link -->
          <tr>
            <td style="padding:8px 40px 28px 40px;text-align:center;">
              <a href="{blog_url}"
                 style="color:#a78bfa;text-decoration:none;font-family:'Source Serif 4',Georgia,serif;font-size:13px;font-style:italic;">
                or visit the full chronicle &rarr;
              </a>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:24px 40px 36px 40px;text-align:right;border-top:1px solid #322d5a;">
              <p style="margin:0 0 6px 0;font-family:'Source Serif 4',Georgia,serif;color:#c9beed;font-style:italic;font-size:14px;">
                Yours, eternally,
              </p>
              <p style="margin:0;font-family:'Marck Script','Caveat',cursive;color:#fbbf24;font-size:34px;line-height:1;">
                Starseeker
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <p style="margin:20px 0 0 0;font-family:'Source Serif 4',Georgia,serif;color:#6b60a0;font-size:11px;">
          Sent from a small corner of the internet, with great care.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _build_text_fallback(*, title: str, slug: str, excerpt: str) -> str:
    post_url = f"{settings.site_url.rstrip('/')}/posts/{slug}"
    blog_url = settings.site_url.rstrip("/")
    excerpt_line = f"\n  {excerpt}\n" if excerpt else ""
    return (
        "My Dearest,\n\n"
        "A new page has been committed to my chronicle — and I could not bear\n"
        "for it to be read by any eyes before yours.\n\n"
        f"  \u201c{title}\u201d{excerpt_line}\n"
        f"Read the letter: {post_url}\n"
        f"Visit the blog:  {blog_url}\n\n"
        "Yours, eternally,\nStarseeker\n"
    )


def send_love_letter(*, title: str, slug: str, excerpt: str) -> None:
    """Dispatch the love-letter invitation, or log it when SMTP is unconfigured."""
    recipient = settings.loved_one_email
    sender = settings.smtp_from or settings.smtp_username or f"blog@{settings.site_url.split('//')[-1].split('/')[0]}"
    subject = "My Dearest \u2014 A New Letter Awaits"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr(("Starseeker", sender))
    msg["To"] = recipient
    msg["Message-ID"] = make_msgid(domain="blog.local")
    msg.set_content(_build_text_fallback(title=title, slug=slug, excerpt=excerpt))
    msg.add_alternative(_build_love_email_html(title=title, slug=slug, excerpt=excerpt), subtype="html")

    if not settings.smtp_host:
        # Log-only mode — no SMTP configured. Still useful for local dev.
        logger.info(
            "[love-letter] SMTP not configured; would have sent to %s:\n%s",
            recipient, msg.as_string(),
        )
        return

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            smtp.starttls()
            if settings.smtp_username and settings.smtp_password:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(msg)
        logger.info("[love-letter] Sent to %s for slug=%s", recipient, slug)
    except Exception:
        # Never let a mail failure break the publish request.
        logger.exception("[love-letter] SMTP dispatch failed for slug=%s", slug)
