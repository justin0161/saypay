import type { Metadata } from "next";
import { contactLine, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Service", description: "The terms for using SayPay." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="28 November 2026">
      <section>
        <p>By creating a SayPay account or using a SayPay quote link, you agree to these terms. If you don&apos;t agree, please don&apos;t use SayPay.</p>
      </section>
      <section>
        <h2>What SayPay does</h2>
        <p>
          SayPay lets businesses create quotes, add voice notes and photos, share them by link, and collect payments. The contract for the work itself is
          between the business and its client. SayPay is not a party to it and doesn&apos;t carry out, guarantee or check any work.
        </p>
      </section>
      <section>
        <h2>Your account</h2>
        <ul>
          <li>Keep your sign-in details safe. You&apos;re responsible for activity on your account.</li>
          <li>Make sure the details on your quotes — prices, VAT, business and bank details — are accurate and that you&apos;re allowed to use them.</li>
          <li>Only upload content you have the right to share, and nothing unlawful, offensive or misleading.</li>
        </ul>
      </section>
      <section>
        <h2>Payments</h2>
        <p>
          Card payments are processed by Stripe and paid to the business&apos;s own Stripe account. Businesses must accept Stripe&apos;s terms when
          connecting. Stripe&apos;s fees apply. Bank transfers go directly between the client and the business; SayPay doesn&apos;t hold or check them.
          Refunds and disputes are between the business and its client.
        </p>
      </section>
      <section>
        <h2>Plans</h2>
        <p>
          SayPay may offer free and paid plans. Prices are shown before you subscribe, and you can cancel a paid plan at any time; it stays active until
          the end of the period you&apos;ve paid for.
        </p>
      </section>
      <section>
        <h2>Availability</h2>
        <p>
          We work hard to keep SayPay running, but can&apos;t promise it will always be available or error-free. We may change or improve features over
          time.
        </p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>
          SayPay is provided &ldquo;as is&rdquo;. As far as the law allows, we&apos;re not liable for indirect losses or lost profits, or for disputes
          between businesses and their clients. Nothing in these terms limits rights you have by law.
        </p>
      </section>
      <section>
        <h2>Ending your account</h2>
        <p>You can stop using SayPay at any time. We may suspend accounts that break these terms.</p>
      </section>
      <section>
        <h2>Law and contact</h2>
        <p>These terms are governed by the laws of England and Wales. Questions: {contactLine()}.</p>
      </section>
    </LegalPage>
  );
}
