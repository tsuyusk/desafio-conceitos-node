const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function findSelectedRepositoryIndex(id) {
  return repositories.findIndex((repository) => repository.id === id);
}

function hasId(request, response, next) {
  const { id } = request.params;

  const selectedRepositoryIndex = findSelectedRepositoryIndex(id);

  if (selectedRepositoryIndex < 0) {
    return response.status(400).json({ message: "Repository not found." });
  }

  return next();
}

app.use("/repositories/:id", hasId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const githubUrlRegEx = /^(https:\/\/github.com\/)/;
  
  if (!githubUrlRegEx.exec(url)) {
    return response.status(400).json({ message: "Invalid URL." });
  }
  if (!title || !url || !techs) {
    return response
      .status(400)
      .json({ message: "Required a Title, a URL and a Techs list." });
  }


  if(title.trim() === "" || url.trim() === "" || techs.length === 0) {
    return response
    .status(400)
    .json({ message: "One of the parameters is empty." })
  }

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs, likes } = request.body;

  const selectedRepositoryIndex = findSelectedRepositoryIndex(id);

  if (likes) {
    const { likes } = repositories[selectedRepositoryIndex];
    return response.json({
      likes,
    });
  }

  if (!title && !url && !techs) {
    return response.status(400).json({
      message:
        "In order to update a repository, You need to send at least one parameter: Title, URL or Techs.",
    });
  }

  const newRepository = {
    ...repositories[selectedRepositoryIndex],
    ...(title ? { title } : {}),
    ...(url ? { url } : {}),
    ...(techs ? { techs } : {}),
  };
  repositories[selectedRepositoryIndex] = newRepository;

  return response.json(newRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const selectedRepositoryIndex = findSelectedRepositoryIndex(id);

  repositories.splice(selectedRepositoryIndex, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const selectedRepositoryIndex = findSelectedRepositoryIndex(id);

  repositories[selectedRepositoryIndex].likes++;
  const { likes } = repositories[selectedRepositoryIndex];
  return response.json({ likes });
});

module.exports = app;
