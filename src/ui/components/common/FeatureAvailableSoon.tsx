
import { Clock, Sparkles, Rocket, Bell, ArrowLeft } from 'lucide-react';

const FeatureAvailableSoon = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-background relative">
      <button
        onClick={handleGoBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground rounded-lg transition-colors group"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Icon Container */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative">
            <Clock className="w-16 h-16 text-primary" strokeWidth={1.5} />
            
            {/* Floating Icons */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Feature Coming Soon
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-muted-foreground mb-8">
          We're working hard to bring you this exciting new feature. 
          Stay tuned for updates!
        </p>

        {/* Description */}
        <div className="bg-muted rounded-lg p-6 mb-8">
          <p className="text-sm text-foreground leading-relaxed">
            This feature is currently under development and will be available in an upcoming release. 
            We're committed to delivering the best possible experience, and we appreciate your patience.
          </p>
        </div>

        {/* Notification Card */}
        <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg px-6 py-3">
          <Bell className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground font-medium">
            You'll be notified when this feature launches
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Development in progress
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default FeatureAvailableSoon;