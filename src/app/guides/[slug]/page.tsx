import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { articleSchema } from "@/lib/schema";
import { getGuide, getGuides } from "@/lib/guides";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DraftLabel } from "@/components/ui/Badges";
import { FinalCta } from "@/components/home/FinalCta";

export const dynamicParams = false;
export const generateStaticParams = () => getGuides().map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return buildMetadata({ title: g.title, description: g.description, path: `/guides/${g.slug}`, draft: g.draft });
}

const fmt = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const components = {
  a: (props: React.ComponentProps<"a">) =>
    props.href?.startsWith("/") ? <Link href={props.href} className="font-bold text-navy underline">{props.children}</Link> : <a {...props} className="font-bold text-navy underline" />,
};

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}`;
  return (
    <>
      <JsonLd data={articleSchema({ title: g.title, description: g.description, date: g.date, author: g.author, path })} />
      <article className="bg-cream pb-8">
        <div className="container-page max-w-3xl pt-4">
          <Breadcrumbs items={[{ name: "Guides", path: "/guides" }, { name: g.title, path }]} />
          {g.draft && <div className="mt-4"><DraftLabel /></div>}
          <h1 className="mt-4 text-[2.25rem] font-bold sm:text-[3rem]">{g.title}</h1>
          <p className="mt-4 text-lg text-ink/85">
            By {g.author}, {site.owner.role.toLowerCase()} · {fmt(g.date)} · {Math.max(2, Math.round(g.words / 200))} min read
          </p>
          {/* CONFIRM: byline and body approved by Jay before `draft: false`. */}
          <div className="prose-page mt-10 text-lg">
            <MDXRemote source={g.content} components={components} />
          </div>
        </div>
      </article>
      <FinalCta title="Ready to book the ride?" />
    </>
  );
}
