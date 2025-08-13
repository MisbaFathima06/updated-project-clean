import { CheckCircle, Clock, Eye, Cog, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusTrackerProps {
  status: string;
  referenceId?: string;
  className?: string;
}

const statusSteps = [
  {
    key: 'pending',
    label: 'Received',
    description: 'Complaint received and encrypted',
    icon: CheckCircle,
  },
  {
    key: 'review',
    label: 'Under Review',
    description: 'NGO team reviewing case',
    icon: Eye,
  },
  {
    key: 'progress', 
    label: 'In Progress',
    description: 'Action being taken',
    icon: Cog,
  },
  {
    key: 'resolved',
    label: 'Resolved',
    description: 'Case closed successfully', 
    icon: Trophy,
  }
];

export function StatusTracker({ status, className = "" }: StatusTrackerProps) {
  const currentStepIndex = statusSteps.findIndex(step => step.key === status);
  const isCompleted = currentStepIndex >= 0;

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-500',
          icon: 'text-white'
        };
      case 'current':
        return {
          bg: 'bg-blue-500 animate-pulse',
          text: 'text-blue-600 dark:text-blue-400', 
          border: 'border-blue-500',
          icon: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-300 dark:bg-gray-600',
          text: 'text-gray-400 dark:text-gray-500',
          border: 'border-gray-300 dark:border-gray-600',
          icon: 'text-gray-500 dark:text-gray-400'
        };
    }
  };

  if (!isCompleted) {
    return (
      <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            Status information not available
          </span>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Please check your reference ID and try again
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Complaint Progress
      </h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div 
          className="absolute top-6 left-6 h-0.5 bg-blue-500 transition-all duration-500"
          style={{ 
            width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%' 
          }}
        ></div>
        
        {/* Status Steps */}
        <div className="flex justify-between relative">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const colors = getStepColor(stepStatus);
            const StepIcon = step.icon;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Step Circle */}
                <div 
                  className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border} mb-3 transition-all duration-300 z-10 relative`}
                >
                  <StepIcon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                
                {/* Step Info */}
                <div className="text-center max-w-[120px]">
                  <span className={`text-sm font-medium ${colors.text} block`}>
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {step.description}
                  </span>
                  
                  {/* Current Status Badge */}
                  {stepStatus === 'current' && (
                    <Badge 
                      variant="secondary" 
                      className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      Current
                    </Badge>
                  )}
                  
                  {/* Completed Badge */}
                  {stepStatus === 'completed' && (
                    <Badge 
                      variant="secondary"
                      className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    >
                      Complete
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current Status Description */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Current Status: {statusSteps[currentStepIndex]?.label}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {statusSteps[currentStepIndex]?.description}
            </p>
          </div>
          
          {/* Progress Percentage */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(((currentStepIndex + 1) / statusSteps.length) * 100)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
