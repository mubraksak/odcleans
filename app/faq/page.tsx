import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

export default function FAQPage() {
    const faqs = [
        {
            question: "How do I request a cleaning service quote?",
            answer: "You can request a quote by filling out our online form with details about your property, cleaning needs, and preferred schedule. We'll respond with a customized quote within 24 hours."
        },
        {
            question: "What types of cleaning services do you offer?",
            answer: "We offer standard cleaning, deep cleaning, post-construction cleaning, move-in/move-out cleaning, and specialized services like carpet cleaning, window washing, and appliance cleaning."
        },
        {
            question: "Are your cleaning products eco-friendly?",
            answer: "Yes, we use environmentally friendly cleaning products that are effective yet safe for your family, pets, and the environment. You can request specific products if you have preferences."
        },
        {
            question: "Do I need to be home during the cleaning?",
            answer: "No, you don't need to be present. Many of our clients provide us with keys or access codes. We ensure the security of your property and maintain strict confidentiality."
        },
        {
            question: "What's your cancellation policy?",
            answer: "You can cancel or reschedule up to 24 hours before your appointment without any charge. Cancellations within 24 hours may incur a 50% fee of the service cost."
        },
        {
            question: "Are your cleaners insured and background-checked?",
            answer: "Absolutely. All our cleaners undergo thorough background checks, are fully insured, and receive extensive training to ensure quality service and your peace of mind."
        },
        {
            question: "What if I'm not satisfied with the cleaning?",
            answer: "We offer a 24-hour satisfaction guarantee. If you're not happy with any aspect of the cleaning, contact us and we'll return to address your concerns at no additional cost."
        },
        {
            question: "How do I pay for the services?",
            answer: "We accept credit cards, debit cards, and online payments. Payment is due after the service is completed. Corporate accounts may qualify for invoicing options."
        },
        {
            question: "Do I need to provide cleaning supplies?",
            answer: "No, we bring all necessary equipment and supplies. However, if you prefer we use specific products you provide, we're happy to accommodate your request."
        },
        {
            question: "How often can I schedule cleaning services?",
            answer: "We offer one-time, weekly, bi-weekly, and monthly cleaning schedules. You can choose the frequency that best fits your needs and budget."
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-20 pb-16">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="text-center mb-8">
                        <h1 className="font-serif font-bold text-4xl text-primary mb-4">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground text-lg">Find answers to common questions about our cleaning services</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">General Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left font-semibold">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
                        <p className="text-muted-foreground mb-4">
                            Contact our customer support team for personalized assistance
                        </p>
                        <div className="space-y-2">
                            <p>📞 Phone:  (832) 616-6706</p>
                            <p>✉️ Email: info@odcleanservices.com</p>
                            <p>🕒 Hours: Monday-Friday, 8AM-6PM</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>

    )
}