# Postman Collection Setup Guide

This guide will help you import and use the Postman collection for testing the SkillPath AI Backend API.

## Files Included

1. **SkillPath_AI_Backend.postman_collection.json** - Complete API collection with all endpoints
2. **SkillPath_AI_Backend.postman_environment.json** - Environment variables for easy configuration

## Import Instructions

### Step 1: Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Click **Upload Files**
4. Select `SkillPath_AI_Backend.postman_collection.json`
5. Click **Import**

### Step 2: Import the Environment

1. Click **Import** button again
2. Click **Upload Files**
3. Select `SkillPath_AI_Backend.postman_environment.json`
4. Click **Import**

### Step 3: Select the Environment

1. In the top right corner of Postman, click the environment dropdown
2. Select **"SkillPath AI Backend - Local"**

## Collection Structure

The collection is organized into the following folders:

- **Health Check** - Server health endpoint
- **Authentication** - Register and Login endpoints
- **Users** - User profile management
- **Skills** - Skill CRUD operations (Admin only for create/update/delete)
- **Assessment** - Assessment creation and submission
- **Progress** - Progress tracking endpoints
- **Learning Path** - Learning path management
- **AI** - AI-powered explanations

## Features

### Automatic Token Management

The collection includes **automatic token extraction**:

- When you register or login, the JWT token is automatically saved to the `auth_token` environment variable
- All protected endpoints automatically use this token for authentication

### Environment Variables

The following variables are available:

- `base_url` - API base URL (default: `http://localhost:3000`)
- `auth_token` - JWT token (auto-populated after login/register)
- `user_id` - Current user ID (auto-populated after login/register)
- `assessment_id` - Assessment ID (auto-populated after starting assessment)
- `question_id` - Question ID (auto-populated after starting assessment)
- `skill_id` - Skill ID (auto-populated after creating/getting a skill)
- `prerequisite_id` - Prerequisite skill ID (manual entry required for prerequisite operations)

### Testing Workflow

1. **Start the server:**

   ```bash
   npm run start:dev
   ```

2. **Register a new user:**
   - Go to **Authentication > Register**
   - Update the email and password in the request body
   - Click **Send**
   - The token will be automatically saved

3. **Or Login:**
   - Go to **Authentication > Login**
   - Use your credentials
   - Click **Send**
   - The token will be automatically saved

4. **Create a Skill (Admin only):**
   - Go to **Skills > Create Skill**
   - Update the request body with skill details
   - Set `difficulty` to one of: `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`
   - Click **Send**
   - The skill ID will be automatically saved to `skill_id`

5. **Get All Skills:**
   - Go to **Skills > Get All Skills**
   - Click **Send**
   - View all available skills

6. **Start an Assessment:**
   - Go to **Assessment > Start Assessment - Role Based**
   - Click **Send**
   - The assessment ID and question IDs will be automatically saved

7. **Submit Assessment:**
   - Go to **Assessment > Submit Assessment**
   - The request body uses the saved `assessment_id` and `question_id`
   - Update `selectedAnswer` values as needed
   - Click **Send**

8. **Update Progress:**
   - Go to **Progress > Update Progress**
   - The request uses the saved `skill_id` and `assessment_id`
   - Update the `score` value (0-100)
   - Click **Send**

9. **View Learning Path:**
   - Go to **Learning Path > Get Learning Path**
   - Click **Send**

## Customizing the Base URL

To change the base URL (e.g., for production):

1. Click the **Environment** icon (eye icon) in the top right
2. Click **"SkillPath AI Backend - Local"** environment
3. Edit the `base_url` value
4. Click **Save**

Or create a new environment for production:

1. Click **Environments** in the left sidebar
2. Click **+** to create a new environment
3. Add `base_url` variable with your production URL
4. Select the new environment from the dropdown

## Troubleshooting

### Token Not Working

If you get 401 Unauthorized errors:

1. Make sure you've run **Register** or **Login** first
2. Check that the environment is selected in the top right
3. Verify the `auth_token` variable has a value (click the eye icon to see variables)

### Variables Not Auto-Populating

The collection uses Postman's test scripts to automatically save values. Make sure:

- You're using the imported collection (not manually created requests)
- The environment is selected
- The requests are returning successful responses (200/201 status codes)

### Base URL Issues

If requests fail with connection errors:

1. Verify your server is running on `http://localhost:3000`
2. Check the `base_url` environment variable
3. Try the **Health Check** endpoint first to verify connectivity

## Example Request Bodies

All endpoints include example request bodies. You can modify them as needed:

- Update email/password for authentication
- Change assessment types
- Modify progress scores
- Update learning roles

## Need Help?

If you encounter any issues:

1. Check the server logs for errors
2. Verify your `.env` file is configured correctly
3. Ensure the database is running and migrations are applied
4. Review the main README.md for setup instructions
