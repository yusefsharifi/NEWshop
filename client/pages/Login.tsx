import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isLoading } = useAuth();
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(username, password);
    
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError(language === 'fa' 
        ? 'نام کاربری یا رمز عبور اشتباه است'
        : 'Invalid username or password'
      );
    }
    setIsSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4" dir={dir}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full opacity-10 blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400 rounded-full opacity-10 blur-3xl"
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
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="w-8 h-8 bg-white rounded-full opacity-90"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'fa' ? 'خوش آمدید' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {language === 'fa' 
              ? 'لطفاً وارد حساب کاربری خود شوید'
              : 'Please sign in to your account'
            }
          </p>
        </motion.div>


        {/* Login Form */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {language === 'fa' ? 'ورود' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-center">
                {language === 'fa' 
                  ? 'اطلاعات خود را وارد کنید'
                  : 'Enter your credentials to continue'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      {language === 'fa' ? 'نام کاربری' : 'Username'}
                    </Label>
                    <div className="relative mt-2">
                      <User className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={language === 'fa' ? 'نام کاربری خود را وارد کنید' : 'Enter your username'}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} h-12 border-2 focus:border-blue-500 transition-all`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      {language === 'fa' ? 'رمز عبور' : 'Password'}
                    </Label>
                    <div className="relative mt-2">
                      <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === 'fa' ? 'رمز عبور خود را وارد کنید' : 'Enter your password'}
                        className={`${dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'} h-12 border-2 focus:border-blue-500 transition-all`}
                        required
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting || isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'fa' ? 'در حال ورود...' : 'Signing in...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{language === 'fa' ? 'ورود' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {language === 'fa' ? 'حساب کاربری ندارید؟' : "Don't have an account?"}{' '}
                  <Link 
                    to="/register" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {language === 'fa' ? 'ثبت نام' : 'Sign up'}
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
