"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  iban: z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, "Invalid IBAN format"),
});

type FormData = z.infer<typeof schema>;

interface AccountFormProps {
  onSuccess: () => void;
}

export function AccountForm({ onSuccess }: AccountFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      iban: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      toast({
        title: "Success",
        description: "Account created successfully",
      });
      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <div className="space-y-2">
                <FormLabel>IBAN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., GB29NWBK60161331926819"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
