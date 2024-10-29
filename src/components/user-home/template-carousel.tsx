"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TemplateCard } from "./template-card";
import { templateList } from "@/consts/templates";

export default function TemplateCarousel() {
  const [carouselRef] = useEmblaCarousel({ loop: false });

  return (
    <div className="relative">
      <div ref={carouselRef} className="overflow-hidden">
        <div className="flex">
          {templateList.map((template, index) => (
            <div key={index} className="shrink-0 basis-[250px] p-2">
              <TemplateCard template={template} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
