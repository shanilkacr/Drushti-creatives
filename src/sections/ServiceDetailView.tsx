"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Link from "next/link";
import { SERVICES_DATA } from "@/data/serviceDetails";
import OurWork, { type WorkItem } from "@/sections/OurWork";
import OurProcess from "@/sections/OurProcess";

export default function ServiceDetailView({
    id,
    workItems,
}: {
    id: string;
    workItems: WorkItem[];
}) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const details = SERVICES_DATA[id];

    if (!details) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-ink">
                <h1 className="text-2xl font-bold mb-4">Service not found</h1>
                <Link href="/">
                    <Button variant="primary">Go Back Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-cream text-ink pb-20 md:pb-28">
            <OurWork
                serviceId={id}
                items={workItems}
                header={
                    <div className="mb-12 max-w-3xl text-center mx-auto flex flex-col items-center sm:mb-[10vh]">
                        <h1 className={`font-heading text-[clamp(2.25rem,4.5vw,3.5rem)] font-normal leading-[1.08] tracking-tight ${details.titleColorClass}`}>
                            {details.title}
                        </h1>
                        <p className="mt-4 text-ink/70 text-base md:text-lg leading-relaxed max-w-2xl">
                            {details.description}
                        </p>
                    </div>
                }
            />

            {/* Our Focus Section */}
            <section className="bg-green py-16 text-white md:py-24">
                <Container>
                    <div className="flex flex-col gap-10 md:gap-12">
                        <div className="max-w-2xl">
                            <h2 className="font-heading text-3xl md:text-4xl font-normal tracking-tight">Our Focus</h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
                                Key values and strategic benefits we deliver under this service stream.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {details.focus.map((item, index) => {
                                const [title, description] = item.split(": ");
                                return (
                                    <div
                                        key={index}
                                        className="rounded-3xl border border-white/20 bg-white/10 p-8"
                                    >
                                        <h3 className="mb-2 font-heading text-lg font-semibold text-white">{title}</h3>
                                        <p className="text-sm leading-relaxed text-white/80">{description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Container>
            </section>

            <OurProcess steps={details.process} />

            {/* FAQ Section */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
                        <div>
                            <h2 className="font-heading text-3xl md:text-4xl font-normal tracking-tight">Frequently Asked Questions</h2>
                            <p className="mt-4 text-ink/65 text-sm md:text-base leading-relaxed">
                                Quick answers to common queries about this service stream.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {details.faqs.map((faq, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div key={index} className="bg-white rounded-3xl border border-ink/5 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : index)}
                                            className="w-full text-left px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-4 focus:outline-none"
                                        >
                                            <span className="font-heading font-medium text-base sm:text-lg text-ink">
                                                {faq.question}
                                            </span>
                                            <span className={`text-xl transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                                                +
                                            </span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 text-ink/70 text-sm md:text-base leading-relaxed border-t border-ink/5 pt-4">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Container>
            </section>


        </main>
    );
}
