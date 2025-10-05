-- Enable Row Level Security on tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- POSTS POLICIES
-- Allow users to read public posts, followers-only posts if they follow the author, or their own posts
CREATE POLICY posts_select_policy
ON posts FOR SELECT
USING (
  visibility = 'PUBLIC'
  OR (visibility = 'FOLLOWERS' AND EXISTS (
        SELECT 1 FROM follows f
        WHERE f."followeeId" = posts."authorId" AND f."followerId" = auth.uid()
      ))
  OR ("authorId" = auth.uid())
);

-- Allow users to insert their own posts
CREATE POLICY posts_insert_own
ON posts FOR INSERT
WITH CHECK ("authorId" = auth.uid());

-- Allow users to update their own posts
CREATE POLICY posts_update_own
ON posts FOR UPDATE
USING ("authorId" = auth.uid())
WITH CHECK ("authorId" = auth.uid());

-- Allow users to delete their own posts
CREATE POLICY posts_delete_own
ON posts FOR DELETE
USING ("authorId" = auth.uid());

-- PROFILES POLICIES
-- Allow everyone to read profiles (public information)
CREATE POLICY profiles_select_public ON profiles FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY profiles_upsert_own ON profiles FOR INSERT WITH CHECK ("userId" = auth.uid());

-- Allow users to update their own profile
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());

-- FOLLOWS POLICIES
-- Allow users to see their own follow relationships (who they follow and who follows them)
CREATE POLICY follows_select_own_graph ON follows FOR SELECT USING ("followerId" = auth.uid() OR "followeeId" = auth.uid());

-- Allow users to create their own follow relationships
CREATE POLICY follows_insert_own ON follows FOR INSERT WITH CHECK ("followerId" = auth.uid());

-- Allow users to delete their own follow relationships
CREATE POLICY follows_delete_own ON follows FOR DELETE USING ("followerId" = auth.uid());