import { Construction, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface PlaceholderPageProps {
  title: string;
  description: string;
  suggestedAction?: string;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  suggestedAction = "Continue exploring our site or contact us for assistance." 
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-600 mb-6">{description}</p>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{suggestedAction}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">
          This page is under construction. We're working hard to bring you the best pool equipment experience!
        </p>
      </div>
    </div>
  );
}
