export const mockExpenses = [
  {
    id: "exp-001",
    date: "2023-04-12",
    description: "Servicios de consultoría",
    amount: 1250.0,
    currency: "EUR",
    category: "Servicios profesionales",
    supplier: "Consultoría Verde S.L.",
    notes: "",
    paymentMethod: "Transferencia",
    sourceId: "demo-001",
    sourceSystem: "quickbooks",
    rawData: {},
  },
  {
    id: "exp-002",
    date: "2023-04-10",
    description: "Electricidad oficina central",
    amount: 485.75,
    currency: "EUR",
    category: "Energía",
    supplier: "EnergyPower Inc.",
    notes: "",
    paymentMethod: "Domiciliación",
    sourceId: "demo-002",
    sourceSystem: "quickbooks",
    rawData: {},
  },
  {
    id: "exp-003",
    date: "2023-04-08",
    description: "Material de oficina sostenible",
    amount: 320.5,
    currency: "EUR",
    category: "Material de oficina",
    supplier: "EcoOffice Supplies",
    notes: "Material 100% reciclado",
    paymentMethod: "Tarjeta",
    sourceId: "demo-003",
    sourceSystem: "quickbooks",
    rawData: {},
  },
];

export const mockDashboardData = {
  companyName: "ACME GmbH",
  period: "Q1 2025",
  sustainabilityScore: "RATIO: 2:4",
  taxonomyEligibleActivities: [
    {
      name: "Manufacture of electrical and electronic equipment: C26",
      opEx: "$12,000",
      capEx: "$8,000",
      turnover: "$30,000",
      criteria: [
        {
          label: "Substantial contribution criteria",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
        {
          label: "Climate Change Mitigation",
          color: "bg-lime-accent/20 border-lime-accent text-lime-accent",
        },
        {
          label: "Climate Change Adaptation",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
      ],
      minimumSafeguards: ["OECD", "UN Guiding Principles"],
      article: "SFDR: Article 8",
    },
  ],
  nonGreenActivities: [
    {
      name: "Fossil fuel extraction and processing: B06",
      opEx: "$18,000",
      capEx: "$15,000",
      turnover: "$45,000",
      criteria: [
        {
          label: "Does Not Meet Criteria",
          color: "bg-red-500/20 border-red-500 text-red-400",
        },
      ],
      minimumSafeguards: ["DNSH Not Met"],
      article: "SFDR: Article 6",
    },
  ],
};
