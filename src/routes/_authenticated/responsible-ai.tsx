import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, AlertTriangle, Eye, Lock, UserCheck, Sparkles, Scale, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/responsible-ai")({ component: ResponsibleAi });

const sections = [
  { icon: AlertTriangle, title: "AI limitations", body: "AI models can produce plausible-sounding but incorrect content. Always verify facts, numbers, and citations before relying on AI output in professional or high-stakes work." },
  { icon: Scale, title: "Bias", body: "Training data can encode social, cultural, and gender biases. We strive to mitigate this through careful prompt design, but you should review outputs critically — especially in hiring, evaluation, and decision-making contexts." },
  { icon: Sparkles, title: "Hallucinations", body: "Generative models occasionally invent facts, sources, or quotations. When the model is uncertain we lower the displayed confidence score, but the safest workflow is human verification." },
  { icon: Lock, title: "Privacy", body: "Your prompts and outputs are stored against your authenticated account and protected by row-level security. Do not paste personally identifiable information (PII), client secrets, or regulated data into AI tools." },
  { icon: ShieldCheck, title: "Security", body: "We use Supabase authentication, encrypted transport (HTTPS), and per-user database isolation. API keys are stored in server-side environment secrets and never exposed to the browser." },
  { icon: UserCheck, title: "Human verification", body: "WorkFlow AI Pro is an assistant — not an authority. A human professional should always review, edit, and approve AI-generated content before it is sent, published, or acted on." },
  { icon: Eye, title: "Transparency", body: "Every AI response surfaces a confidence score and a clear disclaimer. Output formatting is structured (summary, key points, action items) so you can quickly judge quality." },
  { icon: BookOpen, title: "Responsible use", body: "Do not use AI to generate misleading content, impersonate others, or bypass professional duty. Follow your organization's AI usage policy and applicable laws (e.g. GDPR, the EU AI Act)." },
];

function ResponsibleAi() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Responsible AI</h1>
          <p className="text-sm text-muted-foreground">How we build, secure, and govern AI in WorkFlow AI Pro.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant"><ShieldCheck className="size-6" /></div>
      </div>

      <Card className="border-primary/30 bg-gradient-primary/5 p-6">
        <p className="text-sm">
          <strong>Our commitment:</strong> WorkFlow AI Pro applies AI to augment — not replace — professional judgment.
          We design for transparency, safety, and human oversight, following the OECD AI Principles and the
          EU AI Act's risk-based framework.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} className="bg-gradient-card p-5">
            <div className="mb-2 grid size-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
              <s.icon className="size-5" />
            </div>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30 p-6 text-sm text-muted-foreground">
        AI-generated content may contain inaccuracies. Always verify important information before professional use.
        If you discover harmful or biased output, please contact your administrator so we can improve the system.
      </Card>
    </div>
  );
}
