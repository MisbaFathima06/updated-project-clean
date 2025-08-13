import { Link } from "wouter";
import { Shield, Edit, Search, Heart, Lock, Eye, Box, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const stats = {
    totalComplaints: 1247,
    resolutionRate: 89,
    ngoPartners: 15,
    avgResponseTime: "4h"
  };

  const trustIndicators = [
    { icon: Lock, text: t('common.encrypted'), color: "text-green-500" },
    { icon: Eye, text: t('common.anonymous'), color: "text-green-500" },
    { icon: Box, text: t('common.verified'), color: "text-green-500" },
    { icon: Users, text: "NGO Connected", color: "text-green-500" },
    { icon: Globe, text: "5 Languages", color: "text-green-500" },
  ];

  const howItWorksSteps = [
    {
      number: 1,
      icon: Edit,
      title: "Write or Speak",
      description: "Use text input, voice recording, or file uploads to describe your complaint in detail.",
      gradient: "from-primary-500 to-primary-600"
    },
    {
      number: 2,
      icon: Lock,
      title: "Auto-Encrypt",
      description: "Your complaint is encrypted with AES-256 before leaving your device. No one can read it.",
      gradient: "from-green-500 to-green-600"
    },
    {
      number: 3,
      icon: Box,
      title: "Secure Storage",
      description: "Encrypted data is stored on IPFS and hash recorded on blockchain for tamper-proof verification.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      number: 4,
      icon: Users,
      title: "Get Help",
      description: "Trusted NGOs and authorities can decrypt and respond to help resolve your complaint.",
      gradient: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-purple-600/10 to-teal-600/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                {t('home.title').split('.')[0]}.
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200">
                {t('home.title').split('.')[1]}.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-12">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <indicator.icon className={`w-5 h-5 ${indicator.color}`} />
                  <span>{indicator.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Report Problem Card */}
            <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700/50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Edit className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{t('home.report.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-6 leading-relaxed">
                  {t('home.report.description')}
                </CardDescription>
                <Button asChild className="w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600">
                  <Link href="/report">Start Report</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Track Status Card */}
            <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700/50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{t('home.status.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-6 leading-relaxed">
                  {t('home.status.description')}
                </CardDescription>
                <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                  <Link href="/status">Check Status</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Help Others Card */}
            <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700/50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{t('home.community.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-6 leading-relaxed">
                  {t('home.community.description')}
                </CardDescription>
                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Link href="/public">View Community</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stats.totalComplaints.toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Total Reports</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {stats.resolutionRate}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Resolution Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {stats.ngoPartners}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">NGO Partners</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stats.avgResponseTime}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How SpeakSecure Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your privacy and security are protected at every step with cutting-edge cryptography
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border-2 border-primary-200 dark:border-primary-700">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-primary-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Real Impact, Real Stories
          </h2>

          <Card className="shadow-2xl border border-gray-200 dark:border-gray-700 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-primary-500 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <blockquote className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic">
                "Finally, a platform where I could speak up about workplace harassment without fear of retaliation. 
                The anonymous system gave me the courage to report, and the NGO response was immediate and supportive. 
                My situation was resolved in just 3 days."
              </blockquote>
              <div className="text-gray-600 dark:text-gray-400">
                — Anonymous User, Mumbai
                <div className="text-sm mt-1">Harassment case resolved • January 2024</div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {stats.totalComplaints.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Lives Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.resolutionRate}%
              </div>
              <div className="text-gray-600 dark:text-gray-300">Cases Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.ngoPartners}
              </div>
              <div className="text-gray-600 dark:text-gray-300">NGO Partners</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}