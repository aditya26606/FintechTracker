const fs = require('fs');
const path = require('path');
const { getDBMode } = require('./db');


const models = {
  User: require('../models/User'),
  Expense: require('../models/Expense'),
  Budget: require('../models/Budget'),
  SavingsGoal: require('../models/SavingsGoal'),
  Achievement: require('../models/Achievement'),
  Report: require('../models/Report')
};

const DATA_DIR = path.join(__dirname, '../database/data');


const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};


const jsonDB = {
  getFile: (modelName) => {
    const filePath = path.join(DATA_DIR, `${modelName}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
    return filePath;
  },

  read: (modelName) => {
    const file = jsonDB.getFile(modelName);
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data || '[]');
  },

  write: (modelName, data) => {
    const file = jsonDB.getFile(modelName);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  },

  matches: (item, query) => {
    for (const key in query) {
      const qVal = query[key];
      const iVal = item[key];

      
      if (key === 'preferences' && typeof qVal === 'object') {
        for (const prefKey in qVal) {
          if (!item.preferences || item.preferences[prefKey] !== qVal[prefKey]) return false;
        }
        continue;
      }

      
      if (qVal && typeof qVal === 'object') {
        if (qVal.$gte || qVal.$lte) {
          const itemTime = new Date(iVal).getTime();
          if (qVal.$gte && itemTime < new Date(qVal.$gte).getTime()) return false;
          if (qVal.$lte && itemTime > new Date(qVal.$lte).getTime()) return false;
          continue;
        }
      }

      
      const qStr = qVal ? qVal.toString() : '';
      const iStr = iVal ? iVal.toString() : '';
      
      if (key === 'email') {
        if (iStr.toLowerCase() !== qStr.toLowerCase()) return false;
      } else {
        if (iStr !== qStr) return false;
      }
    }
    return true;
  }
};

const dbHelper = {
  find: async (modelName, query = {}, sort = null) => {
    if (getDBMode() === 'mongodb') {
      let q = models[modelName].find(query);
      if (sort) q = q.sort(sort);
      return await q.exec();
    } else {
      let list = jsonDB.read(modelName);
      list = list.filter(item => jsonDB.matches(item, query));
      
      
      if (sort) {
        const sortKey = Object.keys(sort)[0];
        const sortOrder = sort[sortKey]; 
        list.sort((a, b) => {
          let valA = a[sortKey];
          let valB = b[sortKey];
          if (sortKey === 'date' || sortKey === 'createdAt') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }
          if (valA < valB) return -1 * sortOrder;
          if (valA > valB) return 1 * sortOrder;
          return 0;
        });
      }
      return list;
    }
  },

  findOne: async (modelName, query = {}) => {
    if (getDBMode() === 'mongodb') {
      return await models[modelName].findOne(query).exec();
    } else {
      const list = jsonDB.read(modelName);
      const found = list.find(item => jsonDB.matches(item, query));
      return found || null;
    }
  },

  findById: async (modelName, id) => {
    if (getDBMode() === 'mongodb') {
      return await models[modelName].findById(id).exec();
    } else {
      const list = jsonDB.read(modelName);
      const found = list.find(item => item._id === id || item.id === id);
      return found || null;
    }
  },

  create: async (modelName, data) => {
    if (getDBMode() === 'mongodb') {
      const model = new models[modelName](data);
      return await model.save();
    } else {
      const list = jsonDB.read(modelName);
      const newItem = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        ...data
      };
      
      newItem.id = newItem._id;
      list.push(newItem);
      jsonDB.write(modelName, list);
      return newItem;
    }
  },

  findByIdAndUpdate: async (modelName, id, updateData) => {
    if (getDBMode() === 'mongodb') {
      return await models[modelName].findByIdAndUpdate(id, updateData, { new: true }).exec();
    } else {
      const list = jsonDB.read(modelName);
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;

      
      const updatedItem = { ...list[index] };
      
      
      for (const key in updateData) {
        if (key === 'preferences' && typeof updateData[key] === 'object') {
          updatedItem.preferences = {
            ...updatedItem.preferences,
            ...updateData[key]
          };
        } else if (key === 'categoryBudgets' && typeof updateData[key] === 'object') {
          
          updatedItem.categoryBudgets = {
            ...updatedItem.categoryBudgets,
            ...updateData[key]
          };
        } else {
          updatedItem[key] = updateData[key];
        }
      }
      
      list[index] = updatedItem;
      jsonDB.write(modelName, list);
      return updatedItem;
    }
  },

  findByIdAndDelete: async (modelName, id) => {
    if (getDBMode() === 'mongodb') {
      return await models[modelName].findByIdAndDelete(id).exec();
    } else {
      const list = jsonDB.read(modelName);
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;

      const deletedItem = list[index];
      list.splice(index, 1);
      jsonDB.write(modelName, list);
      return deletedItem;
    }
  },

  count: async (modelName, query = {}) => {
    if (getDBMode() === 'mongodb') {
      return await models[modelName].countDocuments(query).exec();
    } else {
      const list = jsonDB.read(modelName);
      const filtered = list.filter(item => jsonDB.matches(item, query));
      return filtered.length;
    }
  }
};

module.exports = dbHelper;
