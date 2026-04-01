const complaints = [
  {
    id: "c1",
    citizenId: "u1",
    title: "No water in Sector 12",
    description: "We have not received water supply for the last two days.",
    category: "Water",
    departmentId: "d1",
    status: "In Progress",
    remarks: "Team dispatched for inspection",
    createdAt: "2026-03-28"
  },
  {
    id: "c2",
    citizenId: "u1",
    title: "Potholes near school road",
    description: "Large potholes are causing accidents near City Public School.",
    category: "Roads",
    departmentId: "d2",
    status: "Pending",
    remarks: "",
    createdAt: "2026-03-30"
  },
  {
    id: "c3",
    citizenId: "u1",
    title: "Street light not working",
    description: "Three street lights are off in our locality after rain.",
    category: "Electricity",
    departmentId: "d4",
    status: "Resolved",
    remarks: "Lights replaced and line repaired",
    createdAt: "2026-03-20"
  }
];

export default complaints;
