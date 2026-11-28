import type { Metadata } from "next";
import { contactLine, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How SayPay collects, uses and protects your information." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="28 November 2026">
      <section>
        <p>
          This policy explains what information SayPay collects, why, and what you can do about it. SayPay is used by businesses (&ldquo;you&rdquo;) to send
          quotes to their customers (&ldquo;clients&rdquo;).
        </p>
      </section>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your email address and the business details you add (name, trade, phone, logo, bank details for transfers).</li>
          <li>Quote content: job titles, line items, prices, voice notes, photos and messages you or your clients add.</li>
          <li>Client details: the client name on a quote, and anything a client types or uploads on a quote page.</li>
          <li>Basic technical data needed to run the service, such as when a quote link was opened.</li>
        </ul>
      </section>
      <section>
        <h2>Voice</h2>
        <p>
          When you use &ldquo;Speak your quote&rdquo;, speech is turned into text by your own browser or phone. SayPay only receives the text you choose to
          use. Voice notes you record and attach to a quote are stored so your client can play them.
        </p>
      </section>
      <section>
        <h2>Payments</h2>
        <p>
          Card payments are handled by Stripe. SayPay never sees or stores full card numbers. If you connect Stripe, Stripe&apos;s own privacy policy also
          applies. Bank transfer details you add are shown only to clients who have accepted your quote.
        </p>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To provide the service: create quotes, show them to your clients, take payments and send sign-in emails.</li>
          <li>To keep the service secure and fix problems.</li>
          <li>We do not sell your information or use it for advertising.</li>
        </ul>
      </section>
      <section>
        <h2>Who we share it with</h2>
        <p>
          Only the providers that run SayPay: Supabase (database, sign-in and file storage), Vercel (hosting) and Stripe (card payments). Each processes
          data on our behalf under its own security and privacy terms.
        </p>
      </section>
      <section>
        <h2>Keeping and deleting data</h2>
        <p>
          We keep your data while your account is open. You can delete quotes at any time. To close your account and delete your data, or to get a copy
          of it, contact us at {contactLine()}.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          Under UK GDPR you can ask to see, correct or delete your personal information, and you can complain to the Information Commissioner&apos;s
          Office (ico.org.uk). Clients with questions about a quote should contact the business that sent it.
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>SayPay only uses the cookies needed to keep you signed in. There are no tracking or advertising cookies.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about this policy: {contactLine()}.</p>
      </section>
    </LegalPage>
  );
}
