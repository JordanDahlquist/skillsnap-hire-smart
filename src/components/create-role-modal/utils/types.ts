
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "./constants";

export type FormData = z.infer<typeof formSchema>;

export interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TabContentProps {
  form: UseFormReturn<FormData>;
  [key: string]: any;
}
