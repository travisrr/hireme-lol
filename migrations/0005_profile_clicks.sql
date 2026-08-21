-- Real profile click-throughs. Start at 0. Never seed fake clicks.
ALTER TABLE profiles ADD COLUMN profile_clicks INTEGER NOT NULL DEFAULT 0;
