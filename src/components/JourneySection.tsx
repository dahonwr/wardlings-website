import React from 'react';
import { motion } from 'motion/react';
import { Sprout, ShieldCheck, TreePine, Sun, Sparkles } from 'lucide-react';

interface JourneyStep {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  description: string;
}

export const JourneySection: React.FC = () => {
  const steps: JourneyStep[] = [
    {
      title: 'Seed',
      subtitle: 'Plant your Sanctuary Application',
      icon: <span className="text-xl">🌱</span>,
      badge: 'Stage I',
      description: 'Submit your Keeper application with your X handle and EVM wallet address to plant a seedling in the Sanctuary soil.'
    },
    {
      title: 'Sprout',
      subtitle: 'Earn the Wardlings\' Trust',
      icon: <Sprout className="w-6 h-6 text-[#7EBE69]" />,
      badge: 'Stage II',
      description: 'Engage with official Sanctuary lore, join the Discord woodland circle, and support community art pinned on X.'
    },
    {
      title: 'Keeper',
      subtitle: 'Selected for Sanctuary Access',
      icon: <ShieldCheck className="w-6 h-6 text-[#F7BFD5]" />,
      badge: 'Stage III',
      description: 'Chosen Keepers receive guaranteed mint allocation tokens to claim their Wardling partner during the Robinhood Chain mint.'
    },
    {
      title: 'Guardian',
      subtitle: 'Awaken Your Wardling Partner',
      icon: <TreePine className="w-6 h-6 text-[#7C5B46]" />,
      badge: 'Stage IV',
      description: 'Hatch and reveal your 1/1 or rare Wardling NFT, unlocking holder-only woodland gatherings, digital art files, and physical plushies.'
    },
    {
      title: 'Sanctuary',
      subtitle: 'Expand the Eternal Forest',
      icon: <Sun className="w-6 h-6 text-[#FDE047]" />,
      badge: 'Stage V',
      description: 'Participate in community story votes, co-create the Wardlings animated lore, and nourish the sanctuary ecosystem.'
    }
  ];

  return (
    <section id="journey" className="py-24 px-4 sm:px-6 bg-[#D9F5C2]/30 relative overflow-hidden border-t-3 border-b-3 border-[#2B2B2B]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] mb-3"
          >
            <Sparkles className="w-4 h-4 text-[#7EBE69]" />
            <span className="font-patrick font-bold text-sm text-[#7C5B46]">
              THE KEEPER ROADMAP
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-dynapuff font-bold text-3xl sm:text-5xl text-[#2B2B2B]"
          >
            The Keeper Journey
          </motion.h2>
          <p className="font-nunito font-semibold text-lg text-[#2B2B2B]/80 mt-2">
            Watch the magical vine grow as you take root in the Sanctuary.
          </p>
        </div>

        {/* Timeline Container with Growing Vine */}
        <div className="relative">
          {/* Animated Growing Vine Line (Center/Left) */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-[#7C5B46]/30 rounded-full overflow-hidden border-2 border-[#2B2B2B]">
            {/* Animate scaleY (compositor-only, GPU) instead of height
                (a layout property that forces reflow on every frame of the
                1.8s animation). Also switched to once:true — re-running
                this on every scroll pass in/out of view was doing a full
                reflow-animation each time, which is a real source of
                scroll jank on longer pages. */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top' }}
              className="w-full h-full bg-[#7EBE69]"
            />
          </div>

          {/* Journey Steps Stack */}
          <div className="space-y-12 relative z-10">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className={`flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } gap-6 relative`}
                >
                  {/* Step Card */}
                  <div className="w-full sm:w-[calc(50%-40px)] pl-14 sm:pl-0">
                    <div className="cozy-card p-6 bg-[#FFF9EF] relative hover:translate-y-[-4px] transition-transform">
                      <div className="tape-strip absolute -top-2 left-6 w-16 h-4 rotate-1" />
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-patrick font-bold text-sm px-3 py-1 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B] text-[#2B2B2B]">
                          {step.badge}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-[#DFF4FF] border-2 border-[#2B2B2B] flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>

                      <h3 className="font-dynapuff font-bold text-2xl text-[#2B2B2B]">
                        {step.title}
                      </h3>
                      <h4 className="font-baloo font-bold text-base text-[#7C5B46] mb-3">
                        {step.subtitle}
                      </h4>
                      <p className="font-nunito font-semibold text-sm text-[#2B2B2B]/85 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Vine Node Circle */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 top-6 w-12 h-12 rounded-full bg-[#FFF9EF] border-3 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] flex items-center justify-center z-20">
                    <motion.div
                      whileInView={{ scale: [0.7, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="w-6 h-6 rounded-full bg-[#7EBE69] flex items-center justify-center text-white text-xs font-bold"
                    >
                      ✓
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
