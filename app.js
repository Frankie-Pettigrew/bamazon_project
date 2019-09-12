var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Sl1metime",
    database: "bamazonDB"
});


// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    init();
});

// function which prompts the user for what action they should take
function init() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt([{
            name: "choice",
            type: "rawlist",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].product_name);
                }
                return choiceArray;
            },
            message: "What item would you like to buy?"
        }]).then(function (answer) {
            // get the information of the chosen item
            var chosenItem;
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name === answer.choice) {
                    chosenItem = res[i];
                    // console.log(chosenItem);
                }
            }

            inquirer.prompt({
                name: "stockQ",
                type: "number",
                message: "How many would you like to buy?"
            }).then(function(answer){
                // console.log(chosenItem);
                if(answer.stockQ > chosenItem.stock_quantity){
                    init();
                    console.log("Sorry, there are not enough items in stock to complete this order.")
                } else {
                    connection.query("update products set ? where ?",[
                        {
                            stock_quantity: chosenItem.stock_quantity - answer.stockQ
                        },{
                            item_id: chosenItem.item_id
                        }
                    ])

                    console.log("Total price of order: $" + Math.floor(answer.stockQ * chosenItem.price));
                }
            });

        });

    });
}