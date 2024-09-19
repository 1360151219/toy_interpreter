var a = 1;

function foo() {
  var a = 2;
  let b = 2;
  console.log(a, b);
}
foo();
console.log(a);
