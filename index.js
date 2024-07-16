const express = require('express');
const cors = require('cors');
const port = 3000 || process.env.PORT;

const app = express()



app.get('/', (req, res) => {
    res.send("TEKA DE is running")
})
app.listen(port, ()=>{
    console.log(`TEKA DE is running on port: ${port}`)
})