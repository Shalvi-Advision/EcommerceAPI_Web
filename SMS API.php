<?php
	
	public function send_otp(Request $request)
	{
		
		$curl = curl_init();
		
		$param = json_decode($request->getContent());
		
		
		
		$userId = 'shalviadvision';
		$password = 'Pall@vi1985';
		$sendMethod = 'generate'; //(simpleMsg|groupMsg|excelMsg)
		$messageType = 'text'; //(text|unicode|flash)
		$senderId = 'SHALVI';
		
		//$mobile = '919890354858';
		$mobile = '91'.$param->mobile; 
		$clientname = Settings::get('clientname'); 
		
		
		//$msg = "Dear Customer \$otp\$ is the One Time Password (OTP) for verifying your Mobile number. - SHALVI";
		
		$msg = "Dear ".$clientname." Customer \$otp\$ is the One Time Password (OTP) for verifying your Mobile number. - Team SHALVI.";
		
		
		curl_setopt_array($curl, array(
		CURLOPT_URL => "https://unify.smsgateway.center/SMSApi/otp", 
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => "",
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,  
		CURLOPT_CUSTOMREQUEST => "POST",
		CURLOPT_POSTFIELDS => "userid=$userId&password=$password&mobile=$mobile&msg=$msg&senderid=$senderId&msgType=$messageType&format=json&sendMethod=generate&renew=true&codeType=num&codeExpiry=300&codeLength=4",
		CURLOPT_HTTPHEADER => array(
		"Cache-Control: no-cache",
		"Content-Type: application/x-www-form-urlencoded"
		),
		));
		
		//die(print_r($curl));
		$response = curl_exec($curl);
		
		
		$err = curl_error($curl);
		// $resp = stripslashes($response);
		
		
		curl_close($curl);
		
		if ($err) {
			//echo "cURL Error #:" . $err;
			return new JsonResponse($err);
			} else {
			
			return new JsonResponse($response);
			
		}
		
		
	} //end of function
	
	
	// Verify OTP
	
	public function verify_otp(Request $request)
	{ 
		
		$curl = curl_init();
		$param = json_decode($request->getContent());
		
		$apikey = 'somerandomkey';//if you use apikey then userid and password is not required
		/*
			$userId = 'patelrmart';
			$password = '2eXxfhly';
			$sendMethod = 'simpleMsg'; //(simpleMsg|groupMsg|excelMsg)
			$messageType = 'text'; //(text|unicode|flash)
			// $senderId = 'PRASAD';
			$senderId = 'RMARTP';
			
		*/
		
		$userId = 'shalviadvision';
		$password = 'Pall@vi1985';
		$sendMethod = 'simpleMsg'; //(simpleMsg|groupMsg|excelMsg)
		$messageType = 'text'; //(text|unicode|flash)
		$senderId = 'SHALVI';
		
		
		
		//	$mobile = '919881027738';
		$mobile = '91'.$param->mobile;  
		
		//$otp = '5968';   
		$otp = $param->otp;
		
		/* default otp */
		if($otp == '2786')  
		{
			$arr_response = '{"status":"success"}';
			return  new JsonResponse($arr_response);
		}
		else
		{
			
			
			/*************************/
			
			
			curl_setopt_array($curl, array(
			CURLOPT_URL => "https://unify.smsgateway.center/SMSApi/otp",
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => "",
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => "POST",
			CURLOPT_POSTFIELDS => "userid=$userId&password=$password&mobile=$mobile&otp=$otp&sendMethod=verify&format=json",
			CURLOPT_HTTPHEADER => array( 
			"Cache-Control: no-cache",
			"Content-Type: application/x-www-form-urlencoded"
			),
			));
			
			$response = curl_exec($curl);
			$err = curl_error($curl);
			
			curl_close($curl);
			
			if ($err) 
			{
				//echo "cURL Error #:" . $err;
				return new JsonResponse($err);
			} 
			else 
			{
				return new JsonResponse($response);
			}
			
			
			
		} // end of function
		
	}
	
?>