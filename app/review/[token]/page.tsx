// app/review/[token]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [serviceType, setServiceType] = useState('');
  
  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const response = await fetch(`/api/review?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setReviewData(data.data);
          setName(data.data.userName || '');
        } else {
          setError(data.error || 'Invalid review link');
        }
      } catch (error) {
        setError('Failed to load review page');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchReviewData();
    }
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      setSubmitting(false);
      return;
    }
    
    if (!message.trim()) {
      setError('Please write your review');
      setSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name,
          message,
          rating,
          serviceType
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading review form...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center text-red-600 mb-4">
                <XCircle className="h-12 w-12" />
              </div>
              <CardTitle className="text-center">Unable to Load Review</CardTitle>
              <CardDescription className="text-center">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                This review link may have expired or is invalid.
              </p>
              <Button asChild>
                <a href="/">Return to Homepage</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center text-green-600 mb-4">
                <CheckCircle className="h-12 w-12" />
              </div>
              <CardTitle className="text-center">Thank You!</CardTitle>
              <CardDescription className="text-center">
                Your review has been submitted successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Thank you for sharing your experience with us. Your feedback is valuable and helps us improve our services.</p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <a href="/">Return to Homepage</a>
                </Button>
                <Button asChild>
                  <a href="/services">Book Another Service</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Share Your Experience</CardTitle>
              <CardDescription>
                How was your cleaning service? Your feedback helps us improve.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {reviewData && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{reviewData.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quote #{reviewData.quoteId.toString().padStart(6, '0')} • {reviewData.serviceDate}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">Thank you for choosing our service. We'd love to hear about your experience.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="space-y-3">
                  <Label>Overall Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-lg font-medium">
                      {rating}.0
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
                
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Type of Service</Label>
                  <Input
                    id="serviceType"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="e.g., Deep Cleaning, Move-in/Move-out"
                  />
                </div>
                
                {/* Review Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Your Review <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your experience. What did you like? What could we improve?"
                    rows={5}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Please be honest and specific. Your review will help others choose our services.
                  </p>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href="/">Cancel</a>
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    By submitting, you agree that your review may be displayed on our website.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Guidelines */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Review Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Be honest about your experience</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Focus on the service quality, punctuality, and professionalism</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Mention what you liked or what could be improved</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Reviews are moderated and may take 24-48 hours to appear</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}