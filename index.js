import dotenv from "dotenv";
dotenv.config();
import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
//PORT
const PORT = process.env.PORT || 8000;
// logging middleware
app.use(morgan("dev"));
//cookie parser middleware
app.use(cookieParser());

// security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
    ],
  }),
);
app.use(hpp());
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

// API Routes

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the LMS API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on the Port ${PORT}`);
});
