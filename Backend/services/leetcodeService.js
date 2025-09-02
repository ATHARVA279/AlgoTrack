const axios = require("axios");

class LeetCodeService {
  constructor() {
    this.baseURL = "https://leetcode.com/api";
    this.graphqlURL = "https://leetcode.com/graphql";
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 second timeout for individual requests
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
  }

  async makeRequest(query, variables, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        console.log(`🔄 LeetCode API request attempt ${i + 1}/${retries + 1}`);
        const response = await this.axiosInstance.post(this.graphqlURL, {
          query,
          variables,
        });

        if (response.data.errors) {
          throw new Error(`GraphQL Error: ${response.data.errors[0].message}`);
        }

        return response.data;
      } catch (error) {
        console.error(
          `❌ LeetCode API request failed (attempt ${i + 1}):`,
          error.message
        );

        if (i === retries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async getUserSolvedProblems(username) {
    try {
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
              userAvatar
              realName
              aboutMe
              school
              websites
              countryName
              company
              jobTitle
              skillTags
              postViewCount
              postViewCountDiff
              reputation
              reputationDiff
              solutionCount
              solutionCountDiff
              categoryDiscussCount
              categoryDiscussCountDiff
            }
          }
        }
      `;

      const response = await axios.post(this.graphqlURL, {
        query,
        variables: { username },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  async getUserRecentSubmissions(username, limit = 20) {
    try {
      console.log(
        `🔍 Fetching recent submissions for ${username} (limit: ${limit})`
      );
      const query = `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
            statusDisplay
            lang
            __typename
          }
        }
      `;

      const response = await this.makeRequest(query, { username, limit });
      const submissions = response.data.recentAcSubmissionList;

      if (!submissions) {
        throw new Error("User not found or no submissions available");
      }

      console.log(`✅ Found ${submissions.length} recent submissions`);
      return submissions;
    } catch (error) {
      console.error("Error fetching recent submissions:", error);
      throw error;
    }
  }

  async getAllUserSolvedProblems(username) {
    try {
      console.log(`🔍 Fetching ALL solved problems for ${username}...`);

      // First get user profile to know total solved count
      const profileQuery = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
            }
          }
        }
      `;

      const profileResponse = await this.makeRequest(profileQuery, {
        username,
      });
      const userProfile = profileResponse.data.matchedUser;

      if (!userProfile) {
        throw new Error("User not found");
      }

      const totalSolved = userProfile.submitStats.acSubmissionNum.reduce(
        (sum, stat) => sum + stat.count,
        0
      );
      console.log(`📊 User has solved ${totalSolved} problems total`);

      // Try multiple aggressive strategies to get maximum submissions
      const allSubmissions = [];
      const seenTitleSlugs = new Set();
      
      console.log("🔄 Attempting AGGRESSIVE fetch strategies...");
      
      // Strategy 1: Maximum limit attempts
      const limits = [500, 300, 200, 150, 100];
      for (const limit of limits) {
        try {
          console.log(`📡 Trying limit ${limit}...`);
          const submissions = await this.getUserRecentSubmissions(username, limit);
          let newCount = 0;
          for (const sub of submissions) {
            if (!seenTitleSlugs.has(sub.titleSlug)) {
              allSubmissions.push(sub);
              seenTitleSlugs.add(sub.titleSlug);
              newCount++;
            }
          }
          console.log(`✅ Limit ${limit}: Added ${newCount} new problems (total: ${allSubmissions.length})`);
          
          // If we got a good result, try to get more with a delay
          if (newCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`❌ Limit ${limit} failed:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Strategy 2: Try different time-based approaches
      console.log("🔄 Trying time-based strategies...");
      try {
        // Sometimes different calls return different subsets
        for (let i = 0; i < 3; i++) {
          console.log(`📡 Time-based attempt ${i + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const submissions = await this.getUserRecentSubmissions(username, 100);
          let newCount = 0;
          for (const sub of submissions) {
            if (!seenTitleSlugs.has(sub.titleSlug)) {
              allSubmissions.push(sub);
              seenTitleSlugs.add(sub.titleSlug);
              newCount++;
            }
          }
          console.log(`✅ Time attempt ${i + 1}: Added ${newCount} new problems`);
        }
      } catch (error) {
        console.error("❌ Time-based strategy failed:", error);
      }

      console.log(
        `✅ Successfully fetched ${allSubmissions.length} unique solved problems out of ${totalSolved} total`
      );
      
      if (allSubmissions.length < totalSolved) {
        console.log(`⚠️ LeetCode API limitation: Only ${allSubmissions.length}/${totalSolved} problems retrieved. The API only returns recent submissions, not all-time solved problems.`);
      }

      return {
        submissions: allSubmissions,
        profile: {
          totalSolved,
          foundSubmissions: allSubmissions.length,
          easySolved:
            userProfile.submitStats.acSubmissionNum.find(
              (s) => s.difficulty === "Easy"
            )?.count || 0,
          mediumSolved:
            userProfile.submitStats.acSubmissionNum.find(
              (s) => s.difficulty === "Medium"
            )?.count || 0,
          hardSolved:
            userProfile.submitStats.acSubmissionNum.find(
              (s) => s.difficulty === "Hard"
            )?.count || 0,
          ranking: userProfile.profile.ranking,
          apiLimitation: allSubmissions.length < totalSolved
        },
      };
    } catch (error) {
      console.error("Error fetching all solved problems:", error);
      throw error;
    }
  }

  async getProblemDetails(titleSlug) {
    try {
      console.log(`🔍 Fetching problem details for: ${titleSlug}`);
      const query = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            difficulty
            likes
            dislikes
            categoryTitle
            topicTags {
              name
              slug
            }
            sampleTestCase
            exampleTestcases
            hints
            solution {
              id
              canSeeDetail
              paidOnly
              hasVideoSolution
              paidOnlyVideo
              __typename
            }
          }
        }
      `;

      const response = await this.makeRequest(query, { titleSlug });
      const question = response.data.question;

      if (!question) {
        console.log(`⚠️ No question data found for: ${titleSlug}`);
        return null;
      }

      console.log(`✅ Got problem details for: ${question.title}`);
      return question;
    } catch (error) {
      console.error(`Error fetching problem details for ${titleSlug}:`, error);
      throw error;
    }
  }

  async getUserSubmission(username, titleSlug) {
    try {
      const query = `
        query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!, $username: String!) {
          submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug, username: $username) {
            lastKey
            hasNext
            submissions {
              id
              statusDisplay
              lang
              runtime
              timestamp
              url
              isPending
              memory
              submissionComment {
                comment
                flagType
              }
            }
          }
        }
      `;

      const response = await axios.post(this.graphqlURL, {
        query,
        variables: {
          offset: 0,
          limit: 20,
          lastKey: null,
          questionSlug: titleSlug,
          username,
        },
      });

      return response.data.data.submissionList.submissions;
    } catch (error) {
      console.error("Error fetching user submission:", error);
      throw error;
    }
  }
}

module.exports = new LeetCodeService();
