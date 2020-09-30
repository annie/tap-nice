const tape = require("tape");

tape("first set of failures", (t) => {
  t.deepEqual(1, 2, "one is deeply not two");
  t.deepEqual(2, 1, "two is deeply not one");
  t.end();
});

tape("these should pass", (t) => {
  t.deepEqual(1, 1, "one is deeply one");
  t.deepEqual(2, 2, "two is deeply two");
  t.end();
});

tape("another test", (t) => {
  t.equal(1, 2, "one is not two");
  t.equal(2, 1, "two is not one");
  t.end();
});
