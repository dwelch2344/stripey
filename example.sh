#!/bin/bash
curl 'http://localhost:3000/api/customers' \
	-H 'x-stripe-token: STRIPE_JS_TOKEN_HERE' \
	-H 'X-Stripe-Key: STRIPE_SECRET_KEY_HERE' \
	-H 'Content-Type: application/json' \
	--data-binary $'{  "amount": 100,  "customer": {"name": "Andre Kradolfer"},  "description": "Test test",  "metadata": {"foo": "bar"}  }' \
	--compressed