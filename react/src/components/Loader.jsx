export default function Loader() {
  return (
    <section className="loader" aria-label="Cargando el clima">
      <span className="spinner spinner--lg" aria-hidden="true" />
      <p>Consultando el cielo…</p>
    </section>
  );
}
