
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface AuthHeaderProps {
  showForgotPassword: boolean;
}

export const AuthHeader = ({ showForgotPassword }: AuthHeaderProps) => {
  return (
    <>
      {/* Simple Header - Always White */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" 
                  alt="Atract"
                  className="w-6 h-6"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Atract</span>
            </Link>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Card Header */}
      <CardHeader className="text-center bg-white">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-900">
          <Mail className="w-6 h-6 text-[#007af6]" />
          {showForgotPassword ? "Reset Password" : "Welcome to Atract"}
        </CardTitle>
      </CardHeader>
    </>
  );
};
