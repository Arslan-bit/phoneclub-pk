"use client";
import dynamic from "next/dynamic";

const IPhoneHero3D = dynamic(() => import("@/components/IPhoneHero3D"), { ssr: false });

export default function HeroClient() {
  return (
    <div className="h-[500px] lg:h-[600px] relative">
      <IPhoneHero3D />
    </div>
  );
}
