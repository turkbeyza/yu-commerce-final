export default function Overlay({ onClick }) {
  return <div onClick={onClick} className="fixed inset-0 bg-black/50 z-40" />;
}
