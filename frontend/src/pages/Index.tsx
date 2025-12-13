import { Layout } from '@/components/layout/Layout';
import { NavigationCard } from '@/components/cards/NavigationCard';
import { UserCheck, UserMinus, Shield, Settings, Users, QrCode } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6">
              <QrCode className="h-4 w-4" />
              QR-Based Device Tracking
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              STEM Bootcamp
              <span className="block text-primary-foreground/80">Check-In System</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Secure student and device registration with photo verification. 
              Ensure every student leaves with the same device they arrived with.
            </p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="container py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <NavigationCard
            to="/check-in"
            icon={UserCheck}
            title="Start Check-In"
            description="Register a new student with photo capture and device documentation"
            variant="primary"
            delay={100}
          />
          <NavigationCard
            to="/check-out"
            icon={UserMinus}
            title="Start Check-Out"
            description="Scan QR code to verify student identity and confirm device return"
            variant="success"
            delay={200}
          />
          <NavigationCard
            to="/login"
            icon={Settings}
            title="Admin Panel"
            description="Manage students, view records, and oversee all check-in/check-out activities"
            variant="accent"
            delay={300}
          />
          <NavigationCard
            to="/login"
            icon={Shield}
            title="Security Portal"
            description="Read-only access to verify students and devices at exit points"
            variant="secondary"
            delay={400}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Register', desc: 'Capture student photo and document devices' },
              { step: '2', title: 'Track', desc: 'Monitor all check-ins via admin dashboard' },
              { step: '3', title: 'Verify', desc: 'Scan QR at exit to confirm device match' }
            ].map((item, index) => (
              <div 
                key={item.step}
                className="text-center p-6 animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
