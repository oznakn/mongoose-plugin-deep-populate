
# mongoose-plugin-deep-populate

DeepPopulate plugin helps you do some auto population without thinking about depth, inspired from [mongoose-autopopulate](https://github.com/mongodb-js/mongoose-autopopulate).

## Installation

For now, just put ```index.js``` file in somewhere in your project, probably with name ```mongoose-plugin-deep-populate.js```.

And just call it from a model created JavaScript file

```javascript
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  ...
});

schema.plugin(require('./mongoose-plugin-deep-populate'));
```

Or install it for all schemas

```javascript
const mongoose = require('mongoose');

mongoose.plugin(require('./mongoose-plugin-deep-populate'));
```


## Usage

Let's create a School model

```javascript
const SchoolSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
  },
);

const School = mongoose.model('school', SchoolSchema);
```

And Student model

```javascript
const StudentSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    school: {
      type: Mongoose.SchemaTypes.ObjectId,
      ref: 'school',
    },
  },
);

const Student = mongoose.model('student', StudentSchema);
```

And ExamMark model

```javascript
const ExamMarkSchema = new mongoose.Schema(
  {
    student: {
      type: Mongoose.SchemaTypes.ObjectId,
      ref: 'student',
    },
    mark: {
      type: Number,
    }
  },
);

const ExamMark = mongoose.model('exammark', ExamMarkSchema);
```


And the only think we have to do to use the deep population plugin is add the deepPopulate option field

```javascript
const ExamMarkSchema = new mongoose.Schema(
  {
    ...
  },
  {
    deepPopulate: {
      student: {
        school: true,
      },
    },
  },
);
```

Or you want to populate only one deep level, you can also do

```javascript
const ExamMarkSchema = new mongoose.Schema(
  {
    ...
  },
  {
    deepPopulate: ['student'],
  },
);
```

And just call

```javascript
const examMark = await ExamMark.findOne({ _id: '...' });
```

And with doing that every time a query runs on ExamMark model, student and school of student fields automatically populated as nested. Now, deepPopulation only works on the queries on ExamMark model, since we add options to the only ExamMark model. Any query runs on Student model does not populate school field since we have not add the deepPopulation field to the student model.

___

To skip the deep population step, just use ```skipPopulation``` function

```javascript
const examMark = await ExamMark.findOne({ _id: '...' }).skipPopulation(true);
```


Default value of the ```skipPopulation``` function parameters is ```true```, so you can also do

```javascript
const examMark = await ExamMark.findOne({ _id: '...' }).skipPopulation();
```
