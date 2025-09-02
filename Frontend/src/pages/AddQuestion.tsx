import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "../utils/icons";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";

const difficultyLevels = ["Easy", "Medium", "Hard"];
const topics = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Sorting",
  "Searching",
];

function AddQuestion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    topic: "",
    sampleInput: "",
    sampleOutput: "",
    solution: {
      language: "javascript",
      code: "",
      explanation: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.topic) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(
        "https://algotrack-vujc.onrender.com/api/questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to add question");
      }

      toast.success("Question added successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof typeof prev] as object) || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      solution: {
        ...prev.solution,
        code: value || "",
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-gray-400 hover:text-neon-purple transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card"
      >
        <h1 className="text-3xl font-bold mb-8">Add New Question</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Question Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="cyber-input w-full"
                placeholder="e.g., Two Sum"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="difficulty"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Difficulty *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="cyber-input w-full"
                  required
                >
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Topic *
                </label>
                <select
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="cyber-input w-full"
                  required
                >
                  <option value="">Select Topic</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Problem Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="cyber-input w-full"
              placeholder="Describe the problem..."
              required
            />
          </div>

          {/* Sample Input/Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="sampleInput"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Sample Input *
              </label>
              <textarea
                id="sampleInput"
                name="sampleInput"
                value={formData.sampleInput}
                onChange={handleChange}
                rows={4}
                className="cyber-input w-full font-mono"
                placeholder="e.g., nums = [2,7,11,15], target = 9"
                required
              />
            </div>

            <div>
              <label
                htmlFor="sampleOutput"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Sample Output *
              </label>
              <textarea
                id="sampleOutput"
                name="sampleOutput"
                value={formData.sampleOutput}
                onChange={handleChange}
                rows={4}
                className="cyber-input w-full font-mono"
                placeholder="e.g., [0,1]"
                required
              />
            </div>
          </div>

          {/* Solution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Initial Solution</h3>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Programming Language
              </label>
              <select
                id="language"
                name="solution.language"
                value={formData.solution.language}
                onChange={handleChange}
                className="cyber-input w-full"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Solution Code
              </label>
              <div className="h-[300px] cyber-card bg-cyber-darker overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage={formData.solution.language}
                  value={formData.solution.code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="explanation"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Solution Explanation
              </label>
              <textarea
                id="explanation"
                name="solution.explanation"
                value={formData.solution.explanation}
                onChange={handleChange}
                rows={6}
                className="cyber-input w-full"
                placeholder="Explain your solution approach, time complexity, and space complexity..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="cyber-button flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddQuestion;
