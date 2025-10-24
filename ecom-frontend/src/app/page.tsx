// app/page.tsx  (server component — no "use client")
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";

export default function HomePage() {
  return (
    <main>
      <Hero />
      {/* <-- server-rendered anchor wrapper present immediately in HTML */}
      <div id="categories">
        <CategoryGrid />
      </div>
    </main>
  );
}
