import { useEffect, useState } from "react";

function App() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state for create/edit
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // null = add mode, number = edit mode (store ID)
  const [editingId, setEditingId] = useState(null);

  // Fetch all stores
  const fetchStores = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/stores");
      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }
      const data = await response.json();
      setStores(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enter edit mode
  const handleEditClick = (store) => {
    setEditingId(store.id);
    setForm({
      name: store.name || "",
      address: store.address || "",
      latitude:
        store.latitude !== null && store.latitude !== undefined
          ? String(store.latitude)
          : "",
      longitude:
        store.longitude !== null && store.longitude !== undefined
          ? String(store.longitude)
          : "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      latitude: "",
      longitude: "",
      address: "",
    });
  };

  // Delete store
  const handleDelete = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/stores/${storeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Backend error:", text);
        throw new Error("Failed to delete store");
      }

      await fetchStores();
    } catch (err) {
      setError(err.message || "Something went wrong while deleting store");
    }
  };

  // Submit add/edit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        name: form.name || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        address: form.address || null,
      };

      let url = "http://127.0.0.1:8000/stores";
      let method = "POST";

      if (editingId !== null) {
        url = `http://127.0.0.1:8000/stores/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Backend error:", text);
        throw new Error(
          `Failed to ${editingId !== null ? "update" : "create"} store`
        );
      }

      await fetchStores();

      setForm({
        name: "",
        latitude: "",
        longitude: "",
        address: "",
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Something went wrong while saving store");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}>
      <h1>Shopping Helper – Stores</h1>

      {/* Add / Edit Form */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2>{editingId === null ? "Add Store" : "Edit Store"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Name*:
              <br />
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.3rem" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Address:
              <br />
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.3rem" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label>
                Latitude:
                <br />
                <input
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "0.3rem" }}
                />
              </label>
            </div>

            <div style={{ flex: 1 }}>
              <label>
                Longitude:
                <br />
                <input
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "0.3rem" }}
                />
              </label>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || !form.name}>
            {isSubmitting
              ? editingId === null
                ? "Adding..."
                : "Saving..."
              : editingId === null
              ? "Add Store"
              : "Save Changes"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{ marginLeft: "0.5rem" }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* Store List */}
      {loading && <p>Loading stores...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && stores.length === 0 && (
        <p>No stores found yet. Add one using the form above.</p>
      )}

      <ul>
        {stores.map((store) => (
          <li
            key={store.id}
            style={{
              marginBottom: "0.5rem",
              borderBottom: "1px solid #eee",
              paddingBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <strong>{store.name}</strong>
              <br />
              {store.address && <span>{store.address}</span>}
              {store.latitude !== null &&
                store.latitude !== undefined &&
                store.longitude !== null &&
                store.longitude !== undefined && (
                  <div>
                    <small>
                      ({store.latitude}, {store.longitude})
                    </small>
                  </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => handleEditClick(store)}>Edit</button>

              <button
                onClick={() => handleDelete(store.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "0.3rem 0.6rem",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
