import type { Metadata } from "next";
import { site, getService } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";

const service = getService("senior-transportation")!;

export const metadata: Metadata = buildMetadata({
  title: "Senior Transportation in North Houston",
  description: `Assisted, door-to-door rides for older adults in north Houston who walk with a cane, a walker or a steady arm. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "Parents who stopped driving", body: "They can still walk to the car. They just can't drive it anymore, and you can't take every Tuesday off." },
    { title: "Riders with a walker or cane", body: "Our vans have a low step and a driver's arm. You sit in a regular seat, belted in." },
    { title: "Anyone who needs a steady arm", body: "After a fall or a hospital stay, a hand at the elbow is the difference between going and not going." },
    { title: "Trips that aren't medical", body: "The hair salon, church, lunch with a friend, the bank. Rides that keep a life going." },
  ],
  steps: [
    { title: "Tell us how you get around", body: "Cane, walker, or just a hand. It changes which van and which seat we plan for." },
    { title: "We confirm and set the time", body: `We call back within ${site.responseTime} with the price. The day before, we call again.` },
    { title: "Your driver comes to the door", body: "A text when they're close, an arm at the door, and a driver who doesn't rush." },
  ],
  included: [
    { title: "An arm from your door", body: "Down the steps, across the lot, into the seat. And the same on the way back." },
    { title: "Your walker rides along", body: "Folded and stowed, or beside you. Your choice." },
    { title: "A driver who waits", body: "Book wait & return and they're outside when you're done." },
    { title: "Regular rides, set once", body: "Every Thursday to the salon. Every Sunday to church. One call." },
    { title: "Family can come", body: `Up to ${site.capabilities.maxCompanions ?? 2} riders along with you.` },
    { title: "The price up front", body: "Assisted rides use the same rules as wheelchair rides. No surprises." },
  ],
  onTheDay: [
    "We call the day before. Your driver texts when they're on the way and arrives early. They come to the door, say their name, and offer an arm. Take it or not, at your pace.",
    "You sit in a regular seat with a lap and shoulder belt. Your walker goes beside you. If you'd rather ride in a wheelchair for a long day, say so and we'll bring one.",
    "At the other end, the driver walks you inside to the check-in desk, the pew, or the table. When you're ready to go home, they're there.",
  ],
  image: site.images.driverHelping,
};

export default function Page() {
  return <ServicePage service={service} title="Senior Transportation in North Houston" copy={copy} />;
}
