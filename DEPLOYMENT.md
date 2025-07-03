# Deploying to Vercel

This guide explains how to deploy the Engineering Resource Management application to Vercel.

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [GitHub account](https://github.com/signup)
3. [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) for cloud database

## Deployment Steps

### 1. Deploy the Backend

1. Push your code to GitHub if you haven't already
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click "Add New..." > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Set the root directory to `server`
   - Framework preset: "Other"
   - Build command: Leave empty
   - Output directory: Leave empty
5. Add the following environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string for JWT token generation
   - `JWT_EXPIRE` - "30d"
   - `NODE_ENV` - "production"
   - `FRONTEND_URL` - The URL where your frontend will be deployed (add after frontend deployment)
6. Click "Deploy"
7. Note the deployment URL (e.g., `https://your-backend-app.vercel.app`)

### 2. Deploy the Frontend

1. Go back to [Vercel Dashboard](https://vercel.com/dashboard) and click "Add New..." > "Project"
2. Import the same GitHub repository
3. Configure the project:
   - Set the root directory to `client`
   - Framework preset: "Vite"
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add the following environment variables:
   - `VITE_API_URL` - The backend URL from step 1 (e.g., `https://your-backend-app.vercel.app`)
5. Click "Deploy"
6. Once deployed, copy the frontend URL

### 3. Update Backend with Frontend URL

1. Go to your backend project settings in Vercel
2. Update the `FRONTEND_URL` environment variable with your frontend URL
3. Redeploy the backend

## Testing the Deployment

1. Visit your frontend URL
2. Try logging in and using the application features
3. Check for any CORS or connection issues in the browser console

## Troubleshooting

- **CORS Issues**: Ensure the `FRONTEND_URL` in the backend matches your actual frontend domain
- **Database Connection**: Verify your MongoDB Atlas connection string and make sure your IP is whitelisted
- **JWT Auth**: If login works but protected routes fail, check the JWT configuration

## Notes

- The free tier of Vercel has some limitations for serverless functions
- Consider using Railway or Render for the backend if you encounter issues with Vercel's serverless architecture
