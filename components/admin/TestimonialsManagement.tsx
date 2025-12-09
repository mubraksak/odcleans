// components/admin/TestimonialsManagement.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User, Calendar, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface Testimonial {
  id: number;
  client_name: string;
  quote: string;
  rating: number;
  service_type: string;
  review_date: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  quote_service_type?: string;
}

export function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    activeReviews: 0,
    inactiveReviews: 0,
    averageRating: "0.0"
  });

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setRefreshing(true);
      
      // Build query string based on filter
      let queryString = '';
      if (filter === 'active') {
        queryString = '?status=active';
      } else if (filter === 'inactive') {
        queryString = '?status=inactive';
      }
      
      const response = await fetch(`/api/admin/testimonials${queryString}`);
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data.testimonials || []);
        
        // Set statistics if available
        if (data.data.statistics) {
          setStats({
            totalReviews: data.data.statistics.totalReviews || 0,
            activeReviews: data.data.statistics.activeReviews || 0,
            inactiveReviews: data.data.statistics.inactiveReviews || 0,
            averageRating: data.data.statistics.averageRating || "0.0"
          });
        }
      } else {
        console.error('Error fetching testimonials:', data.error);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleTestimonial = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/testimonials/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state immediately for better UX
        setTestimonials(prev => prev.map(t => 
          t.id === id ? { ...t, is_active: !currentStatus } : t
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          activeReviews: currentStatus ? prev.activeReviews - 1 : prev.activeReviews + 1,
          inactiveReviews: currentStatus ? prev.inactiveReviews + 1 : prev.inactiveReviews - 1
        }));
      } else {
        console.error('Error toggling testimonial:', data.error);
        // Revert the local change if API call failed
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error toggling testimonial:', error);
      fetchTestimonials(); // Refresh data on error
    }
  };

  const handleRefresh = () => {
    fetchTestimonials();
  };

  if (loading && !refreshing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Testimonials</CardTitle>
          <CardDescription>Loading testimonials...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading testimonials...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Customer Testimonials</CardTitle>
            <CardDescription>
              {testimonials.length} testimonials • {stats.averageRating} average rating
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({stats.totalReviews})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({stats.activeReviews})
              </Button>
              <Button
                variant={filter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('inactive')}
              >
                Inactive ({stats.inactiveReviews})
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {refreshing ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Refreshing testimonials...</p>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Testimonials Found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'active' 
                ? 'No active testimonials found' 
                : filter === 'inactive' 
                ? 'No inactive testimonials found' 
                : 'No testimonials found yet'}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{testimonial.client_name}</h4>
                          {testimonial.user_email && (
                            <span className="text-xs text-muted-foreground truncate">
                              ({testimonial.user_email})
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{testimonial.rating}.0</span>
                          {(testimonial.service_type || testimonial.quote_service_type) && (
                            <Badge variant="outline" className="text-xs">
                              {testimonial.service_type || testimonial.quote_service_type || 'General'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{testimonial.quote}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(testimonial.review_date || testimonial.created_at).toLocaleDateString()}
                      </div>
                      <Badge 
                        variant={testimonial.is_active ? 'default' : 'secondary'} 
                        className="flex items-center gap-1"
                      >
                        {testimonial.is_active ? (
                          <>
                            <Eye className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                      <span>Order: {testimonial.display_order}</span>
                      <span>ID: #{testimonial.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Button
                      variant={testimonial.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleTestimonial(testimonial.id, testimonial.is_active)}
                      className="flex items-center gap-2"
                    >
                      {testimonial.is_active ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // View/edit modal can be added here
                        console.log('Edit testimonial:', testimonial.id);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Statistics Summary */}
        {testimonials.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-3">Quick Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeReviews}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactiveReviews}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}