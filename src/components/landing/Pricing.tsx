"use client";

import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "29",
    features: ["5 Social Accounts", "AI Post Generation", "Basic Analytics", "Standard Support"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "49",
    features: ["20 Social Accounts", "Advanced AI Studio", "Full Analytics History", "Team Collaboration", "Priority Support"],
    cta: "Get Started Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "99",
    features: ["Unlimited Accounts", "Custom AI Training", "API Access", "White-label Reports", "24/7 Dedicated Support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Pricing({ primaryColor, config }: { primaryColor: string, config: any }) {
  return (
    <section id="pricing" className="py-40 bg-white relative overflow-hidden">
      <div 
        style={{ backgroundColor: `${primaryColor}05` }}
        className="absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] -z-10" 
      />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
            {config?.pricingTitle || "Smarter"} <span style={{ color: primaryColor }}>Pricing</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`flex flex-col p-12 rounded-[48px] border transition-all duration-700 hover:-translate-y-2 relative opacity-0 animate-fade-in-up [animation-fill-mode:forwards] ${plan.highlight ? 'bg-slate-900 text-white scale-105 shadow-3xl z-10 border-transparent' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}
              style={{ animationDelay: `${(i + 2) * 200}ms` }}
            >
              {plan.highlight && (
                <div 
                  style={{ backgroundColor: primaryColor }}
                  className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-full"
                >
                  Recommended
                </div>
              )}
              
              <div className="mb-12">
                <h3 className={`text-3xl font-black mb-6 uppercase italic tracking-tighter ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
                  <span className="ml-3 text-xs font-black uppercase tracking-widest opacity-50">/month</span>
                </div>
              </div>

              <div className="flex-1 mb-16">
                <ul className="space-y-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center space-x-4 text-sm font-black tracking-tight uppercase italic opacity-80">
                      <div 
                        style={{ backgroundColor: plan.highlight ? primaryColor : `${primaryColor}20` }}
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      >
                         <Check className={`h-3 w-3 ${plan.highlight ? 'text-slate-950' : 'text-emerald-500'}`} style={{ color: plan.highlight ? '#000' : primaryColor }} strokeWidth={4} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                style={{ backgroundColor: plan.highlight ? primaryColor : 'transparent', borderColor: plan.highlight ? 'transparent' : primaryColor, color: plan.highlight ? '#000' : primaryColor }}
                className={`py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 border ${plan.highlight ? 'font-bold' : 'hover:bg-slate-50'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
