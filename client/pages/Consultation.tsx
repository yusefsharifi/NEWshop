import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Star, Video, Phone, MessageCircle, 
  CheckCircle, XCircle, DollarSign, Award, Users, Briefcase,
  ChevronLeft, ChevronRight, Plus, Mail, MapPin, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrencyIRR } from '@/lib/utils';

interface Expert {
  id: number;
  name: string;
  title_en: string;
  title_fa: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  reviews_count: number;
  avatar: string;
  bio_en: string;
  bio_fa: string;
  hourly_rate: number;
  languages: string[];
  availability: {
    [key: string]: string[]; // day: available hours
  };
  consultation_types: Array<{
    type: 'video' | 'phone' | 'chat' | 'onsite';
    available: boolean;
    price_modifier: number;
  }>;
  certifications: string[];
  response_time: number; // in hours
  total_consultations: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

interface ConsultationRequest {
  expert_id: number;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'chat' | 'onsite';
  duration: number;
  topic: string;
  description: string;
  customer_info: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  budget: number;
}

export default function Consultation() {
  const { language, dir } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'chat' | 'onsite'>('video');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ConsultationRequest>>({
    duration: 60,
    type: 'video'
  });

  // Mock experts data
  const mockExperts: Expert[] = [
    {
      id: 1,
      name: "دکتر احمد محمدی",
      title_en: "Senior Pool Engineering Consultant",
      title_fa: "مشاور ارشد مهندسی استخر",
      specialties: ["Pool Design", "Water Chemistry", "Equipment Selection"],
      experience_years: 15,
      rating: 4.9,
      reviews_count: 127,
      avatar: "/placeholder.svg",
      bio_en: "Expert in pool design and water chemistry with 15+ years experience",
      bio_fa: "متخصص طراحی استخر و شیمی آب با بیش از ۱۵ سال تجربه",
      hourly_rate: 500000,
      languages: ["Persian", "English"],
      availability: {
        "2024-01-20": ["09:00", "10:00", "14:00", "15:00"],
        "2024-01-21": ["09:00", "11:00", "16:00"],
        "2024-01-22": ["10:00", "14:00", "15:00", "16:00"]
      },
      consultation_types: [
        { type: 'video', available: true, price_modifier: 1.0 },
        { type: 'phone', available: true, price_modifier: 0.8 },
        { type: 'chat', available: true, price_modifier: 0.6 },
        { type: 'onsite', available: true, price_modifier: 2.0 }
      ],
      certifications: ["Pool Engineering License", "Water Treatment Specialist"],
      response_time: 2,
      total_consultations: 450
    },
    {
      id: 2,
      name: "مهندس سارا کریمی",
      title_en: "Pool Maintenance Specialist",
      title_fa: "متخصص نگهداری استخر",
      specialties: ["Maintenance", "Troubleshooting", "Equipment Repair"],
      experience_years: 8,
      rating: 4.7,
      reviews_count: 89,
      avatar: "/placeholder.svg",
      bio_en: "Specialized in pool maintenance and equipment troubleshooting",
      bio_fa: "متخصص نگهداری استخر و عیب‌یابی تجهیزات",
      hourly_rate: 350000,
      languages: ["Persian"],
      availability: {
        "2024-01-20": ["08:00", "09:00", "13:00", "17:00"],
        "2024-01-21": ["08:00", "10:00", "15:00", "17:00"],
        "2024-01-22": ["09:00", "13:00", "14:00"]
      },
      consultation_types: [
        { type: 'video', available: true, price_modifier: 1.0 },
        { type: 'phone', available: true, price_modifier: 0.8 },
        { type: 'chat', available: true, price_modifier: 0.6 },
        { type: 'onsite', available: true, price_modifier: 1.8 }
      ],
      certifications: ["Pool Maintenance Certification"],
      response_time: 4,
      total_consultations: 280
    },
    {
      id: 3,
      name: "علی رضایی",
      title_en: "Pool Construction Advisor",
      title_fa: "مشاور ساخت استخر",
      specialties: ["Construction", "Project Management", "Cost Estimation"],
      experience_years: 12,
      rating: 4.8,
      reviews_count: 156,
      avatar: "/placeholder.svg",
      bio_en: "Construction and project management expert for pool projects",
      bio_fa: "متخصص ساخت و مدیریت پروژه‌های استخر",
      hourly_rate: 450000,
      languages: ["Persian", "English"],
      availability: {
        "2024-01-20": ["10:00", "11:00", "16:00"],
        "2024-01-21": ["09:00", "14:00", "15:00"],
        "2024-01-22": ["11:00", "15:00", "16:00", "17:00"]
      },
      consultation_types: [
        { type: 'video', available: true, price_modifier: 1.0 },
        { type: 'phone', available: true, price_modifier: 0.8 },
        { type: 'chat', available: false, price_modifier: 0 },
        { type: 'onsite', available: true, price_modifier: 2.2 }
      ],
      certifications: ["Construction Management", "Pool Design Certificate"],
      response_time: 3,
      total_consultations: 320
    }
  ];

  useEffect(() => {
    setExperts(mockExperts);
  }, []);

  const formatPrice = (price: number) => formatCurrencyIRR(price);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US').format(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'chat': return MessageCircle;
      case 'onsite': return MapPin;
      default: return Video;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    const labels = {
      fa: {
        video: 'ویدیو کال',
        phone: 'تماس تلفنی',
        chat: 'چ�� آنلاین',
        onsite: 'حضوری'
      },
      en: {
        video: 'Video Call',
        phone: 'Phone Call',
        chat: 'Online Chat',
        onsite: 'On-site Visit'
      }
    };
    return labels[language][type as keyof typeof labels.fa] || type;
  };

