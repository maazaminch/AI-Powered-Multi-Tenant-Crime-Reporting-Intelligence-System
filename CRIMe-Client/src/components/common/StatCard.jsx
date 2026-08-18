import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";

const StatCard = ({ title, value, color, bg, path
    // Icon
 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={() => navigate(path)}
        className={`cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl ${bg}`}
      >
        <CardContent className="flex flex-col items-start justify-between p-5 h-36">
          <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center">
            {/* <Icon className="w-5 h-5 text-white" /> */}
          </div>
          <div>
            <h2 className={`text-3xl font-bold ${color} leading-tight`}>
              {value}
            </h2>
            <p className={`mt-1 text-sm font-medium ${color}`}>
              {title}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default StatCard;