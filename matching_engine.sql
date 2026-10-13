-- Advanced Matching Engine for Zivo

-- Function to calculate compatibility score between two users
CREATE OR REPLACE FUNCTION calculate_compatibility_score(user_a UUID, user_b UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    interests_a TEXT[];
    interests_b TEXT[];
    intent_a TEXT;
    intent_b TEXT;
    distance FLOAT;
BEGIN
    -- Get user data
    SELECT interests, intent INTO interests_a, intent_a FROM public.profiles WHERE id = user_a;
    SELECT interests, intent INTO interests_b, intent_b FROM public.profiles WHERE id = user_b;

    -- 1. Intent Check (Mandatory)
    IF intent_a != intent_b THEN
        RETURN 0;
    END IF;

    -- 2. Shared Interests (+10 for each match)
    score := score + (CARDINALITY(ARRAY(SELECT UNNEST(interests_a) INTERSECT SELECT UNNEST(interests_b))) * 10);

    -- 3. Distance Boost (using PostGIS)
    -- Max 50 points for being very close (within 5km), decaying as distance increases
    SELECT ST_Distance(a.location, b.location) INTO distance
    FROM public.profiles a, public.profiles b
    WHERE a.id = user_a AND b.id = user_b;

    IF distance < 5000 THEN -- 5km
        score := score + 50;
    ELSIF distance < 20000 THEN -- 20km
        score := score + 30;
    ELSIF distance < 50000 THEN -- 50km
        score := score + 10;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get recommended matches for a user
-- Filters out users already swiped on, blocked, or not matching intent
CREATE OR REPLACE FUNCTION get_recommended_matches(target_user_id UUID, max_results INTEGER DEFAULT 20)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    age INTEGER,
    bio TEXT,
    photos TEXT[],
    video_url TEXT,
    distance_km FLOAT,
    compatibility_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.age,
        p.bio,
        p.photos,
        p.video_url,
        (ST_Distance(p.location, mine.location) / 1000)::FLOAT as distance_km,
        calculate_compatibility_score(target_user_id, p.id) as compatibility_score
    FROM public.profiles p
    CROSS JOIN (SELECT location, intent FROM public.profiles WHERE id = target_user_id) as mine
    WHERE p.id != target_user_id
    AND p.intent = mine.intent
    -- Filter out users already swiped on
    AND NOT EXISTS (
        SELECT 1 FROM public.swipes s 
        WHERE s.swiper_id = target_user_id AND s.swiped_id = p.id
    )
    -- Filter out safety blocks
    AND NOT EXISTS (
        SELECT 1 FROM public.safety_reports r 
        WHERE (r.reporter_id = target_user_id AND r.reported_id = p.id)
        OR (r.reporter_id = p.id AND r.reported_id = target_user_id)
    )
    ORDER BY compatibility_score DESC, distance_km ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;
