/**
 * "Selected work" cards on the Achievements page — research, project leadership, field work.
 * Editable from /admin → Content → Selected work. Text below is taken from the source documents.
 */
export type WorkCategory = "Research" | "Project lead" | "Field work" | "Certificate" | "Documentation" | "Other";
export const workCategories: WorkCategory[] = ["Research", "Project lead", "Field work", "Certificate", "Documentation", "Other"];

export type WorkItem = {
  id: string;
  title: string;
  category: WorkCategory;
  org: string;
  date: string;
  role: string;
  summary: string;
  points: string[];
  metrics: { label: string; value: string }[];
  image: string;
  imageCaption: string;
  document: string;
  documentLabel: string;
  link: string;
  tags: string[];
  featured: boolean;
  published: boolean;
};

export const works: WorkItem[] = [
  {
    id: "iciet-2019-stroke",
    title: "Risk Prediction of Stroke at The Early Stage Using Data Mining Techniques",
    category: "Research",
    org: "2nd ICIET-2019 · University of Dhaka",
    date: "December 23–24, 2019",
    role: "Lead author · presenter (Metropolitan University, Sylhet)",
    summary:
      "Built a dataset of common stroke risk factors from a direct questionnaire (635 patients; 606 after cleaning, 15 attributes) collected at hospitals in Sylhet, Bangladesh, then compared Naïve Bayes, Random Forest, Random Tree and SVM classifiers using 10-fold cross-validation and an 80:20 percentage split. Random Forest performed best; a CART decision tree was implemented in Python (Jupyter) and a bilingual (Bengali / English) knowledge-based web tool was proposed for end users.",
    points: [
      "Presented at the 2nd International Conference on Innovation in Engineering and Technology (ICIET-2019), Nabab Nawab Ali Chowdhury Senate Bhaban, University of Dhaka.",
      "Data collected from Sylhet Women’s Medical College & Hospital and Jalalabad Ragib-Rabeya Medical College & Hospital.",
      "Random Forest: 84.16% correctly classified (10-fold CV) and 80.99% (80:20 split).",
      "Random Tree 80.69%, SVM 74.42%, Naïve Bayes 74.09% with 10-fold cross-validation.",
      "Python CART decision tree (Gini index) reached 80.33% mean accuracy.",
    ],
    metrics: [
      { label: "Patients surveyed", value: "635" },
      { label: "Best accuracy (RF, 10-fold)", value: "84.16%" },
      { label: "Risk-factor attributes", value: "15" },
      { label: "Algorithms compared", value: "4" },
    ],
    image: "/images/works/iciet-2019-certificate.jpg",
    imageCaption: "Certificate of participation & paper presentation — ICIET-2019",
    document: "/docs/stroke-risk-prediction-iciet-2019.pdf",
    documentLabel: "Read the paper (PDF)",
    link: "",
    tags: ["Data mining", "Machine learning", "Random Forest", "Python", "Healthcare"],
    featured: true,
    published: true,
  },
];
