import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register } = useAuth();
  const { language, dir } = useLanguage();
  const navigate = useNavigate();

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      calculatePasswordStrength(value as string);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      return language === 'fa' ? 'نام کاربر�� الزامی است' : 'Username is required';
    }
    if (!formData.email.trim()) {
      return language === 'fa' ? 'ایمیل الزامی است' : 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return language === 'fa' ? 'فرمت ایمیل صحیح نیست' : 'Invalid email format';
    }
    if (formData.password.length < 6) {
      return language === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return language === 'fa' ? 'تکرار رمز عبور مطابقت ندارد' : 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      return language === 'fa' ? 'باید قوانین و مقررات را بپذیرید' : 'You must agree to terms and conditions';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await register(formData);
      
      if (success) {
        navigate('/login', { 
          state: { 
            message: language === 'fa' 
              ? 'ثبت نام با موفقیت انجام شد. لطفاً وارد شوید'
              : 'Registration successful. Please log in'
          }
        });
      } else {
        setError(language === 'fa' 
          ? 'خطا در ثبت نام. لطفاً دوباره تلاش کنید'
          : 'Registration failed. Please try again'
        );
      }
    } catch (error) {
      setError(language === 'fa' 
        ? 'خطا در اتصال به سرور'
        : 'Server connection error'
      );
    }
    
    setIsSubmitting(false);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-emerald-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    const texts = {
      fa: ['بسیار ضعیف', 'ضعیف', 'متوسط', 'قوی', 'بسیار قوی'],
      en: ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
    };
    return texts[language][passwordStrength - 1] || texts[language][0];
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4" dir={dir}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-400 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'fa' ? 'ایجاد حساب کاربری' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {language === 'fa' 
              ? 'برای دسترسی به تمام امکانات ثبت نام کنید'
              : 'Sign up to access all features'
            }
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {language === 'fa' ? 'ثبت نام' : 'Sign Up'}
              </CardTitle>
              <CardDescription className="text-center">
                {language === 'fa' 
                  ? 'اطلاعات خود را وارد کنید'
                  : 'Fill in your information below'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      {language === 'fa' ? 'نام' : 'First Name'}
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder={language === 'fa' ? 'نام' : 'First name'}
                      className="mt-1 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      {language === 'fa' ? 'نام خانوادگی' : 'Last Name'}
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder={language === 'fa' ? 'نام خانوادگی' : 'Last name'}
                      className="mt-1 h-10"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    {language === 'fa' ? 'نام کاربری' : 'Username'} *
                  </Label>
                  <div className="relative mt-1">
                    <User className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => updateFormData('username', e.target.value)}
                      placeholder={language === 'fa' ? 'نام کاربری خود را وارد کنید' : 'Choose a username'}
                      className={`${dir === 'rtl' ? 'pr-9' : 'pl-9'} h-10`}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {language === 'fa' ? 'ایمیل' : 'Email'} *
                  </Label>
                  <div className="relative mt-1">
                    <Mail className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder={language === 'fa' ? 'ایمیل خود را وارد کنید' : 'Enter your email'}
                      className={`${dir === 'rtl' ? 'pr-9' : 'pl-9'} h-10`}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    {language === 'fa' ? 'شماره تماس' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder={language === 'fa' ? 'شماره تماس' : 'Phone number'}
                    className="mt-1 h-10"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {language === 'fa' ? 'رمز عبور' : 'Password'} *
                  </Label>
                  <div className="relative mt-1">
                    <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      placeholder={language === 'fa' ? 'رمز عبور انتخاب کنید' : 'Create a password'}
                      className={`${dir === 'rtl' ? 'pr-9 pl-9' : 'pl-9 pr-9'} h-10`}
                      required
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {language === 'fa' ? 'تکرار رمز عبور' : 'Confirm Password'} *
                  </Label>
                  <div className="relative mt-1">
                    <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      placeholder={language === 'fa' ? 'رمز عبور را دوباره وارد کنید' : 'Confirm your password'}
                      className={`${dir === 'rtl' ? 'pr-9 pl-9' : 'pl-9 pr-9'} h-10`}
                      required
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">
                      {language === 'fa' ? 'رمز عبور مطابقت ندارد' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateFormData('agreeToTerms', checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                      {language === 'fa' ? (
                        <>
                          با <Link to="/terms" className="text-emerald-600 hover:underline">قوانین و مقررات</Link> و{' '}
                          <Link to="/privacy" className="text-emerald-600 hover:underline">سیاست حفظ حریم خصوصی</Link> موافقم
                        </>
                      ) : (
                        <>
                          I agree to the <Link to="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and{' '}
                          <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
                        </>
                      )}
                    </Label>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'fa' ? 'در حال ثبت نام...' : 'Creating account...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{language === 'fa' ? 'ثبت نام' : 'Create Account'}</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {language === 'fa' ? 'قبلاً ثبت نام کرده‌اید؟' : 'Already have an account?'}{' '}
                  <Link 
                    to="/login" 
                    className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    {language === 'fa' ? 'وارد شوید' : 'Sign in'}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <motion.div variants={itemVariants} className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'ml-1 rotate-180' : 'mr-1'}`} />
            {language === 'fa' ? 'بازگشت به صفحه اصلی' : 'Back to homepage'}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
