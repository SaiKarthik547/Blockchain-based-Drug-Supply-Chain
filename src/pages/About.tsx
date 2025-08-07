import { Shield, Users, Globe, CheckCircle, ExternalLink, Github, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import heroBlockchainMedical from '@/assets/hero-blockchain-medical.jpg'

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure System",
      description: "Every transaction is cryptographically secured and immutable in the system"
    },
    {
      icon: Users,
      title: "Multi-Stakeholder Platform",
      description: "Connects manufacturers, distributors, pharmacies, and patients in one ecosystem"
    },
    {
      icon: Globe,
      title: "Global Transparency",
      description: "Real-time tracking across international supply chains and regulatory boundaries"
    },
    {
      icon: CheckCircle,
      title: "Anti-Counterfeiting",
      description: "Verify drug authenticity and prevent counterfeit medicines from entering the market"
    }
  ]

  const benefits = [
    "End-to-end drug traceability from manufacturing to patient",
    "Real-time supply chain visibility for all stakeholders", 
    "Immutable audit trail for regulatory compliance",
    "Anti-counterfeiting protection through secure verification",
    "Smart contract automation for efficiency",
    "Patient safety through verified drug authenticity",
    "Regulatory compliance with transparent documentation",
    "Cost reduction through supply chain optimization"
  ]

  const techStack = [
    { name: "React", description: "Frontend framework" },
    { name: "TypeScript", description: "Type-safe development" },
    { name: "Node.js", description: "Backend API development" },
    { name: "Python", description: "Data processing and analytics" },
    { name: "Go", description: "High-performance backend services" },
    { name: "Vite", description: "Build tool and dev server" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework" },
    { name: "Shadcn/ui", description: "Component library" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      {/* Background Image Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBlockchainMedical})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50"></div>
        
        <div className="relative container mx-auto max-w-6xl p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">About PharmaTrack India</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing Indian pharmaceutical supply chain transparency through secure technology. 
              Building trust, ensuring safety, and preventing counterfeit drugs in India.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">

        {/* Mission Statement */}
        <Card className="mb-12 shadow-card">
          <CardContent className="pt-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To create a transparent, secure, and efficient Indian pharmaceutical supply chain that ensures 
                every medicine reaches patients safely. We leverage secure technology to provide 
                immutable tracking from Indian manufacturers to final sale, protecting patients and supporting 
                Indian healthcare providers with verified, authentic medications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="text-center shadow-card hover:shadow-medical transition-all duration-300">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Supply Chain Benefits</CardTitle>
              <CardDescription>
                How PharmaTrack India transforms Indian pharmaceutical logistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Technology Stack</CardTitle>
              <CardDescription>
                Built with cutting-edge web technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {techStack.map((tech) => (
                  <div key={tech.name} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{tech.name}</h4>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12 shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
            <CardDescription className="text-center">
              Simple steps to track your pharmaceutical supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">Manufacturing</h4>
                <p className="text-sm text-muted-foreground">
                  Drug is manufactured and registered in system with unique batch number
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">Distribution</h4>
                <p className="text-sm text-muted-foreground">
                  Transfer events are recorded as drug moves through supply chain
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Sale</h4>
                <p className="text-sm text-muted-foreground">
                  Final sale to patient is recorded with pharmacy details
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-2">Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Anyone can verify authenticity using batch number
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Contact Information</CardTitle>
              <CardDescription>
                Get in touch with our team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>support@pharmatrackindia.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>+91 (22) 1234-5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span>www.pharmatrackindia.com</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Resources & Links</CardTitle>
              <CardDescription>
                Learn more about secure systems in Indian healthcare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Github className="h-4 w-4 mr-2" />
                View Source Code
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                System Documentation
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Industry Standards
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default About