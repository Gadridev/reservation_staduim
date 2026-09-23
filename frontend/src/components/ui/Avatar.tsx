interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function getInitial(name: string) {
  return name?.trim().charAt(0).toUpperCase();
}

export function Avatar({ name, size = "md", online }: AvatarProps) {

  return (
    <span className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full bg-turf font-bold text-chalk ${sizeClasses[size]}`}>
      {getInitial(name)}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-chalk ${
            online ? "bg-turf-light" : "bg-ink-soft/40"
          }`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
