import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';


export const options: Options = {
  stages: [
    { duration: '30s', target: 500},  // Ramp-up: from 0 to 20 virtual users (VUs) over 30 seconds
    { duration: '1m', target: 500 },   // Hold: stay at 20 VUs for 1 minute
    { duration: '30s', target: 0 },   // Ramp-down: back to 0 VUs over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

export default function () {
  // 1. List all the different pages you want to test
  const urls = [
    'http://localhost:3000/dashboard',
    'http://localhost:3000/dashboard/repositories',
    'http://localhost:3000/dashboard/my-profile',
  ];
  
  // Pick a random page from the list every time a virtual user loops
  const url = urls[Math.floor(Math.random() * urls.length)]; 
  
  // 2. Add your Clerk session cookie here
  const params = {
    headers: {
      // Paste your __session cookie value here
      Cookie: '__session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zQkR6TW9wNUxMYnVQU3loZUNRYjJTQnNwaWkiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NzQxNjU5OTUsImZ2YSI6WzIxMjAsLTFdLCJpYXQiOjE3NzQxNjU5MzUsImlzcyI6Imh0dHBzOi8vc291Z2h0LWxlbW1pbmctNzAuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzc0MTY1OTI1LCJzaWQiOiJzZXNzXzNCRTA1b0F0VVVYNnVyUkViNE9LVGR5c2twbyIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfM0JFMDVwRlR3MG9pbEN3Rjg3Tm9CSWtNRTgzIiwidiI6Mn0.CqNZDT4vte_qA-O5ccAT8R-oicBAbB1SAP5xmgvE2iWPus9GaezsiEnbt3j_F5Z4L91JXD7xYt-t19Vx8kHKZZi7T56j0Blp-_Sal4Ve_qHb12Ppjq7dKPR15Fl3mXH4ElbjImLK8bYwxFLug1HYkXIn1cqGUJ2LeDP4KyFvCdAr30ffTz9cIzI8sjQkC5CmhY58rXj_g_gcIWAyYDw3f0mHzqMMMERi3tol_Jyno-S3sQl1mlAXjAVS7npNonHIFoVDLGTKqhxyEX1tu6wd2jMXIjXait3L0f-au2P2ANtWp_aLIyTQd_0_Q3gHfsRTle4edeAri8ilbkjgSzWdPQ',
    },
  };

  // 3. Make the request with the headers included
  const res = http.get(url, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); 
}
