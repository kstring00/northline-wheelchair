import type { Metadata } from "next";
import { site, getService, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";
import { CanAndCant } from "@/components/home/CanAndCant";

const service = getService("wheelchair-transportation")!;

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation in Houston",
  description: `Door-to-door wheelchair van rides in ${areaList()}. Ramp and lift vans, drivers who walk you to the right suite, and the price before you ride. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "You use a wheelchair every day", body: "Manual or power chair, you roll on and stay in your own seat. No transfers, no lifting." },
    { title: "You're booking for a parent", body: "You can be at work in Katy while Mom rides from Spring. We call you to confirm the ride." },
    { title: "You can't manage the car anymore", body: "A hip, a stroke, a bad knee. If getting into a car is the hard part, a ramp van fixes it." },
    { title: "You need it for more than doctors", body: "Church, a grandson's game, the pharmacy, the airport. Any trip where the chair has to come along." },
  ],
  steps: [
    { title: "Tell us where and when", body: `Call ${site.phone.display} or book online. Pickup address, where you're going, the date and time, and how you get around.` },
    { title: "We confirm and price it", body: `We call back within ${site.responseTime} with your pickup time and the exact price. The day before, we call again to confirm.` },
    { title: "Your driver does the rest", body: "Help at your door. A secured ride. A walk to the right suite. And the same care coming home." },
  ],
  included: [
    { title: "Door to door, not curb to curb", body: "Your driver comes to your front door and walks you inside at the other end." },
    { title: "Your own wheelchair, the whole way", body: "You roll on in your own chair and stay in it." },
    // ASK JAY: do standing rides get the same driver? How is a chair secured (straps, belts)?
    { title: `Up to ${site.capabilities.maxCompanions ?? 2} companions`, body: "Family, a caregiver, a friend. Tell us so we save the seats." },
    { title: "Waiting, if you want it", body: "Book wait & return and your driver stays through the appointment." },
    { title: "The price up front", body: "You hear the price on the call, before the ride." },
  ],
  onTheDay: [
    "The day before your ride, we call to confirm the pickup time. If anything about your home is unusual, a gate, a steep driveway, a dog, that's the time to tell us.",
    `Your driver arrives${site.onTimePromise.arriveEarlyMinutes ? ` about ${site.onTimePromise.arriveEarlyMinutes} minutes` : ""} early. They come to the door, say their name, and ask how you like to be helped.`,
    // ASK JAY: how long does boarding take? Radio on or off?
    "You roll up the ramp, the driver secures your chair, and you buckle up.",
    "At the other end, the driver walks you to the check-in desk or the right suite. If you booked wait & return, call when you're done and your driver brings you home.",
  ],
  extra: <CanAndCant heading="What our vans and drivers can do" />,
};

export default function Page() {
  return <ServicePage service={service} title="Wheelchair transportation in Houston" copy={copy} />;
}
