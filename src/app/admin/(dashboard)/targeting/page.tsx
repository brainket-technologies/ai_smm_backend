import React from 'react';
import prisma from "@/lib/prisma";
import TargetingManagementClient from "./TargetingManagementClient";

export default async function TargetingPage() {
  // Fetch all 5 lists 
  const targetRegionsRaw = await prisma.targetRegion.findMany({ orderBy: { name: 'asc' } });
  const targetAgesRaw = await prisma.targetAgeGroup.findMany({ orderBy: { name: 'asc' } });
  const modelEthnicitiesRaw = await prisma.modelEthnicity.findMany({ orderBy: { name: 'asc' } });
  const ctaButtonsRaw = await prisma.cTAButton.findMany({ orderBy: { name: 'asc' } });
  const audienceTypesRaw = await prisma.audienceType.findMany({ orderBy: { name: 'asc' } });

  // Serialize BigInts to strings across all raw arrays
  const serializeList = (list: any[]) => list.map(item => ({ ...item, id: item.id.toString() }));

  const dataMap = {
    targetRegion: serializeList(targetRegionsRaw),
    targetAgeGroup: serializeList(targetAgesRaw),
    modelEthnicity: serializeList(modelEthnicitiesRaw),
    cTAButton: serializeList(ctaButtonsRaw),
    audienceType: serializeList(audienceTypesRaw)
  };

  return (
    <div className="animate-in fade-in duration-700">
      <TargetingManagementClient initialDataMap={dataMap} />
    </div>
  );
}
