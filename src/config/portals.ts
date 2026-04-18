export interface PortalOption {
  sector: string;
  sectorKey: string;
  subSectors: SubSector[];
}

export interface SubSector {
  name: string;
  key: string;
  path: string;
  color: string;
}

export const PORTAL_OPTIONS: PortalOption[] = [
  {
    sector: "Government & Public Health",
    sectorKey: "government",
    subSectors: [
      { name: "Primary Health Centre (PHC)", key: "phc", path: "/phc/login", color: "bg-green-600" },
      { name: "State General Hospital", key: "sth", path: "/sth/login", color: "bg-teal-600" },
      { name: "State Teaching Hospital", key: "stth", path: "/stth/login", color: "bg-cyan-600" },
      { name: "Federal Medical Centre (FMC)", key: "fmc", path: "/fmc/login", color: "bg-red-600" },
      { name: "Federal Teaching Hospital", key: "fth", path: "/fth/login", color: "bg-purple-600" },
    ],
  },
  {
    sector: "Health Insurance & HMOs",
    sectorKey: "hmo",
    subSectors: [
      { name: "Health Maintenance Organization", key: "hmo", path: "/hmo/login", color: "bg-blue-600" },
    ],
  },
  {
    sector: "Private Healthcare",
    sectorKey: "private",
    subSectors: [
      { name: "Clinic", key: "clinic", path: "/clinic/login", color: "bg-orange-600" },
      { name: "Private Hospital", key: "pvt", path: "/pvt/login", color: "bg-amber-600" },
      { name: "Private Teaching Hospital", key: "ptth", path: "/ptth/login", color: "bg-yellow-600" },
    ],
  },
  {
    sector: "Direct to Consumer (Patients)",
    sectorKey: "patient",
    subSectors: [
      { name: "Patient Portal", key: "patient", path: "/login", color: "bg-teal-600" },
    ],
  },
];

export const getPortalByRole = (role: string): SubSector | undefined => {
  for (const sector of PORTAL_OPTIONS) {
    const found = sector.subSectors.find((ss) => {
      const roleMap: Record<string, string[]> = {
        phc: ["hcc_staff", "hcc_admin"],
        sth: ["sth_staff", "sth_admin"],
        stth: ["stth_staff", "stth_admin"],
        fmc: ["fhc_staff", "fhc_admin"],
        fth: ["fth_staff", "fth_admin"],
        hmo: ["hmo_staff", "hmo_admin"],
        clinic: ["clinic_staff", "clinic_admin"],
        pvt: ["pvt_staff", "pvt_admin"],
        ptth: ["ptth_staff", "ptth_admin"],
        patient: ["patient"],
      };
      return roleMap[ss.key]?.includes(role);
    });
    if (found) return found;
  }
  return undefined;
};