import { useEffect, useState } from "react";

function App() {
  // ===== STORES STATE =====
  const [stores, setStores] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  const [storeEditingId, setStoreEditingId] = useState(null);
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  // ===== PRODUCTS STATE =====
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "",
    unit: "",
    size: "",
  });

  const [productEditingId, setProductEditingId] = useState(null);
  const [productSubmitting, setProductSubmitting] = useState(false);

  // ===== GENERAL ERROR =====
  const [error, setError] = useState("");

  // =========================
  // FETCH STORES
  // =========================
  const fetchStores = async () => {
    setStoreLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/stores");
      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }
      const data = await response.json();
      setStores(data);
    } catch (err) {
      setError(err.message || "Something went wrong while fetching stores");
    } finally {
      setStoreLoading(false);
    }
  };

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    setProductLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Something went wrong while fetching products");
    } finally {
      setProductLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  // =========================
  // STORE FORM HANDLERS
  // =========================
  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStoreEditClick = (store) => {
    setStoreEditingId(store.id);
    setStoreForm({
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

  const handleStoreCancelEdit = () => {
    setStoreEditingId(null);
    setStoreForm({
      name: "",
      latitude: "",
      longitude: "",
      address: "",
    });
  };

  const handleStoreDelete = async (storeId) => {
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

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreSubmitting(true);
    setError("");

    try {
      const payload = {
        name: storeForm.name || null,
        latitude: storeForm.latitude ? parseFloat(storeForm.latitude) : null,
        longitude: storeForm.longitude ? parseFloat(storeForm.longitude) : null,
        address: storeForm.address || null,
      };

      let url = "http://127.0.0.1:8000/stores";
      let method = "POST";

      if (storeEditingId !== null) {
        url = `http://127.0.0.1:8000/stores/${storeEditingId}`;
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
          `Failed to ${storeEditingId !== null ? "update" : "create"} store`
        );
      }

      await fetchStores();

      setStoreForm({
        name: "",
        latitude: "",
        longitude: "",
        address: "",
      });
      setStoreEditingId(null);
    } catch (err) {
      setError(err.message || "Something went wrong while saving store");
    } finally {
      setStoreSubmitting(false);
    }
  };

  // =========================
  // PRODUCT FORM HANDLERS
  // =========================
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductEditClick = (product) => {
    setProductEditingId(product.id);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      unit: product.unit || "",
      size:
        product.size !== null && product.size !== undefined
          ? String(product.size)
          : "",
    });
  };

  const handleProductCancelEdit = () => {
    setProductEditingId(null);
    setProductForm({
      name: "",
      brand: "",
      category: "",
      unit: "",
      size: "",
    });
  };

  const handleProductDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Backend error:", text);
        throw new Error("Failed to delete product");
      }

      await fetchProducts();
    } catch (err) {
      setError(err.message || "Something went wrong while deleting product");
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductSubmitting(true);
    setError("");

    try {
      const payload = {
        name: productForm.name || null,
        brand: productForm.brand || null,
        category: productForm.category || null,
        unit: productForm.unit || null,
        size: productForm.size ? parseFloat(productForm.size) : null,
      };

      let url = "http://127.0.0.1:8000/products";
      let method = "POST";

      if (productEditingId !== null) {
        url = `http://127.0.0.1:8000/products/${productEditingId}`;
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
          `Failed to ${productEditingId !== null ? "update" : "create"} product`
        );
      }

      await fetchProducts();

      setProductForm({
        name: "",
        brand: "",
        category: "",
        unit: "",
        size: "",
      });
      setProductEditingId(null);
    } catch (err) {
      setError(err.message || "Something went wrong while saving product");
    } finally {
      setProductSubmitting(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <h1>Shopping Helper – Admin</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* ===== STORES SECTION ===== */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2>Stores</h2>

        {/* Store form */}
        <h3>{storeEditingId === null ? "Add Store" : "Edit Store"}</h3>
        <form onSubmit={handleStoreSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Name*:
              <br />
              <input
                name="name"
                type="text"
                value={storeForm.name}
                onChange={handleStoreChange}
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
                value={storeForm.address}
                onChange={handleStoreChange}
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
                  value={storeForm.latitude}
                  onChange={handleStoreChange}
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
                  value={storeForm.longitude}
                  onChange={handleStoreChange}
                  style={{ width: "100%", padding: "0.3rem" }}
                />
              </label>
            </div>
          </div>

          <button type="submit" disabled={storeSubmitting || !storeForm.name}>
            {storeSubmitting
              ? storeEditingId === null
                ? "Adding..."
                : "Saving..."
              : storeEditingId === null
              ? "Add Store"
              : "Save Changes"}
          </button>

          {storeEditingId !== null && (
            <button
              type="button"
              onClick={handleStoreCancelEdit}
              style={{ marginLeft: "0.5rem" }}
              disabled={storeSubmitting}
            >
              Cancel
            </button>
          )}
        </form>

        {/* Store list */}
        {storeLoading && <p>Loading stores...</p>}

        {!storeLoading && stores.length === 0 && (
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
                <button onClick={() => handleStoreEditClick(store)}>Edit</button>
                <button
                  onClick={() => handleStoreDelete(store.id)}
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
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <h2>Products</h2>

        {/* Product form */}
        <h3>{productEditingId === null ? "Add Product" : "Edit Product"}</h3>
        <form onSubmit={handleProductSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Name*:
              <br />
              <input
                name="name"
                type="text"
                value={productForm.name}
                onChange={handleProductChange}
                required
                style={{ width: "100%", padding: "0.3rem" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Brand:
              <br />
              <input
                name="brand"
                type="text"
                value={productForm.brand}
                onChange={handleProductChange}
                style={{ width: "100%", padding: "0.3rem" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Category:
              <br />
              <input
                name="category"
                type="text"
                value={productForm.category}
                onChange={handleProductChange}
                style={{ width: "100%", padding: "0.3rem" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label>
                Unit (e.g. L, g, item):
                <br />
                <input
                  name="unit"
                  type="text"
                  value={productForm.unit}
                  onChange={handleProductChange}
                  style={{ width: "100%", padding: "0.3rem" }}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Size:
                <br />
                <input
                  name="size"
                  type="number"
                  step="0.000001"
                  value={productForm.size}
                  onChange={handleProductChange}
                  style={{ width: "100%", padding: "0.3rem" }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={productSubmitting || !productForm.name}
          >
            {productSubmitting
              ? productEditingId === null
                ? "Adding..."
                : "Saving..."
              : productEditingId === null
              ? "Add Product"
              : "Save Changes"}
          </button>

          {productEditingId !== null && (
            <button
              type="button"
              onClick={handleProductCancelEdit}
              style={{ marginLeft: "0.5rem" }}
              disabled={productSubmitting}
            >
              Cancel
            </button>
          )}
        </form>

        {/* Product list */}
        {productLoading && <p>Loading products...</p>}

        {!productLoading && products.length === 0 && (
          <p>No products found yet. Add one using the form above.</p>
        )}

        <ul>
          {products.map((product) => (
            <li
              key={product.id}
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
                <strong>{product.name}</strong>
                <br />
                {product.brand && <span>Brand: {product.brand}</span>}
                <br />
                {product.category && <span>Category: {product.category}</span>}
                <br />
                {(product.unit || product.size) && (
                  <small>
                    {product.size !== null &&
                    product.size !== undefined &&
                    product.unit
                      ? `${product.size} ${product.unit}`
                      : product.size !== null && product.size !== undefined
                      ? product.size
                      : product.unit}
                  </small>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleProductEditClick(product)}>
                  Edit
                </button>
                <button
                  onClick={() => handleProductDelete(product.id)}
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
      </section>
    </div>
  );
}

export default App;
