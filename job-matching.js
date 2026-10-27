(function () {
  "use strict";

  const STOP_WORDS = new Set([
    "and", "or", "the", "a", "an", "for", "with", "to", "of",
    "in", "on", "at", "by", "from", "is", "are", "be", "will",
    "this", "that", "your", "you", "we", "our", "their", "it"
  ]);

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function toList(value) {
    if (Array.isArray(value)) {
      return value.map(normalize).filter(Boolean);
    }

    if (typeof value === "string") {
      return value.split(/[,;\n|]/).map(normalize).filter(Boolean);
    }

    return [];
  }

  function extractSkills(value) {
    return toList(value)
      .flatMap(function (item) {
        return item.split(",").map(normalize);
      })
      .filter(Boolean);
  }

  function getJobSkills(job) {
    return extractSkills(
      job.skills ||
      job.required_skills ||
      job.skill_requirements ||
      ""
    );
  }

  function getStudentSkills(profile) {
    return extractSkills(
      profile.skills ||
      profile.student_skills ||
      profile.skill_list ||
      ""
    );
  }

  function getText(job) {
    return normalize([
      job.title,
      job.description,
      job.category,
      job.work_arrangement,
      job.location
    ].filter(Boolean).join(" "));
  }

  function skillMatches(studentSkills, jobSkills) {
    const matches = [];

    studentSkills.forEach(function (studentSkill) {
      jobSkills.forEach(function (jobSkill) {
        if (
          studentSkill === jobSkill ||
          (
            studentSkill.length >= 3 &&
            jobSkill.length >= 3 &&
            (
              studentSkill.includes(jobSkill) ||
              jobSkill.includes(studentSkill)
            )
          )
        ) {
          if (!matches.includes(jobSkill)) {
            matches.push(jobSkill);
          }
        }
      });
    });

    return matches;
  }

  function getKeywordMatches(studentSkills, job) {
    const jobText = getText(job);

    return studentSkills.filter(function (skill) {
      return jobText.includes(skill);
    });
  }

  function isOpen(job) {
    const status = normalize(job.status || "open");
    return status === "open" || status === "active";
  }

  function scoreJob(profile, job) {
    const studentSkills = getStudentSkills(profile);
    const jobSkills = getJobSkills(job);

    const matchedSkills = skillMatches(studentSkills, jobSkills);
    const keywordMatches = getKeywordMatches(studentSkills, job);

    let score = 0;

    if (jobSkills.length > 0) {
      score += Math.round(
        (matchedSkills.length / jobSkills.length) * 70
      );
    } else if (keywordMatches.length > 0) {
      score += Math.min(40, keywordMatches.length * 10);
    }

    const preferredArrangement = normalize(
      profile.preferred_work_arrangement ||
      profile.work_preference ||
      ""
    );

    const jobArrangement = normalize(
      job.work_arrangement || ""
    );

    if (
      preferredArrangement &&
      jobArrangement &&
      preferredArrangement === jobArrangement
    ) {
      score += 15;
    }

    const preferredCategory = normalize(
      profile.preferred_category || ""
    );

    const jobCategory = normalize(job.category || "");

    if (
      preferredCategory &&
      jobCategory &&
      preferredCategory === jobCategory
    ) {
      score += 15;
    }

    score = Math.min(100, score);

    return {
      job: job,
      score: score,
      matchedSkills: matchedSkills,
      keywordMatches: keywordMatches,
      isOpen: isOpen(job)
    };
  }

  function rankJobs(profile, jobs) {
    return (Array.isArray(jobs) ? jobs : [])
      .filter(isOpen)
      .map(function (job) {
        return scoreJob(profile || {}, job);
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
  }

  function getMatchLabel(score) {
    if (score >= 75) return "Excellent Match";
    if (score >= 50) return "Good Match";
    if (score >= 25) return "Some Matching Skills";
    return "Explore This Opportunity";
  }

  function createMatchBadge(score) {
    const badge = document.createElement("span");
    badge.className = "s2e-match-badge";
    badge.textContent = getMatchLabel(score) + " · " + score + "%";

    badge.style.display = "inline-block";
    badge.style.padding = "5px 9px";
    badge.style.borderRadius = "20px";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "700";
    badge.style.background = score >= 50 ? "#e0f2e9" : "#e8efff";
    badge.style.color = score >= 50 ? "#17643c" : "#1746a2";

    return badge;
  }

  window.SKILL2EARN_JOB_MATCHING = {
    rankJobs: rankJobs,
    scoreJob: scoreJob,
    getMatchLabel: getMatchLabel,
    createMatchBadge: createMatchBadge
  };
})();