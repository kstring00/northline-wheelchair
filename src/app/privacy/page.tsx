import type { Metadata } from "next";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects the information you share when you book a wheelchair van ride in Houston.`,
  path: "/privacy",
});

// CONFIRM: have this reviewed before launch. Plain-language draft for the pitch.
export default function PrivacyPage() {
  return (
    <>
      <PageHeader crumbs={[{ name: "Privacy Policy", path: "/privacy" }]} title="Privacy policy" cta={false} />
      <section aria-label="Policy" className="bg-cream pb-20">
        <div className="container-page prose-page max-w-3xl text-lg">
          <p><strong>Draft. Last updated: CONFIRM before launch.</strong></p>
          <h2>What we collect</h2>
          <p>When you request a ride, we ask for the pickup and drop-off addresses, date and time, how the rider gets around, how many people are riding, and your name, phone number and (optionally) email. We do not ask for medical conditions or diagnoses.</p>
          <h2>How we use it</h2>
          <ul>
            <li>To plan, confirm and give your ride.</li>
            <li>To call or email you about that ride.</li>
            <li>To bill for the ride, when needed.</li>
          </ul>
          <p>We do not sell your information.</p>
          <h2>Website analytics</h2>
          <p>We may use Microsoft Clarity to see how people use this website so we can make it easier to use. Anything you type into our forms is hidden from these tools.</p>
          <h2>Questions</h2>
          <p>Call {site.phone.display} or email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
        </div>
      </section>
    </>
  );
}
