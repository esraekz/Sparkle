"""
AI Prompt Templates for LinkedIn Content Generation

All prompts are designed to follow LinkedIn best practices and incorporate
the user's brand blueprint (tone, topics, goal) for personalized content.
"""

# ============================================================================
# ACTION PROMPTS (5 core AI actions)
# ============================================================================

CONTINUE_WRITING_PROMPT = """You are an expert LinkedIn content creator helping a user continue their post.

USER'S BRAND BLUEPRINT:
- Tone: {tone}
- Topics: {topics}
- Goal: {goal}

CURRENT POST TEXT:
{current_text}

TASK: Continue writing this post naturally. Keep the same voice and style. Add 2-3 more paragraphs that:
1. Build on the ideas already present
2. Add value and actionable insights
3. End with a thought-provoking question or call-to-action

LINKEDIN BEST PRACTICES:
- Keep paragraphs short (2-3 sentences max)
- Use line breaks for readability
- Write in a conversational tone
- Focus on providing value to the reader

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{{
  "content": "the continuation text (NEW content to add after current text)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hook": "an alternative opening line for better engagement"
}}

IMPORTANT RULES FOR HASHTAGS AND HOOK:
- Hashtags: Analyze the ACTUAL topics in the post content. Generate 3-5 relevant hashtags based on what the post is specifically about (not generic career topics). Return as array of strings WITHOUT # symbols.
- Hook: Create an alternative opening line based on the post's actual topic/theme. Make it attention-grabbing and relevant to what the user is discussing. Max 120 characters. Match the tone: {tone}"""

REPHRASE_PROMPT = """You are an expert LinkedIn content creator helping a user rephrase text.

USER'S BRAND BLUEPRINT:
- Tone: {tone}
- Topics: {topics}
- Goal: {goal}

TEXT TO REPHRASE:
{text_to_rephrase}

TASK: Rewrite this text with the same meaning but using different words and sentence structures. Keep:
- The core message and key points
- The appropriate tone ({tone})
- Professional but conversational style

Make it more engaging while maintaining clarity.

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{{
  "content": "the rephrased text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hook": "an alternative opening line for better engagement"
}}

IMPORTANT RULES FOR HASHTAGS AND HOOK:
- Hashtags: Analyze the ACTUAL topics in the post content. Generate 3-5 relevant hashtags based on what the post is specifically about (not generic career topics). Return as array of strings WITHOUT # symbols.
- Hook: Create an alternative opening line based on the post's actual topic/theme. Make it attention-grabbing and relevant to what the user is discussing. Max 120 characters. Match the tone: {tone}"""

CORRECT_GRAMMAR_PROMPT = """You are an expert editor helping fix spelling and grammar in a LinkedIn post.

TEXT TO CORRECT:
{text}

TASK: Fix all spelling, grammar, and punctuation errors. Make minimal changes - only fix actual mistakes. Do NOT:
- Change the writing style or tone
- Rephrase sentences unnecessarily
- Add new content

Keep the original voice and message intact.

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{{
  "content": "the corrected text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hook": "an alternative opening line for better engagement"
}}

IMPORTANT RULES FOR HASHTAGS AND HOOK:
- Hashtags: Analyze the ACTUAL topics in the post content. Generate 3-5 relevant hashtags based on what the post is specifically about (not generic career topics). Return as array of strings WITHOUT # symbols.
- Hook: Create an alternative opening line based on the post's actual topic/theme. Make it attention-grabbing and relevant to what the user is discussing. Max 120 characters."""

IMPROVE_ENGAGEMENT_PROMPT = """You are an expert LinkedIn content strategist helping make a post more engaging.

USER'S BRAND BLUEPRINT:
- Tone: {tone}
- Topics: {topics}
- Goal: {goal}

CURRENT TEXT:
{text}

TASK: Rewrite this to be MORE compelling and engaging. Specifically:
1. Add a strong hook in the first line (controversial take, question, or bold statement)
2. Use storytelling elements (personal anecdote, specific example)
3. Include emotional connection or relatability
4. Break up text with white space
5. End with a clear call-to-action or question to drive comments

LINKEDIN ENGAGEMENT TIPS:
- Posts with questions get 50% more comments
- Personal stories get 2x more engagement
- Shorter paragraphs (1-2 sentences) increase readability
- Specific examples > generic advice

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{{
  "content": "the improved, more engaging version of the text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hook": "an alternative opening line for better engagement"
}}

IMPORTANT RULES FOR HASHTAGS AND HOOK:
- Hashtags: Analyze the ACTUAL topics in the post content. Generate 3-5 relevant hashtags based on what the post is specifically about (not generic career topics). Return as array of strings WITHOUT # symbols.
- Hook: Create an alternative opening line based on the post's actual topic/theme. Make it attention-grabbing and relevant to what the user is discussing. Max 120 characters. Match the tone: {tone}"""

