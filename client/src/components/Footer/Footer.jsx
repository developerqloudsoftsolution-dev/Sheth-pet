import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { FaYoutube, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { CiLinkedin } from "react-icons/ci";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.215, 0.610, 0.355, 1.000] }
    }
  }

  const socialLinks = [
    { icon: FaWhatsapp, href: 'https://wa.me/919867000311', label: 'WhatsApp' },
    { icon: FaYoutube, href: 'https://www.youtube.com/@shethpet', label: 'YouTube' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: CiLinkedin, href: '#', label: 'LinkedIn' },
  ]

  const quickLinks = [
    { name: 'Products', href: '/products' },
    { name: 'Manufacturing', href: '/manufacturing' },
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
  ]

  const industries = [
    { name: 'Food & Beverage', href: '/food-beverages' },
    { name: 'Personal Care', href: '/personal-care' },
    { name: 'Pharmaceuticals', href: '/pharmaceutical' },
    { name: 'Home Care', href: '/home-care' },
    { name: 'Industrial', href: '/industrial' },
  ]

  return (
    <footer className="bg-slate-950 text-slate-400 pt-15 pb-10 border-t border-slate-900/60 antialiased font-sans tracking-normal">
      <div className="max-w-9xl mx-auto px-6 lg:px-12">
        
        {/* Main Content Sections */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_2fr] gap-x-12 gap-y-16 pb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {/* Brand/Identity Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex flex-col select-none space-y-0.5">
              <span className="font-extrabold text-2xl tracking-tight text-white font-display uppercase">
                SHETH
              </span>
              <span className="text-[9px] text-red-500 font-bold tracking-[0.3em] uppercase">
                PET & POLYMERS
              </span>
            </div>
            
            <p className="text-slate-400 text-[14px] leading-relaxed max-w-sm font-normal">
              Precision PET Packaging. Bottles, jars, caps, and preforms engineered for enterprise scale — shaping global reliability since 1996.
            </p>

            {/* Premium Minimal Social Bar */}
            <div className="flex gap-3 pt-1">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-9 h-9 flex items-center justify-center bg-slate-900/60 border border-slate-800 text-slate-400 rounded-lg transition-all duration-300 hover:bg-slate-900 hover:text-white hover:border-slate-700 group"
                    aria-label={social.label}
                  >
                    <Icon size={16} className="transition-transform group-hover:scale-105" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Links Column */}
          <motion.div variants={itemVariants} className="lg:pl-2">
            <h3 className="text-[11px] font-bold text-slate-200 tracking-[0.2em] uppercase mb-6 font-display">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-[14px] text-slate-400 hover:text-white transition-colors relative duration-200 pb-0.5 inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-red-500 after:origin-bottom-left after:transition-transform after:duration-200 hover:after:scale-x-100"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Industries Column */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[11px] font-bold text-slate-200 tracking-[0.2em] uppercase mb-6 font-display">
              Industries
            </h3>
            <ul className="space-y-3">
              {industries.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href} 
                    className="text-[14px] text-slate-400 hover:text-white transition-colors relative duration-200 pb-0.5 inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-red-500 after:origin-bottom-left after:transition-transform after:duration-200 hover:after:scale-x-100"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* High-Contrast Corporate Office Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-slate-900/30 border border-slate-900 py-3 px-5 rounded-xl space-y-3 backdrop-blur-sm transition-all duration-500 hover:border-slate-800/80 hover:shadow-[0_0_30px_rgba(239,68,68,0.03)]">
              <h3 className="text-[11px] font-bold text-white tracking-[0.2em] uppercase font-display">
                Corporate Office
              </h3>
              
              <div className="flex gap-3.5 items-start text-[13.5px]">
                <MapPin size={16} className="flex-shrink-0 text-red-500 mt-0.5" />
                <span className="text-slate-400 leading-relaxed font-sans">
                  Sheth PET And Polymers Pvt. Ltd.<br />
                  Unit 510, B Wing, Lodha Supremus II,<br />
                  Wagle Industrial Estate, Thane - 400604
                </span>
              </div>

              <div className="h-px bg-slate-900 w-full" />

              <div className="space-y-2">
                <a 
                  href="tel:+918047833997" 
                  className="flex gap-3.5 items-center text-[13.5px] text-slate-400 hover:text-white transition-colors group"
                >
                  <Phone size={14} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                  <span className="font-sans">+91 70216 90192</span>
                </a>
                
                <a 
                  href="https://wa.me/919867000311" 
                  className="flex gap-3.5 items-center text-[13.5px] text-slate-400 hover:text-white transition-colors group"
                >
                  <FaWhatsapp size={14} className="text-slate-500 group-hover:text-green-500 transition-colors" />
                  <span className="font-sans">+91 98670 00311</span>
                </a>
                
                <a 
                  href="mailto:info@sethpet.com" 
                  className="flex gap-3.5 items-center text-[13.5px] text-slate-400 hover:text-white transition-colors group"
                >
                  <Mail size={14} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                  <span className="font-sans">info@sethpet.com</span>
                </a>
                <a 
                  href="mailto:sales@sethpet.com" 
                  className="flex gap-3.5 items-center text-[13.5px] text-slate-400 hover:text-white transition-colors group"
                >
                  <Mail size={14} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                  <span className="font-sans">sales@sethpet.com</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Tier Copyright Meta */}
        <motion.div 
          className="pt-4 border-t border-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-slate-500 text-[13px] font-sans">
            &copy; {new Date().getFullYear()} Sheth PET & Polymers. All rights reserved.
          </p>

          <p className="text-slate-500 text-[13px] font-sans">
            Designed &amp; Maintained by{' '}
            <a
              href="https://qloudsoft.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-slate-700 hover:decoration-red-500"
            >
              Qloudsoft Solutions
            </a>
          </p>

          <div className="flex gap-6 text-[13px] font-sans">
            <Link to="/privacy-policy" className="text-slate-500 transition-colors duration-200 hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-slate-500 transition-colors duration-200 hover:text-slate-300">
              Terms of Service
            </Link>
          </div>
        </motion.div>

      </div>
    </footer>
  )
}

export default Footer
