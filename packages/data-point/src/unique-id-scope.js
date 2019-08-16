function uniqueIdScope() {
  let uid = 0;
  return () => {
    uid += 1;
    return uid;
  };
}

module.exports = uniqueIdScope;
