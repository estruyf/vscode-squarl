import axios from "axios";


export const fetchLinkDetails = async (link: string) => {
  try {
    const response = await axios.get(link, { timeout: 5000 });
    if (response.status === 200 && response.headers["content-type"] && response.headers["content-type"].includes("text/html")) {
      const data = response.data;
      const title = data.match(/<title>(.*?)<\/title>/i);
      const description = data.match(/<meta name="description" content="(.*?)"/i);
      return {
        title: title ? title[1] : "",
        description: description ? description[1] : ""
      }
    }
  } catch (error) {
    return undefined;
  }
}