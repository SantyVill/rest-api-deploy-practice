const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const { validateMovie,validatePartialMovie } = require("./Schema/movies");  // Cambiado a minúsculas

const app = express();
app.use(express.json());
app.disable("x-powered-by");

app.get("/", (req, res) => {
    res.json({ message: "Hola mundo" });
});

const ACCEPTED_ORIGINS = [
    'http://localhost:1234',
    'http://localhost:3000',
    'http://localhost:8080',
]

app.get("/movies", (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin)|| !origin) {
        res.header('Access-Control-Allow-Origin',origin)
    }
    const { genero } = req.query;
    if (genero) {
        const filterMovies = movies.filter(
            movie => movie.genero.some(g => g.toLowerCase() === genero.toLowerCase())
        );
        res.json(filterMovies);
    }
    res.json(movies);
});

app.get("/movies/:id", (req, res) => {
    const { id } = req.params;
    const movie = movies.find(movie => movie.id == id);
    if (movie) return res.json(movie);
    res.status(404).json({ message: "Movie not found" });
});

app.get("/movies/", (req, res) => {
    const { genero } = req.params;
    const movie = movies.find(movie => movie.genero == genero);
    if (movie) return res.json(movies);
    res.status(404).json({ message: "Movie not found" });
});

app.post("/movies", (req, res) => {
    const resultado = validateMovie(req.body);  // Cambiado a minúsculas

    if (resultado.error) {
        const errorMessages = resultado.error.errors.map(err => err.message);
        return res.status(404).json({ message: "Hubo un error al intentar cargar la película: " + errorMessages.join(", ") });
    }
    const newMovie = {
        id: crypto.randomUUID(),
        ...resultado.data
    };
    movies.push(newMovie);
    res.status(201).json(movies);
});

app.patch("/movies/:id",(req,res)=>{
    const result= validatePartialMovie(req.body);
    if (result.error) {
        res.status(404).json({message: JSON.parse(result.error.message) })
    }
    
    const {id} = req.params;
    const movieIndex = movies.findIndex(movie=>movie.id==id);

    if (movieIndex <0) res.status(404).json({message:"No se encontro la pelicula"})

    
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    
    movies[movieIndex]=updateMovie

    return res.json(updateMovie)
})

app.delete("/movies/:id",(req,res)=>{
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin)|| !origin) {
        res.header('Access-Control-Allow-Origin',origin)
    }

    const {id} = req.params
    const movieIndex = movies.findIndex(movie=>movie.id==id)

    if (movieIndex<0) {
        return res.status(404).json({message:"No se encontro la pelicula"})
    }

    movies.splice(movieIndex,1)

    return res.json({message:"Pelicula Eliminada"})
})

app.options('/movies/:id',(req,res)=>{
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin)|| !origin) {
        res.header('Access-Control-Allow-Origin',origin)
        res.header('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
    }
    res.send(200);
})

const PORT = process.env.PORT ?? 1234;


app.listen(PORT, () => {
    console.log("server listening on port : http://localhost:" + PORT);
});
