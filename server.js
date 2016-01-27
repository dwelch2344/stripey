var express = require('express')
  , cors = require('cors')
  , app = express()
  , bodyParser = require('body-parser')
  , Stripe = require("stripe")
  , port = 3000;

app.use( bodyParser.json() );       					// to support JSON-encoded bodies
app.use( bodyParser.urlencoded({ extended: true }) );  	// to support URL-encoded bodies
app.use(cors()); 										// support CORS

app.post('/api/customers/', onCustomerPost);

app.listen(port, function(){
  console.log('CORS-enabled web server listening on port', port);
});

// Example Payload for creating a customer (AND CHARING)
/*
// HEADERS 
{
	"x-stripe-key": "STRIPE_SECRET_KEY_HERE",
	"x-stripe-token": "STRIPE_TOKEN_FROM_STRIPE.JS_LIB"
}


// BODY
{
  "amount": 100,
  "customer": {
    "name": "Andre Kradolfer"
  },
  "description": "Test test",
  "metadata": {
    "foo": "bar"
  }
}

*/



function onCustomerPost(req, res, next){

	var key = req.headers['x-stripe-key'];
	// the newly created customer's token
	var token = req.headers['x-stripe-token'];

	console.log('Attempting connection with stripe key', key);
	console.log('Using token ', token);

	

	var stripe = Stripe(key);
	stripe.customers.create({
		description: req.body.customer.name,
		source: token,
	}, onCustomer);

	function onError(err, msg){
		console.warn('Failed:', err);
		res.json({
			msg: msg,
			error: err
		});
	}

	function onComplete(){
	  	res.jsonp({
	  		msg: 'This is CORS-enabled for all origins!',
	  		body: req.body,
	  		headers: req.headers
		});
	}

	function onChargeComplete(chargeErr, charge, customer) {
		if(chargeErr){
			return onError(chargeErr, 'We created a customer, but failed to charge them...');
		}

		onComplete(customer, charge);		
	}

	function onCustomer(custErr, customer){
		if( custErr ){
			return onError(custErr, 'There was an error creating the customer');
		}

		console.log('Created customer', customer);

		stripe.charges.create({	
			currency: "usd",
			customer: customer.id,			
			amount: req.body.amount,
			metadata: req.body.metadata,
			description: req.body.description	
		}, function(chargeErr, charge){
			onChargeComplete(chargeErr, charge, customer);
		});
	}
}
