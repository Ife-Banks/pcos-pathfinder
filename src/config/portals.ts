export interface PortalOption {
  sector: string;
  sectorKey: string;
  description: string;
  subSectors: SubSector[];
}

export interface SubSector {
  name: string;
  key: string;
  path: string;
  color: string;
  description: string;
}

export const PORTAL_OPTIONS: PortalOption[] = [
  {
    sector: "System Administration",
    sectorKey: "admin",
    description: "Manage system-wide settings, users, analytics, and security policies",
    subSectors: [
      { name: "System Admin Portal", key: "admin", path: "/system-admin/login", color: "bg-slate-700", description: "Full system administration and oversight" },
    ],
  },
  {
    sector: "Government & Public Health",
    sectorKey: "government",
    description: "Primary, State, and Federal healthcare facilities serving communities nationwide",
    subSectors: [
      { name: "Government Admin Portal", key: "gov-admin", path: "/gov-admin/login", color: "bg-teal-700", description: "LGA/LCDA, State, and Federal admin management for public health facilities" },
      { name: "Primary Health Centre (PHC)", key: "phc", path: "/phc/login", color: "bg-green-600", description: "State-run community healthcare centers" },
      { name: "State General Hospital", key: "sth", path: "/sth/login", color: "bg-teal-600", description: "Secondary care state-run hospitals" },
      { name: "State Teaching Hospital", key: "stth", path: "/stth/login", color: "bg-cyan-600", description: "Teaching hospitals affiliated with state universities" },
      { name: "Federal Medical Centre (FMC)", key: "fmc", path: "/fmc/login", color: "bg-red-600", description: "Federal tertiary healthcare facilities" },
      { name: "Federal Teaching Hospital", key: "fth", path: "/fth/login", color: "bg-purple-600", description: "Teaching hospitals affiliated with federal universities" },
      
    ],
  },
  {
    sector: "Health Insurance & HMOs",
    sectorKey: "hmo",
    description: "Health Management Organizations and Insurance providers for healthcare coverage",
    subSectors: [
      { name: "Health Management Organization (HMO)", key: "hmo", path: "/hmo/login", color: "bg-blue-600", description: "Managed care organizations coordinating healthcare" },
      { name: "Health Insurance", key: "insurance", path: "/hmo/login", color: "bg-indigo-600", description: "Health insurance providers and schemes" },
    ],
  },
  {
    sector: "Private Healthcare",
    sectorKey: "private",
    description: "Private clinics, hospitals, and teaching hospitals serving patients directly",
    subSectors: [
      { name: "Specialist Clinic", key: "clinic", path: "/clinic/login", color: "bg-orange-600", description: "Private specialist outpatient clinics" },
      { name: "Private Hospital", key: "pvt", path: "/pvt/login", color: "bg-amber-600", description: "Privately operated medical facilities" },
      { name: "Private Teaching Hospital", key: "ptth", path: "/ptth/login", color: "bg-yellow-600", description: "Teaching hospitals under private management" },
    ],
  },
  {
    sector: "Direct Patient",
    sectorKey: "patient",
    description: "For individuals seeking health tracking, risk assessment, and wellness monitoring",
    subSectors: [
      { name: "Patient Portal", key: "patient", path: "/login", color: "bg-teal-600", description: "Personal health dashboard and risk tracking" },
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
        "gov-admin": ["lga_admin", "state_admin"],
      };
      return roleMap[ss.key]?.includes(role);
    });
    if (found) return found;
  }
  return undefined;
};