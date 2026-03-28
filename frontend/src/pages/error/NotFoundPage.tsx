import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass flex max-w-sm flex-col items-center justify-center rounded-3xl p-10 text-center"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-7xl font-bold text-violet-400 opacity-90"
        >
          404
        </motion.div>
        <div className="mb-2 text-xl font-semibold text-white">Lost in space?</div>
        <div className="mb-8 text-sm text-white/50">
          The galaxy sector you are looking for has been destroyed or never existed.
        </div>
        <Link to="/app/dashboard" className="w-full">
          <Button className="w-full">Return to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
}
