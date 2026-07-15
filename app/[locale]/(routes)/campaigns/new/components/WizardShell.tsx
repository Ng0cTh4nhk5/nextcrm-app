"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCampaign } from "@/actions/campaigns/create-campaign";
import { Step1Details } from "./Step1Details";
import { Step2Template } from "./Step2Template";
import { Step3Audience } from "./Step3Audience";

type Template = {
  id: string;
  name: string;
  subject_default: string | null;
  content_html: string;
};

type TargetList = {
  id: string;
  name: string;
  _count: { targets: number };
};

type FormData = {
  name?: string;
  description?: string;
  from_name?: string;
  reply_to?: string;
  template_id?: string;
  content_html?: string;
  content_json?: object;
  subject?: string;
  target_list_ids?: string[];
};

export function WizardShell({
  templates,
  targetLists,
}: {
  templates: Template[];
  targetLists: TargetList[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (data: Partial<FormData>) => {
    const merged = { ...formData, ...data };
    setIsSubmitting(true);
    try {
      const campaign = await createCampaign({
        name: merged.name!,
        description: merged.description,
        from_name: merged.from_name,
        reply_to: merged.reply_to,
        template_id: merged.template_id,
        target_list_ids: merged.target_list_ids ?? [],
        steps: [
          {
            order: 0,
            template_id: merged.template_id!,
            subject: merged.subject!,
            delay_days: 0,
            send_to: "all" as const,
          },
        ],
      });

      if ("error" in campaign) {
        toast.error(String(campaign.error));
        return;
      }

      toast.success("Campaign created as draft");
      router.push("/campaigns");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Details", "Template", "Audience"];

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex gap-2 items-center">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                step === i + 1
                  ? "bg-primary text-primary-foreground"
                  : step > i + 1
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                step === i + 1 ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-muted-foreground mx-1">—</span>
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && (
        <Step1Details initialData={formData} onNext={handleNext} />
      )}
      {step === 2 && (
        <Step2Template
          initialData={formData}
          templates={templates}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 3 && (
        <Step3Audience
          initialData={formData}
          targetLists={targetLists}
          onNext={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
