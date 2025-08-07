import heroDarkMedical from '@/assets/hero-dark-medical.jpg'

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroDarkMedical})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/20"></div>
      
      <div className="relative text-center z-10">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to PharmaTrack India</h1>
        <p className="text-xl text-muted-foreground">Indian Pharmaceutical Supply Chain Tracking System</p>
      </div>
    </div>
  );
};

export default Index;
