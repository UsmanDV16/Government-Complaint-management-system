import seedUsers from "./users";
import seedComplaints from "./complaints";
import seedDepartments from "./departments";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

export async function getSeedData() {
  await wait();
  return {
    users: clone(seedUsers),
    complaints: clone(seedComplaints),
    departments: clone(seedDepartments)
  };
}
