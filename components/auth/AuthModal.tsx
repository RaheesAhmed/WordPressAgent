'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  // Sync internal mode state with defaultMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-md min-w-[350px] max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-12 scrollbar-hide">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToSignup={handleSwitchMode}
              onSuccess={handleSuccess}
            />
          ) : (
            <SignUpForm
              onSwitchToLogin={handleSwitchMode}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}