/**
 * "Memories" — social-style posts on the Gallery page (status + photos), managed in /admin → Memories.
 * These seeds are shown until the database has posts (supabase/schema.sql inserts the same ones).
 */
export type Memory = {
  id: string;
  body: string;
  images: string[];
  location: string;
  feeling: string;
  date: string; // ISO
  pinned: boolean;
  published: boolean;
  /** Photo layout: "fill" crops to the grid, "fit" shows the whole picture. */
  photoFit?: PhotoFit;
  /** Which part of a cropped photo stays visible. */
  photoFocus?: PhotoFocus;
  /** Height of the photo area. */
  photoSize?: PhotoSize;
};

export type PhotoFit = "fill" | "fit";
export type PhotoFocus = "top" | "center" | "bottom";
export type PhotoSize = "compact" | "normal" | "large";
export const photoFits: PhotoFit[] = ["fill", "fit"];
export const photoFocuses: PhotoFocus[] = ["top", "center", "bottom"];
export const photoSizes: PhotoSize[] = ["compact", "normal", "large"];

export const memoryFeelings = ["", "proud", "grateful", "excited", "accomplished", "motivated", "happy", "thankful", "inspired"] as const;

export const seedMemories: Memory[] = [
  {
    id: "seed-graduation",
    body: "Graduation day! 🎓 Proud to have completed my Master of Administrative Science in Computer Security and Forensic Administration at Fairleigh Dickinson University. Thank you to my family, professors and friends who supported me throughout this journey.",
    images: ["/images/gallery/commencement.jpg", "/images/gallery/graduation-portrait.jpg"],
    location: "Fairleigh Dickinson University, Vancouver",
    feeling: "proud",
    date: "2025-05-20T18:00:00.000Z",
    pinned: true,
    published: true,
    photoFit: "fill",
    photoFocus: "top",
    photoSize: "large",
  },
  {
    id: "seed-iciet",
    body: "Throwback to presenting our research “Risk Prediction of Stroke at The Early Stage Using Data Mining Techniques” at the 2nd International Conference on Innovation in Engineering and Technology (ICIET-2019), University of Dhaka.",
    images: ["/images/works/iciet-2019-certificate.jpg"],
    location: "University of Dhaka, Bangladesh",
    feeling: "grateful",
    date: "2019-12-24T10:00:00.000Z",
    pinned: false,
    published: true,
  },
  {
    id: "seed-hackathon",
    body: "Champion of the Software Hackathon at LICT SUST Techfest 2019 with team MU-EDU GEN. Two days of building, debugging and very little sleep — worth every minute.",
    images: ["/images/certificates/sust-techfest-2019-hackathon-champion.jpg"],
    location: "Shahjalal University of Science & Technology, Sylhet",
    feeling: "excited",
    date: "2019-04-20T15:00:00.000Z",
    pinned: false,
    published: true,
  },
];
