export default function AddEmployee() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

      <form className="space-y-4 max-w-md">
        <input className="w-full border p-2 rounded" placeholder="Name" />

        <input className="w-full border p-2 rounded" placeholder="Email" />

        <input
          className="w-full border p-2 rounded"
          placeholder="Department"
        />

        <input className="w-full border p-2 rounded" placeholder="Salary" />

        <button className="bg-slate-900 text-white px-4 py-2 rounded">
          Add Employee
        </button>
      </form>
    </div>
  );
}
