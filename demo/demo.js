class People {
  constructor() {
    this.name = 'people';
    this.state = {
      a:1,
      b:2
    }
  }
  sayHello() {
    console.log('sayHello');
  }
}

class Man extends People {
  constructor() {
    super()
    console.log(this.state);
    this.sayHello();
  }

}
let a = new Man();
