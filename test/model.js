var config = require(__dirname+'/../config.js');
var thinky = require(__dirname+'/../lib/thinky.js')(config);
var r = thinky.r;

var util = require(__dirname+'/util.js');
var assert = require('assert');

describe('createModel', function(){
    var name = util.s8(), model;
    it('Create a new model', function(){
        model = thinky.createModel(name, {id: String, name: String})
        assert(model);
    });
    it('Check if the table was created', function(done){
        model.on("ready", function() {
            r.tableList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    assert.notEqual(result.indexOf(name), -1)
                    done();
                }).error(done);
            }).error(done)
        });
    });
    it('Create multiple models', function(){
        var name1 = util.s8();
        var model1 = thinky.createModel(name1, {id: String, name: String})

        var name2 = util.s8();
        var model2 = thinky.createModel(name2, {id: String, name: String})

        assert(model1 !== model2);
    });
});
describe('[_]getModel', function(){
    it('_getModel', function(){
        var name = util.s8();
        var model = thinky.createModel(name, {id: String, name: String}, {init: false})
        assert(model._getModel().hasOwnProperty('_name'));
    });
    it('getTableName', function(){
        var name = util.s8();
        var model = thinky.createModel(name, {id: String, name: String}, {init: false})
        assert(model.__proto__.__proto__.hasOwnProperty('getTableName'));
        assert.equal(model.getTableName(), name);
    });

});
describe('Model', function() {
    var name = util.s8();

    var Model;
    before(function() {
        Model = thinky.createModel(name, { str: String });
    });
    it('Create a new instance of the Model', function() {
        var str = util.s8();
        var doc = new Model({str: str});

        assert(util.isPlainObject(doc));
        assert.equal(doc.str, str);
    });
    it('Create two instances with the same argument of the Model', function() {
        var str = util.s8();
        var docValues = {str: str};
        var doc1 = new Model(docValues);
        var doc2 = new Model(docValues);

        assert.notStrictEqual(doc1, doc2);
    });

    it('Two instances should be different', function() {
        var str1 = util.s8();
        var str2 = util.s8();
        var doc1 = new Model({str: str1});
        assert.equal(doc1.str, str1);

        var doc2 = new Model({str: str2});
        assert.equal(doc2.str, str2);

        assert.equal(doc1.str, str1);
        assert.notEqual(doc1, doc2);
    });
    it('Two instances should have different prototypes', function() {
        var str1 = util.s8();
        var str2 = util.s8();
        var doc1 = new Model({str: str1});
        var doc2 = new Model({str: str2});

        assert.notEqual(doc1.__proto__, doc2.__proto__);
    });
    it('Two instances should have the same model', function() {
        var str1 = util.s8();
        var str2 = util.s8();
        var doc1 = new Model({str: str1});
        var doc2 = new Model({str: str2});

        assert.equal(doc1.getModel(), doc2.getModel());
    });
    
    it('Docs from different models should not interfer', function() {
        var str = util.s8();
        var doc = new Model({str: str});

        var otherName = util.s8();
        var OtherModel = thinky.createModel(otherName, { str: String });

        var otherStr = util.s8();
        var otherDoc = new OtherModel({str: otherStr});

        assert.equal(doc.str, str);
        assert.equal(otherDoc.str, otherStr);

        assert.notEqual(otherDoc.getModel(), doc.getModel());
        assert.equal(doc.getModel().getTableName(), name);
        assert.equal(otherDoc.getModel().getTableName(), otherName);
    });
});

