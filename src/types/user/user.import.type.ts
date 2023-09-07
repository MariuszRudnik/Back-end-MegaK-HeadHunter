export type rating = 0 | 1 | 2 | 3 | 4 | 5;

export interface UserImport {
  email: string;
  courseCompletion: rating;
  courseEngagment: rating;
  projectDegree: rating;
  teamProjectDegree: rating;
  bonusProjectUrls: string[];
}
