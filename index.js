import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import nosql from 'nosql'
import axios from 'axios'
import CircularJSON from "circular-json"
import cache from "memory-cache"

const app = express();
const db = nosql.load('./database/beers.nosql')

app.use(morgan("tiny"));
app.use(cors());
app.use(bodyParser.json());

app.use('/', (req, res, next) => {
    const email = JSON.stringify(req.headers["x-user"])
    console.log(email)
    if(email){
        const re = /@.*?\./;
        const validEmail = re.test(email.toLowerCase());
        if(validEmail){
            next()
        }
        else{
            res.status(500).send("Invalid email address")
        }
    }
    else{
        res.status(500).send("An unexpected error has occurred")
    }
});

app.get('/beers', async (req, res, next)=> {
    const beer_name = req.body.beer_name
    let cache_name = beer_name
    if(!beer_name || beer_name === "")
        cache_name = "all_beer"
    if(cache.get(cache_name)) {
        res.send({"status": 200, "error": null, "response": CircularJSON.stringify(cache.get(cache_name))});
    }
    else{
        try{
            axios("https://api.punkapi.com/v2/beers", {
                method: "GET",
                params:{
                    beer_name: beer_name
                }
            }).then(results => {
                if(results){
                    cache.put(cache_name,results.data)
                    res.send({"status": 200, "error": null, "response": CircularJSON.stringify(results.data)});
                }
                else{
                    res.send(JSON.stringify({"status": 500, "error": "Unexpected error occurred", "response": null}));
                }
            })
        }
        catch(error){
            res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
    }


});

app.get('/beers/rating', (req, res, next) => {
    const {id, rating, comments} = req.body
    try{
        db.set("beers",{id:{rating: rating, comments: comments}})
        res.send(JSON.stringify({"status": 200, "error": null, "response": null}));
    }
    catch(error){
        res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});

export default app