import { Button } from "@/components/ui/button";

type CardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  image?: string;
  buttonVariant?: "primary" | "secondary" | "tertiary" | "danger";
};

export function Card({
  title,
  description,
  buttonLabel,
  image,
  buttonVariant = "primary",
}: CardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-600 mt-2 mb-5 leading-6">
          {description}
        </p>

        <Button variant={buttonVariant}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}