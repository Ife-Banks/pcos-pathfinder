import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const blogPosts = [
  {
    id: 1,
    title: "Understanding PMOS: Early Detection Saves Lives",
    excerpt: "Learn how early detection of Polyendocrine Metabolic Ovarian Syndrome can significantly improve treatment outcomes and quality of life.",
    author: "Dr. Adaeze Okonkwo",
    date: "Dec 15, 2024",
    readTime: "5 min read",
    category: "Health Education",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    title: "The Role of AI in Modern Healthcare Diagnostics",
    excerpt: "Exploring how artificial intelligence is revolutionizing the way we detect and diagnose hormonal disorders.",
    author: "Dr. Emeka Nwosu",
    date: "Dec 10, 2024",
    readTime: "7 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    title: "MAMH in Men: Breaking the Stigma",
    excerpt: "Understanding Metabolic-Associated Male Hypogonadism and why men should not ignore the warning signs.",
    author: "Dr. Fatimah Al-Hassan",
    date: "Dec 5, 2024",
    readTime: "6 min read",
    category: "Men's Health",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    title: "How AIMHER is Transforming Healthcare in Nigeria",
    excerpt: "A look at how our platform is reaching underserved communities and improving health outcomes.",
    author: "Mr. Chidi Okafor",
    date: "Nov 28, 2024",
    readTime: "4 min read",
    category: "Company News",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop"
  },
  {
    id: 5,
    title: "The Connection Between PCOS and Metabolic Syndrome",
    excerpt: "Understanding the link between Polycystic Ovary Syndrome and metabolic disorders.",
    author: "Dr. Adaeze Okonkwo",
    date: "Nov 20, 2024",
    readTime: "8 min read",
    category: "Health Education",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Wearable Technology and Health Monitoring",
    excerpt: "How wearable devices complement AI diagnostics in providing a complete picture of your health.",
    author: "Dr. Emeka Nwosu",
    date: "Nov 15, 2024",
    readTime: "5 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop"
  },
];

const BlogScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/welcome")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-16">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-gray-900 mb-4">
              AIMHER Health Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Insights on hormonal health, AI diagnostics, and healthcare innovation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-teal-50">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h3>
          <p className="text-gray-600 mb-6">Get the latest health insights delivered to your inbox</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
            <Button className="bg-teal-600 hover:bg-teal-700">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-white py-8">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo variant="compact" />
          </div>
          <p className="text-teal-400 text-sm">
            © 2025 AIMHER Health. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogScreen;