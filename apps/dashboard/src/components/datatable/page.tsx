import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";

const demoData: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },

  {
    id: "728edee3",
    amount: 85,
    status: "processing",
    email: "test@gmail.com",
  },
  {
    id: "728edrtt6",
    amount: 986,
    status: "processing",
    email: "sadas@gmail.com",
  },
  {
    id: "5rfsfw448",
    amount: 85,
    status: "processing",
    email: "hrgw@gmail.com",
  },
  {
    id: "84wef4we84",
    amount: 89,
    status: "processing",
    email: "fewaf@gmail.com",
  },
  {
    id: "84f8fw8e",
    amount: 48,
    status: "processing",
    email: "fada@gmail.com",
  },
  {
    id: "fqewfq484",
    amount: 988.5,
    status: "processing",
    email: "htsrg@gmail.com",
  },
  {
    id: "fw95fw5e9f5",
    amount: 19,
    status: "processing",
    email: "gsges@gmail.com",
  },
  {
    id: "feq8wf8q4e",
    amount: 225,
    status: "processing",
    email: "faef@gmail.com",
  },
  // ...
];

export default function DemoDataTablePage() {
  const data = demoData;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
