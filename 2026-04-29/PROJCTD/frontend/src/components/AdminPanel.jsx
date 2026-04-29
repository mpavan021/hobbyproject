import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Save, Trash2 } from "lucide-react";
import { addBus, deleteBus, updateBus } from "../api.js";

const emptyForm = {
  id: "",
  lat: "12.9716",
  lng: "77.5946",
  route: "Campus Route",
  scheduledMinutes: "10"
};

export default function AdminPanel({ buses, selectedBus }) {
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("add");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "update" && selectedBus) {
      setForm({
        id: selectedBus.id,
        lat: selectedBus.lat.toFixed(6),
        lng: selectedBus.lng.toFixed(6),
        route: selectedBus.route,
        scheduledMinutes: String(selectedBus.scheduledMinutes)
      });
    }
  }, [mode, selectedBus]);

  function changeField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const payload = {
        lat: Number(form.lat),
        lng: Number(form.lng),
        route: form.route,
        scheduledMinutes: Number(form.scheduledMinutes)
      };

      if (mode === "add") {
        await addBus({ id: form.id.trim(), ...payload });
        setForm(emptyForm);
        setMessage("Bus added and broadcast to all open dashboards.");
      } else {
        await updateBus(form.id, payload);
        setMessage("Bus updated in real time.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeBus() {
    if (!form.id) return;

    try {
      await deleteBus(form.id);
      setMode("add");
      setForm(emptyForm);
      setMessage("Bus deleted from the live map.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">Admin panel</p>
          <h2 className="text-lg font-black">Manage buses</h2>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => {
              setMode("add");
              setForm(emptyForm);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-black transition ${mode === "add" ? "bg-white text-blue-700 shadow dark:bg-slate-950 dark:text-blue-200" : "text-slate-500"}`}
          >
            Add
          </button>
          <button
            onClick={() => setMode("update")}
            className={`rounded-lg px-3 py-2 text-sm font-black transition ${mode === "update" ? "bg-white text-blue-700 shadow dark:bg-slate-950 dark:text-blue-200" : "text-slate-500"}`}
          >
            Edit
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-3">
        {mode === "update" && (
          <label className="grid gap-1 text-sm font-bold">
            Select Bus
            <select
              name="id"
              value={form.id}
              onChange={(event) => {
                const bus = buses.find((item) => item.id === event.target.value);
                if (bus) {
                  setForm({
                    id: bus.id,
                    lat: bus.lat.toFixed(6),
                    lng: bus.lng.toFixed(6),
                    route: bus.route,
                    scheduledMinutes: String(bus.scheduledMinutes)
                  });
                }
              }}
              className="admin-input"
            >
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.id}
                </option>
              ))}
            </select>
          </label>
        )}

        {mode === "add" && <Field label="Bus ID" name="id" value={form.id} onChange={changeField} placeholder="BUS-200" />}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" name="lat" type="number" step="0.000001" value={form.lat} onChange={changeField} />
          <Field label="Longitude" name="lng" type="number" step="0.000001" value={form.lng} onChange={changeField} />
        </div>

        <Field label="Route" name="route" value={form.route} onChange={changeField} />
        <Field
          label="Scheduled ETA"
          name="scheduledMinutes"
          type="number"
          min="1"
          value={form.scheduledMinutes}
          onChange={changeField}
        />

        <div className="flex gap-3 pt-1">
          <motion.button
            whileHover={{ y: -2 }}
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-black text-white shadow-glow transition hover:bg-blue-700"
          >
            {mode === "add" ? <Plus size={18} /> : <Save size={18} />}
            {mode === "add" ? "Add Bus" : "Update Bus"}
          </motion.button>

          {mode === "update" && (
            <button
              type="button"
              onClick={removeBus}
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700 transition hover:bg-red-200"
              title="Delete selected bus"
            >
              <Trash2 size={19} />
            </button>
          )}
        </div>
      </form>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {message}
        </motion.p>
      )}
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input {...props} className="admin-input" required />
    </label>
  );
}
