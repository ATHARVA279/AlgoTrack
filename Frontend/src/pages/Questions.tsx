import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, PlusCircle } from "../utils/icons";
import { Link } from "react-router-dom";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `https://algotrack-vujc.onrender.com/api/questions`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch questions");

        const data = await res.json();

        const sorted = data.sort(
          (a, b) =>
            new Date(b.question.createdAt).getTime() -
            new Date(a.question.createdAt).getTime()
        );

        setQuestions(sorted);
        setFilteredQuestions(sorted);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  console.log("Questions fetched:", questions);

  useEffect(() => {
    if (!Array.isArray(questions) || questions.length === 0) {
      setFilteredQuestions([]);
      return;
    }

    const filtered = questions.filter((q) => {
      const matchesTopic =
        selectedTopic === "All" || q.question.topic === selectedTopic;
      const matchesSearch = q.question.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTopic && matchesSearch;
    });

    setFilteredQuestions(filtered);
  }, [searchQuery, selectedTopic, questions]);

  const difficultyColors = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
  };

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="cyber-card"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl font-bold">Practice Questions</h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="cyber-input pl-10 appearance-none pr-8"
            >
              <option value="All">All Topics</option>
              <option value="Arrays">Arrays</option>
              <option value="Stack">Stack</option>
              <option value="LinkedList">Linked List</option>
            </select>
          </div>

          <Link
            to="/add-question"
            className="cyber-button flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Question</span>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <Link
            key={q.question._id}
            to={`/question/${q.question._id}`}
            className="block cyber-card hover:border-neon-purple/40 transition-colors p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {q.question.title}
                </h3>
                <div className="flex items-center space-x-3 text-l text-gray-400">
                  <span className="bg-neon-purple/10 text-neon-purple px-3 py-1 rounded-full">
                    {q.question.topic}
                  </span>
                  <span
                    className={`${difficultyColors[q.question.difficulty]}`}
                  >
                    {q.question.difficulty}
                  </span>
                </div>
              </div>

              <div className="text-l text-right text-gray-400">
                <p>Added on</p>
                <p className="font-medium text-sm">
                  {new Date(q.question.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
