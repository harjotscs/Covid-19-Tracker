const express=require('express')
const bent=require('bent')
const getJSON = bent('json')
const hbs=require('hbs')
const path=require('path')

const port=process.env.PORT
const partialDirectoryPath=path.join(__dirname,'../views/partials')
const publicDirectoryPath=path.join(__dirname,'../public')

const app=express()
app.set('view engine','hbs')

app.use(express.static(publicDirectoryPath))
hbs.registerPartials(partialDirectoryPath)

var data
const name='Harjot Singh'

const run=async()=>{
    data = await getJSON('https://api.apify.com/v2/key-value-stores/tVaYRsPHLjNdNBu7S/records/LATEST?disableRedirect=true')
    data.forEach((country)=>{
        total=(country.infected+country.deceased+country.recovered).toString()
        country.total=total.replace('NA','')
    })
}

var conversion=async(updateDate)=>{
    var date1 = new Date(updateDate);
    var today=new Date()
    var diffMs = (today-date1);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    return diffMins
}

app.get('/',async (req,res)=>{
    await run();
    res.render('index',{
        data,
        name,
        title:'COVID Statistics'
    })
})

const moredetails=async(country)=>{
    const body=await data.filter((body)=>{
        if(body.country===country)
        return body
    })
    return body[0].moreData

}


app.get('/moreData/:country',async(req,res)=>{
    try{
        if(!data)
        await run();
        const link=await moredetails(req.params.country)
        const moreData=await getJSON(link)
        const {activeCases,recovered,deaths,totalCases,sourceUrl,lastUpdatedAtApify,infected,deceased,regionData}=moreData
        total=recovered+infected+deceased
        const lastUpdated=await conversion(lastUpdatedAtApify)
        res.render('details',{ 
        title:`COVID Statistics Of ${req.params.country}`,
        activeCases,recovered,deaths,totalCases,sourceUrl,lastUpdated,infected,deceased,
        regionData,
        name,
        total
    })
    }catch(e){
        console.log(e)
        res.send('Something Went Wrong Please Refresh The Homepage')
    }
    
})

app.get('/about',(req,res)=>{
    res.redirect('https://github.com/harjotscs')
})

app.get('/help',(req,res)=>{
    res.redirect('https://github.com/harjotscs')
})

app.listen(port,()=>{
    console.log(`Server Up And Running On Port ${port}`)
})