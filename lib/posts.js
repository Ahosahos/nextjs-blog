import path from "path";
import matter from "gray-matter";
const fs = require("fs");
import { remark } from "remark";
import html from "remark-html";

const postDirectory = path.join(process.cwd(), "posts");
const mdExtRegex = new RegExp(/\.md$/);

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postDirectory);
  const allPostsData = fileNames.map((fileName) => {
    //remove .d form file name to get id
    const id = fileName.replace(mdExtRegex, "");

    //Read markdown file
    const fullPath = path.join(postDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    //Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });

  return allPostsData.sort((a, b) => a.date < b.date);
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return { params: { id: fileName.replace(mdExtRegex, "") } };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  //use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  //use remark tp convert markdown into html string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