  const getAvailableTimeSlots = (expert: Expert, date: Date): TimeSlot[] => {
    const dateStr = date.toISOString().split('T')[0];
    const availableTimes = expert.availability[dateStr] || [];
    
    return availableTimes.map(time => ({
      time,
      available: true,
      price: expert.hourly_rate * (expert.consultation_types.find(ct => ct.type === consultationType)?.price_modifier || 1)
    }));
  };

  const handleBookConsultation = () => {
    if (!selectedExpert || !selectedTimeSlot) return;
    
    setFormData({
      ...formData,
      expert_id: selectedExpert.id,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTimeSlot,
      type: consultationType
    });
    
    setIsBookingModalOpen(true);
  };

  const ExpertCard = ({ expert }: { expert: Expert }) => {
    const title = language === 'fa' ? expert.title_fa : expert.title_en;
    const bio = language === 'fa' ? expert.bio_fa : expert.bio_en;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300"
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={expert.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                {expert.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
              <p className="text-gray-600 font-medium">{title}</p>
              <div className="flex items-center space-x-2 mt-2">
                {renderStars(expert.rating)}
                <span className="text-sm text-gray-600">
                  {expert.rating} ({expert.reviews_count} {language === 'fa' ? 'نظر' : 'reviews'})
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(expert.hourly_rate)}
              </div>
              <p className="text-sm text-gray-500">
                {language === 'fa' ? 'در ساعت' : 'per hour'}
              </p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm">{bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{expert.experience_years}</div>
              <p className="text-xs text-gray-600">
                {language === 'fa' ? 'سال تجربه' : 'Years Exp.'}
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{expert.total_consultations}</div>
              <p className="text-xs text-gray-600">
                {language === 'fa' ? 'مشاوره' : 'Consultations'}
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{expert.response_time}h</div>
              <p className="text-xs text-gray-600">
                {language === 'fa' ? 'پاسخ‌گویی' : 'Response'}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {language === 'fa' ? 'تخصص‌ها:' : 'Specialties:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {expert.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Consultation Types */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {language === 'fa' ? 'نوع مشاوره:' : 'Consultation Types:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {expert.consultation_types.filter(ct => ct.available).map((ct) => {
                const Icon = getConsultationTypeIcon(ct.type);
                return (
                  <div
                    key={ct.type}
                    className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg text-xs"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{getConsultationTypeLabel(ct.type)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certifications */}
          {expert.certifications.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {language === 'fa' ? 'گواهینامه‌ها:' : 'Certifications:'}
              </p>
              <div className="space-y-1">
                {expert.certifications.map((cert) => (
                  <div key={cert} className="flex items-center space-x-1 text-xs text-gray-600">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button 
              className="flex-1"
              onClick={() => setSelectedExpert(expert)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {language === 'fa' ? 'رزرو مشاوره' : 'Book Consultation'}
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const BookingModal = () => (
    <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'fa' ? 'رزرو مشاوره' : 'Book Consultation'}
          </DialogTitle>
          <DialogDescription>
            {language === 'fa' 
              ? 'اطلاعات مورد نیاز برای رزرو مشاوره را تکمیل کنید'
              : 'Complete the required information to book your consultation'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'fa' ? 'انتخاب زمان و نوع مشاوره' : 'Select Time & Type'}
              </h3>
              
              {/* Consultation Type */}
              <div>
                <Label>{language === 'fa' ? 'نوع مشاوره' : 'Consultation Type'}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {selectedExpert?.consultation_types.filter(ct => ct.available).map((ct) => {
                    const Icon = getConsultationTypeIcon(ct.type);
                    return (
                      <Button
                        key={ct.type}
                        variant={consultationType === ct.type ? 'default' : 'outline'}
                        onClick={() => setConsultationType(ct.type)}
                        className="flex items-center space-x-2 h-12"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{getConsultationTypeLabel(ct.type)}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label>{language === 'fa' ? 'مدت زمان' : 'Duration'}</Label>
                <Select 
                  value={formData.duration?.toString()} 
                  onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 {language === 'fa' ? 'دقیقه' : 'minutes'}</SelectItem>
                    <SelectItem value="60">60 {language === 'fa' ? 'دقیقه' : 'minutes'}</SelectItem>
                    <SelectItem value="90">90 {language === 'fa' ? 'دقیقه' : 'minutes'}</SelectItem>
                    <SelectItem value="120">120 {language === 'fa' ? 'دقیقه' : 'minutes'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slots */}
              <div>
                <Label>{language === 'fa' ? 'ساعت موجود' : 'Available Times'}</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {getAvailableTimeSlots(selectedExpert!, selectedDate).map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className="text-sm"
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'fa' ? 'جزئیات مشاوره' : 'Consultation Details'}
              </h3>
              
              <div>
                <Label htmlFor="topic">{language === 'fa' ? 'موضوع مشاوره' : 'Consultation Topic'}</Label>
                <Input
                  id="topic"
                  value={formData.topic || ''}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder={language === 'fa' ? 'مثال: طراحی استخر خانگی' : 'e.g., Home pool design'}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">{language === 'fa' ? 'توضیحات تکمیلی' : 'Additional Details'}</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={language === 'fa' 
                    ? 'لطفاً جزئیات بیشتری درباره نیاز خود بنویسید...'
                    : 'Please provide more details about your requirements...'
                  }
                  className="mt-2 min-h-24"
                />
              </div>

              <div>
                <Label>{language === 'fa' ? 'بودجه تخمینی' : 'Estimated Budget'}</Label>
                <Select 
                  value={formData.budget?.toString()} 
                  onValueChange={(value) => setFormData({...formData, budget: parseInt(value)})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={language === 'fa' ? 'انتخاب بودجه' : 'Select budget'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000000">کمتر از ۱ میلیون</SelectItem>
                    <SelectItem value="5000000">۱-۵ میلیون</SelectItem>
                    <SelectItem value="10000000">۵-۱۰ میلیون</SelectItem>
                    <SelectItem value="20000000">۱۰-۲۰ میلیون</SelectItem>
                    <SelectItem value="50000000">بیش از ۲۰ میلیون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'fa' ? 'اطلاعات تماس' : 'Contact Information'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{language === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}</Label>
                  <Input
                    id="name"
                    value={formData.customer_info?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      customer_info: {...formData.customer_info, name: e.target.value}
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">{language === 'fa' ? 'ایمیل' : 'Email'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.customer_info?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      customer_info: {...formData.customer_info, email: e.target.value}
                    })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">{language === 'fa' ? 'شماره تماس' : 'Phone Number'}</Label>
                <Input
                  id="phone"
                  value={formData.customer_info?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    customer_info: {...formData.customer_info, phone: e.target.value}
                  })}
                  className="mt-2"
                />
              </div>

              {consultationType === 'onsite' && (
                <div>
                  <Label htmlFor="address">{language === 'fa' ? 'آدرس' : 'Address'}</Label>
                  <Textarea
                    id="address"
                    value={formData.customer_info?.address || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      customer_info: {...formData.customer_info, address: e.target.value}
                    })}
                    placeholder={language === 'fa' ? 'آدرس کامل محل بازدید' : 'Complete address for site visit'}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{language === 'fa' ? 'خلاصه رزرو' : 'Booking Summary'}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{language === 'fa' ? 'متخصص:' : 'Expert:'}</span>
                    <span>{selectedExpert?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'fa' ? 'تاریخ:' : 'Date:'}</span>
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'fa' ? 'زما��:' : 'Time:'}</span>
                    <span>{selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'fa' ? 'مدت:' : 'Duration:'}</span>
                    <span>{formData.duration} {language === 'fa' ? 'دقیقه' : 'minutes'}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{language === 'fa' ? 'هزینه:' : 'Cost:'}</span>
                    <span>{formatPrice((selectedExpert?.hourly_rate || 0) * (formData.duration || 60) / 60)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {language === 'fa' ? 'قبلی' : 'Previous'}
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                {language === 'fa' ? 'بعدی' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'تأیید رزرو' : 'Confirm Booking'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'fa' ? 'مشاوره آنلاین' : 'Online Consultation'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'fa' 
              ? 'با متخصصان مجرب استخر مشورت کنید و بهترین راه‌حل را پیدا کنید'
              : 'Consult with experienced pool experts and find the best solutions'
            }
          </p>
        </div>

        {/* How it Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {language === 'fa' ? 'چگونه کار می‌کند؟' : 'How it Works?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title_fa: 'انتخاب متخصص',
                  title_en: 'Choose Expert',
                  desc_fa: 'از میان متخصصان مجرب انتخاب کنید',
                  desc_en: 'Select from experienced experts',
                  icon: Users
                },
                {
                  step: 2,
                  title_fa: 'رزرو زمان',
                  title_en: 'Book Time',
                  desc_fa: 'زمان مناسب خود را انتخاب کنید',
                  desc_en: 'Choose your preferred time',
                  icon: Calendar
                },
                {
                  step: 3,
                  title_fa: 'پرداخت',
                  title_en: 'Payment',
                  desc_fa: 'پرداخت آنلاین و ایمن',
                  desc_en: 'Secure online payment',
                  icon: DollarSign
                },
                {
                  step: 4,
                  title_fa: 'مشاوره',
                  title_en: 'Consultation',
                  desc_fa: 'شروع مشاوره در زمان تعیین شده',
                  desc_en: 'Start consultation at scheduled time',
                  icon: Video
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {language === 'fa' ? item.title_fa : item.title_en}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'fa' ? item.desc_fa : item.desc_en}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedExpert ? (
          /* Expert Selected - Show Calendar */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedExpert.avatar} />
                      <AvatarFallback>{selectedExpert.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedExpert.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {language === 'fa' ? selectedExpert.title_fa : selectedExpert.title_en}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedExpert(null)}>
                  {language === 'fa' ? 'تغییر متخصص' : 'Change Expert'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar would go here - simplified for demo */}
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'fa' ? 'انتخاب تاریخ و زمان' : 'Select Date & Time'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'fa' 
                      ? 'برای مشاهده زمان‌های موجود، روی دکمه زیر کلیک کنید'
                      : 'Click the button below to see available times'
                    }
                  </p>
                  <Button onClick={handleBookConsultation}>
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'رزرو مشاوره' : 'Book Consultation'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Expert List */
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'fa' ? 'متخصصان ما' : 'Our Experts'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </div>
        )}

        <BookingModal />
      </div>
    </div>
  );
}
