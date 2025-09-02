const axios = require("axios");

class LeetCodeService {
  constructor() {
    this.baseURL = "https://leetcode.com/api";
    this.graphqlURL = "https://leetcode.com/graphql";
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

      const response = await axios.post(this.graphqlURL, {
        query,
        variables: { username, limit },
      });

      return response.data.data.recentAcSubmissionList;
    } catch (error) {
      console.error("Error fetching recent submissions:", error);
      throw error;
    }
  }

  async getProblemDetails(titleSlug) {
    try {
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

      const response = await axios.post(this.graphqlURL, {
        query,
        variables: { titleSlug },
      });

      return response.data.data.question;
    } catch (error) {
      console.error("Error fetching problem details:", error);
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
