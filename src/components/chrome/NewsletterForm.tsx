"use client";
// Footer newsletter sign-up (after the reference's "Stay in the loop"). Sign-ups go to the Shopify customer list with email
// marketing consent (/api/newsletter, user 2026-10-14: 「電子報用 Shopify」); until the Admin token is set the API answers
// not_configured and the form says the newsletter is not open yet instead of pretending to subscribe.
import { useState, type FormEvent } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { supportEmail } from "@/data/commerce";

// The one submit path for every newsletter form (this footer form and NewsletterPopup).
export function useNewsletterSubmit() {
  const { t } = useT();
  const [note, setNote] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setNote(null);
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), company: data.get("company") }) });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) { setDone(true); form.reset(); setNote(t("謝謝訂閱！新品與活動消息會寄到你的信箱。", "Thank you for subscribing. News will arrive in your inbox.")); }
      else if (json.error === "design_preview") setNote(t("此為設計測試站，不會送出訂閱資料。", "This is a design preview. No subscription was submitted."));
      else if (json.error === "not_configured") setNote(t("電子報將於 Shopify 串接完成後開放訂閱。", "The newsletter is not open yet."));
      else if (json.error === "bad_request") setNote(t("請填寫正確的 Email。", "Please enter a valid email address."));
      else setNote(t(`訂閱沒有成功，請稍後再試，或來信 ${supportEmail}。`, `We couldn't subscribe you. Please try again later, or email us at ${supportEmail}.`));
    } catch {
      setNote(t("網路連線有問題，請稍後再試。", "Connection problem. Please try again later."));
    } finally {
      setSending(false);
    }
  };
  return { note, submit, sending, done };
}

// A field people never see or reach with the keyboard; bots that fill every input fill it, and /api/newsletter then stores nothing.
export const NewsletterTrap = () => <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="news-trap" />;

export default function NewsletterForm() {
  const { t } = useT();
  const { note, submit, sending } = useNewsletterSubmit();
  return (
    <form className="footer-news-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="footer-email">Email</label>
      <input id="footer-email" type="email" name="email" placeholder="Email" autoComplete="email" required />
      <NewsletterTrap />
      <button type="submit" className="tc" disabled={sending}>{sending ? t("送出中…", "Sending…") : t("訂閱", "Subscribe")}</button>
      {note && <p className="footer-news-status tc" role="status">{note}</p>}
    </form>
  );
}
