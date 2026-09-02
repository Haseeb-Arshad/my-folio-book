type BuildingStatusProps = {
  label?: string;
  logo?: string;
};

/** A small live signal for projects that are still being built. */
export default function BuildingStatus({
  label = "Building",
  logo,
}: BuildingStatusProps) {
  return (
    <span className="building-status">
      {logo && (
        <span className="building-status__mark" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
      )}
      <span
        className="building-status__signal"
        role="status"
        aria-label={`${label}, currently in progress`}
      >
        <span className="building-status__bars" aria-hidden="true">
          <span className="building-status__bar" />
          <span className="building-status__bar" />
          <span className="building-status__bar" />
          <span className="building-status__bar" />
          <span className="building-status__bar" />
          <span className="building-status__bar" />
        </span>
        <span className="building-status__label">{label}</span>
      </span>
    </span>
  );
}
