
import { Check, X } from "lucide-react";
import { PasswordRequirement } from "./types";

interface PasswordRequirementsProps {
  password: string;
  requirements: PasswordRequirement[];
}

export const PasswordRequirements = ({ password, requirements }: PasswordRequirementsProps) => {
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {req.met ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <X className="w-3 h-3 text-gray-300" />
          )}
          <span className={req.met ? "text-green-600" : "text-gray-500"}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
};
