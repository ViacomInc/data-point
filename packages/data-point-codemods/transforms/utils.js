function getEntityKeyRegexFn (entityId) {
  const r = new RegExp(`^${entityId}:.+`)
  return key => r.test(key)
}

/*
find entities that are defined with object literals:

const data = {
  'hash:thing1': {
    value: {}
  },
  entities: {
    'hash:thing2: {
      value: {}
    }
  }
}
*/
function getEntityObjectFromProperties (entityId, j, root) {
  return root
    .find(j.Property, {
      key: {
        type: 'Literal',
        value: getEntityKeyRegexFn(entityId)
      }
    })
    .map(node => node.get('value'))
}

/*
find entities that are defined by assignment:

const data = {}
data['hash:thing'] = {
  value: {}
}
*/
function getEntityObjectFromAssignments (entityId, j, root) {
  return root
    .find(j.AssignmentExpression, {
      left: {
        type: 'MemberExpression',
        property: {
          value: getEntityKeyRegexFn(entityId)
        }
      }
    })
    .map(path => path.get('right'))
}

function getEntityObjects (entityId, j, root) {
  return [
    getEntityObjectFromProperties(entityId, j, root),
    getEntityObjectFromAssignments(entityId, j, root)
  ]
}

module.exports.getEntityObjects = getEntityObjects