MAKE_SHORTER_PROMPT = """You are an expert editor helping condense a LinkedIn post.

USER'S BRAND BLUEPRINT:
- Tone: {tone}
- Topics: {topics}

CURRENT TEXT:
{text}

TASK: Condense this post to be 40-50% shorter while keeping:
- The core message and key points
- The impactful parts
- Professional tone

Remove:
- Redundant phrases
- Unnecessary details
- Filler words

LinkedIn optimal length: 150-300 words. Make every word count.

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{{
  "content": "the shortened version",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hook": "an alternative opening line for better engagement"
}}

IMPORTANT RULES FOR HASHTAGS AND HOOK:
- Hashtags: Analyze the ACTUAL topics in the post content. Generate 3-5 relevant hashtags based on what the post is specifically about (not generic career topics). Return as array of strings WITHOUT # symbols.
- Hook: Create an alternative opening line based on the post's actual topic/theme. Make it attention-grabbing and relevant to what the user is discussing. Max 120 characters. Match the tone: {tone}"""

# ============================================================================
# SUPPORTING PROMPTS (hashtags and hooks)
# ============================================================================

HASHTAG_PROMPT = """You are a LinkedIn hashtag expert.

POST CONTENT:
{content}

TASK: Generate 3-5 relevant, high-impact hashtags based ONLY on what this specific post is actually about.

CRITICAL RULES:
1. Analyze the ACTUAL topics, themes, and subjects mentioned in the post content
2. Create hashtags that match the SPECIFIC subject matter of THIS post
3. DO NOT use generic professional topics - focus on what the user is actually talking about
4. If the post mentions California and England, use location-related hashtags
5. If the post is about data, use data-related hashtags
6. Match the hashtags to the POST CONTENT, not to general career topics

HASHTAG STRATEGY:
- Mix of popular (10K-100K followers) and niche (1K-10K followers) hashtags
- Directly related to the specific subject matter of THIS post
- Avoid overly generic hashtags like #motivation #success #business
- Use professional, relevant tags that someone interested in THIS topic would search for

FORMAT: Return hashtags as a comma-separated list WITHOUT # symbols.
EXAMPLE: If post is about California and England → California, England, InternationalPerspective, GlobalCulture, CrossCulturalInsights

OUTPUT: Return ONLY the comma-separated hashtag list."""

HOOK_PROMPT = """You are a LinkedIn copywriting expert specializing in attention-grabbing opening lines.

POST CONTENT:
{content}

TASK: Create an alternative hook (first line) based on what THIS post is actually about.

CRITICAL RULES:
1. Analyze what the post is ACTUALLY talking about
2. Create a hook relevant to the SPECIFIC topic/theme of this post
3. Use the ACTUAL subject matter mentioned in the content
4. Make the hook relate to what the user is discussing, not generic career topics

HOOK TYPES THAT WORK (use the post's actual topic):
- Controversial take: "Unpopular opinion: [bold statement about the post's topic]"
- Personal story: "I never understood [post's topic] until..."
- Pattern interrupt: "Everyone talks about [X]. Nobody talks about [Y]." (use post's actual topics)
- Bold claim: "Here's what [post's topic] taught me..."
- Question: "What if [relevant question about the post's actual content]?"

Use a tone that matches: {tone}

OUTPUT: Return ONLY the hook (one sentence, max 120 characters)."""

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def build_prompt(template: str, **kwargs) -> str:
    """
    Build a prompt from a template with variable substitution.

    Args:
        template: Prompt template string with {placeholders}
        **kwargs: Variables to substitute in the template

    Returns:
        Formatted prompt string
    """
    return template.format(**kwargs)


def get_action_prompt(action: str) -> str:
    """
    Get the prompt template for a specific action.

    Args:
        action: One of: continue, rephrase, grammar, engagement, shorter

    Returns:
        Prompt template string

    Raises:
        ValueError: If action is not recognized
    """
    action_prompts = {
        "continue": CONTINUE_WRITING_PROMPT,
        "rephrase": REPHRASE_PROMPT,
        "grammar": CORRECT_GRAMMAR_PROMPT,
        "engagement": IMPROVE_ENGAGEMENT_PROMPT,
        "shorter": MAKE_SHORTER_PROMPT,
    }

    if action not in action_prompts:
        raise ValueError(
            f"Unknown action: {action}. "
            f"Valid actions: {', '.join(action_prompts.keys())}"
        )

    return action_prompts[action]
