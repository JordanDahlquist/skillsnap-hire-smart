
import { z } from "zod";
import { formSchema } from "./constants";

export type FormData = z.infer<typeof formSchema>;

export interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TabContentProps {
  form: any;
  [key: string]: any;
}
