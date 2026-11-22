export const projectRevision = async (project: {json: string; width: number; height: number}) => {
  const bytes = new TextEncoder().encode(JSON.stringify([project.json, project.width, project.height]));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
};
