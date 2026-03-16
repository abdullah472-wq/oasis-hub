import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppFAB = () => (
  <motion.a
    href="https://wa.me/8801581818368"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    whileTap={{ scale: 0.95 }}
  >
    <MessageCircle className="w-7 h-7 text-[#fdfcf6]" fill="currentColor" />
  </motion.a>
);

export default WhatsAppFAB;
