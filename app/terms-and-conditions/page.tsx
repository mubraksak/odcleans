import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="font-serif font-bold text-4xl text-primary mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card>
        <CardContent className="space-y-6 py-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By using Our Cleaning Service, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Services Description</h2>
            <p className="text-muted-foreground">
              We provide professional cleaning services for residential and commercial properties. Services include but are not limited to standard cleaning, deep cleaning, and specialized cleaning tasks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Booking and Payment</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>All bookings are subject to availability</li>
              <li>Payment is due upon completion of service unless otherwise arranged</li>
              <li>We accept major credit cards and electronic payments</li>
              <li>Prices are subject to change without notice</li>
              <li>Additional charges may apply for extra services or difficult conditions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cancellation and Rescheduling</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>24 hours notice required for cancellations without penalty</li>
              <li>Less than 24 hours notice may result in a 50% cancellation fee</li>
              <li>No-show appointments will be charged the full service amount</li>
              <li>We reserve the right to cancel or reschedule due to unforeseen circumstances</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Customer Responsibilities</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate information about your property and cleaning needs</li>
              <li>Ensure safe access to the property</li>
              <li>Secure pets during cleaning sessions</li>
              <li>Notify us of any special requirements or allergies</li>
              <li>Remove valuable items and breakables before cleaning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              While we take utmost care, we are not liable for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Damage to items not disclosed before cleaning</li>
              <li>Pre-existing damage or wear and tear</li>
              <li>Items not securely stored or protected</li>
              <li>Consequential or incidental damages</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Our maximum liability is limited to the cost of the cleaning service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Satisfaction Guarantee</h2>
            <p className="text-muted-foreground">
              We offer a 24-hour satisfaction guarantee. If you're not satisfied with any aspect of our service, contact us within 24 hours and we'll return to address your concerns at no additional cost.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Insurance</h2>
            <p className="text-muted-foreground">
              Our company maintains comprehensive liability insurance. All cleaners are bonded and insured for your protection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on our website and marketing materials, including logos, text, and graphics, are our intellectual property and may not be used without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of [Your State/Country]. Any disputes shall be resolved in the courts of [Your City/Region].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <div className="space-y-1 text-muted-foreground">
              <p>Our Cleaning Service</p>
              <p>Email: terms@cleaningservice.com</p>
              <p>Phone: (555) 123-TERMS</p>
              <p>Address: 123 Clean Street, City, State 12345</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}