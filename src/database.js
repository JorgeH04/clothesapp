const mongoose = require('mongoose');

  mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true 
  }) 
      .then(db => console.log(`DB is connected`))
      .catch(err => console.error(err));  

 // mongoose.connect('mongodb://<grandma>:<terremototo001>@ds253398.mlab.com:53398/grandma', {
 // useCreateIndex: true,
 // useNewUrlParser: true
//})
  //.then(db => console.log('DB is connected'))
  //.catch(err => console.error(err));