describe("Joins", function() {
    it('hasOne should save the join', function() {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String});

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, otherId: String });

        model.hasOne(otherModel, "otherDoc", "id", "otherId");
        assert(model._getModel()._joins["otherDoc"])
    });
    it('hasOne should throw if it uses a field already used by another relation', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, otherId: String }, {init: false});

        var anotherName = util.s8();
        var anotherModel = thinky.createModel(anotherName, { id: String, otherId: String }, {init: false});


        model.hasOne(otherModel, "otherDoc", "id", "otherId", {init: false});
        try{
            model.hasOne(anotherModel, "otherDoc", "id", "otherId");
        }
        catch(err) {
            assert.equal(err.message, "The field `otherDoc` is already used by another relation.")
            done();
        }
    });
    it('belongsTo should throw if it uses a field already used by another relation', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, otherId: String }, {init: false});

        var anotherName = util.s8();
        var anotherModel = thinky.createModel(anotherName, { id: String, otherId: String }, {init: false});


        model.belongsTo(otherModel, "otherDoc", "id", "otherId", {init: false});
        try{
            model.belongsTo(anotherModel, "otherDoc", "id", "otherId");
        }
        catch(err) {
            assert.equal(err.message, "The field `otherDoc` is already used by another relation.")
            done();
        }
    });
    it('hasMany should throw if it uses a field already used by another relation', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, otherId: String }, {init: false});

        var anotherName = util.s8();
        var anotherModel = thinky.createModel(anotherName, { id: String, otherId: String }, {init: false});


        model.hasMany(otherModel, "otherDoc", "id", "otherId", {init: false});
        try{
            model.hasMany(anotherModel, "otherDoc", "id", "otherId");
        }
        catch(err) {
            assert.equal(err.message, "The field `otherDoc` is already used by another relation.")
            done();
        }
    });
    it('hasAndBelongsToMany should throw if it uses a field already used by another relation', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, otherId: String }, {init: false});

        var anotherName = util.s8();
        var anotherModel = thinky.createModel(anotherName, { id: String, otherId: String }, {init: false});


        model.hasAndBelongsToMany(otherModel, "otherDoc", "id", "otherId", {init: false});
        try{
            model.hasAndBelongsToMany(anotherModel, "otherDoc", "id", "otherId");
        }
        catch(err) {
            assert.equal(err.message, "The field `otherDoc` is already used by another relation.")
            done();
        }
    });
    it('hasOne should throw if the first argument is not a model', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        try{
            model.hasOne(function() {}, "otherDoc", "otherId", "id");
        }
        catch(err) {
            assert.equal(err.message, "First argument of `hasOne` must be a Model");
            done();
        }
    });
    it('belongsTo should throw if the first argument is not a model', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        try{
            model.belongsTo(function() {}, "otherDoc", "otherId", "id");
        }
        catch(err) {
            assert.equal(err.message, "First argument of `belongsTo` must be a Model");
            done();
        }
    });
    it('hasMany should throw if the first argument is not a model', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        try{
            model.hasMany(function() {}, "otherDoc", "otherId", "id");
        }
        catch(err) {
            assert.equal(err.message, "First argument of `hasMany` must be a Model");
            done();
        }
    });
    it('hasAndBelongsToMany should throw if the first argument is not a model', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String}, {init: false});

        try{
            model.hasAndBelongsToMany(function() {}, "otherDoc", "otherId", "id");
        }
        catch(err) {
            assert.equal(err.message, "First argument of `hasAndBelongsToMany` must be a Model");
            done();
        }
    });
    it('hasOne should create an index on the other model', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String, foreignKeyName: String });

        var foreignKey = util.s8();

        var otherName = util.s8();
        var schema = {id: String};
        schema[foreignKey] = String;
        var otherModel = thinky.createModel(otherName, schema);

        model.hasOne(otherModel, "otherDoc", "modelId", foreignKey);

        otherModel.on("ready", function() {
            r.table(otherModel.getTableName()).indexList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    r.table(otherModel.getTableName()).indexWait(foreignKey).run().then(function() {
                        done();
                    }).error(done);
                });

            }).error(done);

        })
    });
    it('BelongsTo should create an index on the model called', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String, otherId: String });

        var foreignKey = util.s8();

        var otherName = util.s8();
        var schema = {id: String};
        schema[foreignKey] = String;
        var otherModel = thinky.createModel(otherName, schema);

        model.belongsTo(otherModel, "otherDoc", foreignKey, "otherId");

        model.on("ready", function() {
            r.table(model.getTableName()).indexList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    r.table(model.getTableName()).indexWait(foreignKey).run().then(function() {
                        done();
                    }).error(done);
                });

            }).error(done);

        })
    });
    it('hasMany should create an index on the other model', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String });

        var foreignKey = util.s8();

        var otherName = util.s8();
        var schema = {id: String};
        schema[foreignKey] = String;
        var otherModel = thinky.createModel(otherName, schema);

        model.hasMany(otherModel, "otherDocs", "modelId", foreignKey);

        otherModel.on("ready", function() {
            r.table(otherModel.getTableName()).indexList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    r.table(otherModel.getTableName()).indexWait(foreignKey).run().then(function() {
                        done();
                    }).error(done);
                });

            }).error(done);
        })
    });

    it('hasAndBelongsToMany should create an index on this table', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String, notid1: String });

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, notid2: String });

        model.hasAndBelongsToMany(otherModel, "otherDocs", "notid1", "notid2");

        var linkName;
        if(model.getTableName() < otherModel.getTableName()) {
            linkName = model.getTableName()+"_"+otherModel.getTableName();
        }
        else {
            linkName = otherModel.getTableName()+"_"+model.getTableName();
        }

        model.on("ready", function() {
            r.table(model.getTableName()).indexList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    r.table(model.getTableName()).indexWait("notid1").run().then(function() {
                        done();
                    }).error(done);
                });

            }).error(done);
        })
    });

    it('hasAndBelongsToMany should create an index on the joined table', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String, notid1: String });

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, notid2: String });

        model.hasAndBelongsToMany(otherModel, "otherDocs", "notid1", "notid2");

        var linkName;
        if(model.getTableName() < otherModel.getTableName()) {
            linkName = model.getTableName()+"_"+otherModel.getTableName();
        }
        else {
            linkName = otherModel.getTableName()+"_"+model.getTableName();
        }

        otherModel.on("ready", function() {
            r.table(otherModel.getTableName()).indexList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    r.table(otherModel.getTableName()).indexWait("notid2").run().then(function() {
                        done();
                    }).error(done);
                });

            }).error(done);
        })
    });

    it('hasAndBelongsToMany should create a linked table with indexes', function(done) {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String, notid1: String });

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, notid2: String });

        model.hasAndBelongsToMany(otherModel, "otherDocs", "notid1", "notid2");

        var linkName;
        if(model.getTableName() < otherModel.getTableName()) {
            linkName = model.getTableName()+"_"+otherModel.getTableName();
        }
        else {
            linkName = otherModel.getTableName()+"_"+model.getTableName();
        }

        var numReady = 0;

        model.on('ready', function() {
            r.table(linkName).indexList().run().then(function(cursor) {
                cursor.toArray().then(function(result) {
                    r.table(otherModel.getTableName()).indexWait("notid2").run().then(function() {
                        done();
                    }).error(done);
                });
            }).error(done);
        });
    });
    it('_order is reserved ', function() {
        var name = util.s8();
        var model = thinky.createModel(name, { id: String, notid1: String }, {init: false});

        var otherName = util.s8();
        var otherModel = thinky.createModel(otherName, { id: String, notid2: String }, {init: false});

        assert.throws(function() {
            model.hasOne(otherModel, "_order", "notid1", "notid2", {init: false});
        }, function(error) {
            return (error instanceof Error) && (error.message === "The field `_order` is reserved by thinky. Please use another one.")
        });
        assert.throws(function() {
            model.hasMany(otherModel, "_order", "notid1", "notid2", {init: false});
        }, function(error) {
            return (error instanceof Error) && (error.message === "The field `_order` is reserved by thinky. Please use another one.")
        });
        assert.throws(function() {
            model.belongsTo(otherModel, "_order", "notid1", "notid2", {init: false});
        }, function(error) {
            return (error instanceof Error) && (error.message === "The field `_order` is reserved by thinky. Please use another one.")
        });
        assert.throws(function() {
            model.hasAndBelongsToMany(otherModel, "_order", "notid1", "notid2", {init: false});
        }, function(error) {
            return (error instanceof Error) && (error.message === "The field `_order` is reserved by thinky. Please use another one.")
        });
    });
});

describe('define', function(){
    it('Should be added on the document', function(done) {
        var Model = thinky.createModel(util.s8(), { id: String, num: Number }, {init: false});
        Model.define('foo', function() { done() });
        var doc = new Model({});
        doc.foo();
    });
    it('this should refer to the doc', function(done) {
        var str = util.s8();
        var Model = thinky.createModel(util.s8(), { id: String, num: Number }, {init: false});
        Model.define('foo', function() { assert.equal(this.id, str); done() });
        var doc = new Model({id: str});
        doc.foo();
    });
});
describe('ensureIndex', function(){
    it('should add an index', function(done) {
        var Model = thinky.createModel(util.s8(), { id: String, num: Number });
        Model.ensureIndex("num");
        var doc = new Model({});
        doc.save().then(function(result) {
            Model.orderBy({index: "num"}).run().then(function(result) {
                done();
            });
        });
    });
});
